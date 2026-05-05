/* ============================================================
   resume-loader.js — Fetch & parse a Markdown resume, then
   populate the portfolio HTML dynamically.

   Usage:
     1. Set window.RESUME_FILE to your markdown filename (default: 'asset/resumes/Resume.md')
     2. Include this script after main.js in index.html
     3. Swap the markdown file anytime — the site rebuilds on load.
   ============================================================ */

(function () {
  'use strict';

  var RESUME_FILE = window.RESUME_FILE || 'asset/resumes/Resume.md';

  // ---- Helpers ----

  function stripMd(text) {
    if (!text) return '';
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')   // bold
      .replace(/\*(.*?)\*/g, '$1')        // italic
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // links → text only
      .replace(/\\-/g, '-')              // escaped dashes
      .replace(/\\&/g, '&')
      .trim();
  }

  function extractLink(md) {
    var m = md.match(/\[(.*?)\]\((.*?)\)/);
    return m ? { text: stripMd(m[1]), url: m[2] } : null;
  }

  function extractAllLinks(md) {
    var links = [];
    var re = /\[(.*?)\]\((.*?)\)/g;
    var m;
    while ((m = re.exec(md)) !== null) {
      links.push({ text: stripMd(m[1]), url: m[2] });
    }
    return links;
  }

  // ---- Section Splitter ----

  function splitSections(md) {
    var lines = md.split('\n');
    var sections = {};
    var currentKey = '_header';
    var buffer = [];

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var heading = line.match(/^#\s+\**(.+?)\**\s*$/);
      if (heading) {
        sections[currentKey] = buffer;
        currentKey = heading[1].replace(/\*/g, '').trim().toUpperCase();
        buffer = [];
      } else {
        buffer.push(line);
      }
    }
    sections[currentKey] = buffer;
    return sections;
  }

  // ---- Parsers ----

  function parseHeader(lines) {
    var name = '';
    var email = '';
    var linkedin = '';
    var linkedinUrl = '';
    var phone = '';
    var github = '';
    var githubUrl = '';

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line) continue;

      // Name: first non-empty bold text
      if (!name) {
        var nameMatch = line.match(/\*\*(.+?)\*\*/);
        if (nameMatch) name = nameMatch[1];
      }

      // Email
      var emailMatch = line.match(/mailto:([\w.+%-]+@[\w.-]+)/);
      if (emailMatch) email = emailMatch[1];

      // LinkedIn
      var liMatch = line.match(/\[([^\]]*linkedin[^\]]*)\]\((https?:\/\/[^\)]+linkedin[^\)]*)\)/i);
      if (liMatch) {
        linkedin = liMatch[1];
        linkedinUrl = liMatch[2];
      }
      if (!linkedinUrl) {
        var liText = line.match(/linkedin\.com\/in\/([\w-]+)/i);
        if (liText) {
          linkedin = 'linkedin.com/in/' + liText[1];
          linkedinUrl = 'https://www.linkedin.com/in/' + liText[1];
        }
      }

      // Phone
      var phoneMatch = line.match(/Phone:\s*([\d\-\(\)\s\+]+)/i);
      if (phoneMatch) phone = phoneMatch[1].trim();

      // GitHub
      var ghMatch = line.match(/\[([^\]]*github[^\]]*)\]\((https?:\/\/[^\)]+github[^\)]*)\)/i);
      if (ghMatch) {
        github = ghMatch[1];
        githubUrl = ghMatch[2];
      }
    }

    return { name: name, email: email, linkedin: linkedin, linkedinUrl: linkedinUrl, phone: phone, github: github, githubUrl: githubUrl };
  }

  function parseSummary(lines) {
    return lines.map(function (l) { return l.trim(); }).filter(Boolean).join(' ');
  }

  function parseEducation(lines) {
    var entries = [];
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line) continue;
      var school = '';
      var degree = '';
      var gpa = '';
      var graduated = '';

      var schoolMatch = line.match(/\*\*(.+?)\*\*/);
      if (schoolMatch) school = schoolMatch[1];

      var degreeMatch = line.match(/\|\s*(.+?)(?:\s*\\?-\s*|\s*$)/);
      if (degreeMatch) degree = stripMd(degreeMatch[1]).replace(/\s*$/, '');

      var gpaMatch = line.match(/([\d.]+)\s*\/\s*([\d.]+)\s*GPA/i);
      if (gpaMatch) gpa = gpaMatch[1] + '/' + gpaMatch[2];

      var gradMatch = line.match(/(?:Graduated|Grad)\s+(.+)/i);
      if (gradMatch) graduated = stripMd(gradMatch[1]);

      if (school) {
        entries.push({ school: school, degree: degree, gpa: gpa, graduated: graduated, raw: stripMd(line) });
      }
    }
    return entries;
  }

  function parseExperience(lines) {
    var entries = [];
    var current = null;

    for (var i = 0; i < lines.length; i++) {
      var raw = lines[i];
      var line = raw.trim();
      if (!line) continue;

      // Detect company heading: bold text on its own line, no bullet
      var companyMatch = line.match(/^\*\*(.+?)\*\*\s*$/);
      if (companyMatch && line.indexOf('•') < 0) {
        // Could be a company name or a role
        var nextNonEmpty = '';
        for (var j = i + 1; j < lines.length; j++) {
          if (lines[j].trim()) { nextNonEmpty = lines[j].trim(); break; }
        }
        // If the next line contains a date range or bold role, this is a company
        if (nextNonEmpty && (nextNonEmpty.match(/\d{4}/) || nextNonEmpty.match(/Present/i) || nextNonEmpty.match(/^\s*\*\*/))) {
          if (current) entries.push(current);
          current = { company: companyMatch[1], roles: [] };
          continue;
        }
      }

      // Detect bullet point (must check before bold-text patterns)
      if (line.startsWith('* ') || line.startsWith('- ')) {
        var bullet = stripMd(line.replace(/^\*\s+/, '').replace(/^-\s+/, ''));
        if (current && current.roles.length > 0) {
          current.roles[current.roles.length - 1].bullets.push(bullet);
        }
        continue;
      }

      // Standalone company/role with pipe or dash separator
      // e.g. "**University of Washington** | *Teaching Assistant*  *Feb 2022 \- July 2022*"
      // e.g. "**University of Washington** \- *Intern | Software Development in Test*  *July 2021 \- Sep 2021*"
      // Must check BEFORE generic role detection
      var standaloneMatch = line.match(/\*\*(.+?)\*\*/);
      if (standaloneMatch && (line.indexOf('|') > -1 || line.match(/\*\*.*?\*\*\s*\\?-\s*\*/))) {
        if (current) entries.push(current);

        var comp = standaloneMatch[1];

        // Extract all *...* italic segments
        var italicSegments = [];
        var italicRe = /\*([^*]+)\*/g;
        var im;
        // Skip bold markers first — work on the part after **...**
        var afterBold = line.replace(/\*\*(.+?)\*\*/, '');
        while ((im = italicRe.exec(afterBold)) !== null) {
          italicSegments.push(stripMd(im[1]));
        }

        // Last segment with a year is the date; everything else is the title
        var titleSegments = [];
        var dateStr = '';
        for (var si = italicSegments.length - 1; si >= 0; si--) {
          if (!dateStr && italicSegments[si].match(/\d{4}/)) {
            dateStr = italicSegments[si];
          } else {
            titleSegments.unshift(italicSegments[si]);
          }
        }

        // If no italic title found, try extracting from pipe/dash split
        var titlePart = titleSegments.join(' ').trim();
        if (!titlePart) {
          var sepMatch = afterBold.match(/[\|\\?\-]\s*(.+?)(?:\*|$)/);
          if (sepMatch) titlePart = stripMd(sepMatch[1]);
        }

        current = { company: comp, roles: [{ title: titlePart, dates: dateStr, bullets: [] }] };
        continue;
      }

      // Detect role line: bold text followed by a date range (sub-role under current company)
      var roleMatch = line.match(/\*\*(.+?)\*\*.*?(\*(.+?)\*|\d{4})/);
      if (roleMatch && !line.startsWith('* ')) {
        var role = stripMd(roleMatch[1]);
        var dateMatch = line.match(/\*([^*]*\d{4}[^*]*(?:Present)?[^*]*)\*/);
        var dates = dateMatch ? stripMd(dateMatch[1]) : '';

        if (!current) {
          current = { company: role, roles: [] };
        }
        current.roles.push({ title: role, dates: dates, bullets: [] });
        continue;
      }
    }
    if (current) entries.push(current);
    return entries;
  }

  function parseSkills(lines) {
    var categories = [];
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line) continue;
      var match = line.match(/\*\*(.+?)\*\*\s*:\s*(.+)/);
      if (match) {
        var items = match[2].split(',').map(function (s) { return s.trim(); }).filter(Boolean);
        categories.push({ name: match[1], items: items });
      }
    }
    return categories;
  }

  function parseProjects(lines) {
    var projects = [];
    var current = null;

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line) continue;

      // Project heading: link with bold text or bold text with link
      var projLink = line.match(/\[.*?\*\*(.+?)\*\*.*?\]\((.+?)\)/);
      if (projLink) {
        if (current) projects.push(current);

        // Extract all *...* italic segments from the line (after the link)
        var afterLink = line.replace(/\[.*?\]\(.*?\)/, '');
        // Strip bold markers first so they don't interfere with italic extraction
        var afterLinkClean = afterLink.replace(/\*\*[^*]*?\*\*/g, '');
        var italicSegs = [];
        var itRe = /\*([^*]+)\*/g;
        var itm;
        while ((itm = itRe.exec(afterLinkClean)) !== null) {
          italicSegs.push(stripMd(itm[1]));
        }

        // Last segment with a year is the date; others are the type/subtitle
        var type = '';
        var dates = '';
        var typeSegs = [];
        for (var si = italicSegs.length - 1; si >= 0; si--) {
          if (!dates && italicSegs[si].match(/\d{4}/)) {
            dates = italicSegs[si];
          } else {
            typeSegs.unshift(italicSegs[si]);
          }
        }
        type = typeSegs.join(' ').replace(/^[\-\s]+/, '').trim();

        // Also check for non-italic type text (e.g., "**\-** Web Application")
        if (!type) {
          var plainType = afterLink.replace(/\*\*.*?\*\*/g, '').replace(/\*[^*]+\*/g, '').replace(/[\\*\-]+/g, ' ').trim();
          if (plainType) type = plainType;
        }

        // Extract secondary link (live site URL) if present on the same heading line
        var allProjLinks = extractAllLinks(line);
        var siteUrl = allProjLinks.length > 1 ? allProjLinks[1].url : '';
        current = { title: projLink[1], url: projLink[2], siteUrl: siteUrl, type: type, dates: dates, bullets: [] };
        continue;
      }

      // Bullet point
      if ((line.startsWith('* ') || line.startsWith('- ')) && current) {
        current.bullets.push(stripMd(line.replace(/^\*\s+/, '').replace(/^-\s+/, '')));
        continue;
      }
    }
    if (current) projects.push(current);
    return projects;
  }

  function parseCertifications(lines) {
    var certs = [];
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line || !line.startsWith('*')) continue;
      line = line.replace(/^\*\s+/, '');

      var link = extractLink(line);
      var name = '';
      var code = '';
      var desc = '';

      var codeMatch = line.match(/\(([A-Z]{2,}-?\d{3,})\)/);
      if (codeMatch) code = codeMatch[1];

      if (link) {
        name = link.text;
      } else {
        var boldMatch = line.match(/\*\*(.+?)\*\*/);
        if (boldMatch) name = boldMatch[1];
      }

      var descMatch = line.match(/\):\s*(.+)/);
      if (descMatch) desc = stripMd(descMatch[1]);

      certs.push({ name: name, code: code, url: link ? link.url : '', description: desc });
    }
    return certs;
  }

  function parseGenericBullets(lines) {
    var entries = [];
    var current = null;

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line) continue;

      if (line.startsWith('* ') || line.startsWith('- ')) {
        if (current) {
          current.bullets.push(stripMd(line.replace(/^\*\s+/, '').replace(/^-\s+/, '')));
        }
      } else {
        if (current) entries.push(current);
        var dateMatch = line.match(/\*([^*]*\d{4}[^*]*)\*/);
        current = { heading: stripMd(line), dates: dateMatch ? stripMd(dateMatch[1]) : '', bullets: [] };
      }
    }
    if (current) entries.push(current);
    return entries;
  }

  // ---- DOM Injection ----

  function setText(selector, text) {
    var els = document.querySelectorAll(selector);
    for (var i = 0; i < els.length; i++) {
      els[i].textContent = text;
    }
  }

  function setHtml(selector, html) {
    var el = document.querySelector(selector);
    if (el) el.innerHTML = html;
  }

  function setAttr(selector, attr, value) {
    var els = document.querySelectorAll(selector);
    for (var i = 0; i < els.length; i++) {
      els[i].setAttribute(attr, value);
    }
  }

  function populatePage(data) {
    var h = data.header;
    var initials = h.name.split(' ').map(function (w) { return w[0]; }).join('');

    // Extract job title from first phrase of summary (before "with" or first comma)
    var summary = data.summary || '';
    var titleMatch = summary.match(/^(.+?)(?:\s+with\s+|\s*,)/i);
    var jobTitle = titleMatch ? titleMatch[1].trim() : 'Software Engineer';
    // Capitalize first letter of each word
    jobTitle = jobTitle.replace(/\b\w/g, function (c) { return c.toUpperCase(); });

    // ---- Meta & Title ----
    document.title = h.name + ' — ' + jobTitle;
    setText('meta[name="description"]', '');
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', h.name + ' — ' + jobTitle + '. Portfolio showcasing experience, skills, and projects.');

    // ---- Navbar ----
    setText('.navbar__logo', h.name);

    // ---- Hero ----
    setText('.hero__title', h.name);
    setText('.hero__subtitle', jobTitle);
    // Use only the first sentence for the hero tagline to avoid redundancy with About
    var firstSentence = summary.match(/^[^.]+\./);
    setText('.hero__tagline', firstSentence ? firstSentence[0] : summary);

    // ---- About ----
    var aboutPhoto = document.querySelector('.about__photo-placeholder span');
    if (aboutPhoto) aboutPhoto.textContent = initials;

    var aboutText = document.querySelector('.about__text p');
    if (aboutText) aboutText.textContent = summary;

    // Stats
    var stats = document.querySelectorAll('.about__stat-number');
    if (stats.length >= 1) {
      var yearsMatch = summary.match(/(\d+)\+?\s*years/i);
      stats[0].textContent = yearsMatch ? yearsMatch[1] + '+' : '4+';
    }
    if (stats.length >= 2) stats[1].textContent = data.projects.length + '+';
    // stats[2] is the Agents count — managed by agent-loader.js, skip it here
    var techCountEl = document.getElementById('tech-count');
    if (techCountEl) {
      var techCount = 0;
      data.skills.forEach(function (c) { techCount += c.items.length; });
      techCountEl.textContent = techCount + '+';
    }

    // ---- Experience ----
    // Company logo mapping
    var companyLogos = {
      'maq software': 'asset/logo/MAQSoftware-logo-icon.png',
      'microsoft': 'asset/logo/Microsoft-logo-icon.jpg',
      'university of washington': 'asset/logo/UW-logo-icon.png'
    };

    function getCompanyLogo(company) {
      var key = company.toLowerCase();
      for (var name in companyLogos) {
        if (key.indexOf(name) > -1) return companyLogos[name];
      }
      return '';
    }

    var timeline = document.querySelector('.timeline');
    if (timeline) {
      timeline.innerHTML = '';
      data.experience.forEach(function (exp) {
        exp.roles.forEach(function (role) {
          var bullets = role.bullets.map(function (b) { return '<li>' + escapeHtml(b) + '</li>'; }).join('');
          // Use role title for logo if it mentions a known company, otherwise fall back to parent company
          var logoSrc = getCompanyLogo(role.title) || getCompanyLogo(exp.company);
          var logoHtml = logoSrc
            ? '<img src="' + escapeHtml(logoSrc) + '" alt="' + escapeHtml(exp.company) + ' logo" class="timeline__company-logo-img">'
            : '<div class="timeline__company-logo" aria-hidden="true">' + escapeHtml(exp.company.substring(0, 2).toUpperCase()) + '</div>';
          var html =
            '<div class="timeline__item reveal">' +
              '<div class="timeline__dot" aria-hidden="true"></div>' +
              '<div class="timeline__card">' +
                '<div class="timeline__header">' +
                  logoHtml +
                  '<div>' +
                    '<h3 class="timeline__role">' + escapeHtml(role.title || exp.company) + '</h3>' +
                    '<p class="timeline__company">' + escapeHtml(exp.company) + '</p>' +
                  '</div>' +
                '</div>' +
                '<div class="timeline__meta">' +
                  '<span class="badge">' + escapeHtml(role.dates) + '</span>' +
                '</div>' +
                '<ul class="timeline__details">' + bullets + '</ul>' +
              '</div>' +
            '</div>';
          timeline.insertAdjacentHTML('beforeend', html);
        });
      });

      // LinkedIn footer — remove any existing one first to avoid duplicates
      var existingFooter = timeline.parentElement.querySelector('.timeline__footer');
      if (existingFooter) existingFooter.remove();

      if (h.linkedinUrl) {
        timeline.insertAdjacentHTML('afterend',
          '<p class="timeline__footer reveal"><a href="' + escapeHtml(h.linkedinUrl) +
          '" target="_blank" rel="noopener noreferrer">View full experience on LinkedIn →</a></p>');
      }
    }

    // ---- Skills ----
    var skillsGrid = document.querySelector('.skills-grid');
    if (skillsGrid) {
      skillsGrid.innerHTML = '';
      data.skills.forEach(function (cat) {
        var tags = cat.items.map(function (item) {
          return '<span class="skill-tag">' + escapeHtml(item) + '</span>';
        }).join('');
        skillsGrid.insertAdjacentHTML('beforeend',
          '<div class="skills-card reveal">' +
            '<h3 class="skills-card__title">' + escapeHtml(cat.name) + '</h3>' +
            '<div class="skills-card__tags">' + tags + '</div>' +
          '</div>');
      });
    }

    // ---- Projects ----
    var projectsGrid = document.querySelector('.projects-grid');
    if (projectsGrid) {
      projectsGrid.innerHTML = '';
      data.projects.forEach(function (proj) {
        var allBullets = proj.bullets.map(function (b) { return '<li>' + escapeHtml(b) + '</li>'; }).join('');

        var imageHtml = proj.siteUrl
          ? '<div class="project-card__preview">' +
              '<iframe src="' + escapeHtml(proj.siteUrl) + '" title="' + escapeHtml(proj.title) + ' site preview" loading="lazy" sandbox="allow-scripts allow-same-origin" tabindex="-1" aria-hidden="true"></iframe>' +
            '</div>'
          : '<div class="project-card__image">' +
              '<span class="project-card__soon-label">' + escapeHtml(proj.type || 'Project') + '</span>' +
            '</div>';

        var html =
          '<article class="project-card reveal">' +
            imageHtml +
            '<div class="project-card__body">' +
              '<h3 class="project-card__title">' + escapeHtml(proj.title) + '</h3>' +
              (allBullets ? '<ul class="project-card__details">' + allBullets + '</ul>' : '') +
              '<div class="project-card__tags">' +
                (proj.dates ? '<span class="skill-tag skill-tag--sm">' + escapeHtml(proj.dates) + '</span>' : '') +
                (proj.type ? '<span class="skill-tag skill-tag--sm">' + escapeHtml(proj.type) + '</span>' : '') +
              '</div>' +
              '<div class="project-card__links">' +
                (proj.siteUrl ? '<a href="' + escapeHtml(proj.siteUrl) + '" class="project-card__link" target="_blank" rel="noopener noreferrer" aria-label="Live site for ' + escapeHtml(proj.title) + '">🔗 Live Site</a>' : '') +
                (proj.url ? '<a href="' + escapeHtml(proj.url) + '" class="project-card__link" target="_blank" rel="noopener noreferrer">💻 GitHub</a>' : '') +
              '</div>' +
            '</div>' +
          '</article>';
        projectsGrid.insertAdjacentHTML('beforeend', html);
      });
    }

    // ---- Certifications (inject into Interests or new section) ----
    if (data.certifications.length > 0) {
      var certsHtml =
        '<section class="section" id="certifications">' +
          '<div class="container">' +
            '<h2 class="section__title reveal">Certifications</h2>' +
            '<div class="skills-grid">';

      data.certifications.forEach(function (cert) {
        var linkHtml = cert.url
          ? '<a href="' + escapeHtml(cert.url) + '" target="_blank" rel="noopener noreferrer" class="skill-tag">' + escapeHtml(cert.name) + (cert.code ? ' (' + escapeHtml(cert.code) + ')' : '') + '</a>'
          : '<span class="skill-tag">' + escapeHtml(cert.name) + (cert.code ? ' (' + escapeHtml(cert.code) + ')' : '') + '</span>';
        certsHtml +=
          '<div class="skills-card reveal">' +
            '<div class="skills-card__tags">' + linkHtml + '</div>' +
            (cert.description ? '<p style="margin-top:0.5rem;font-size:0.9rem;color:var(--clr-text-muted,#64748b)">' + escapeHtml(cert.description) + '</p>' : '') +
          '</div>';
      });

      certsHtml += '</div></div></section>';

      var interestsSection = document.getElementById('interests');
      if (interestsSection) {
        interestsSection.insertAdjacentHTML('beforebegin', certsHtml);
        // Add Certifications nav link
        var navMenu = document.getElementById('nav-menu');
        if (navMenu) {
          var projectsLink = navMenu.querySelector('a[href="#projects"]');
          if (projectsLink) {
            projectsLink.parentElement.insertAdjacentHTML('afterend',
              '<li role="none"><a href="#certifications" class="navbar__link" role="menuitem">Certifications</a></li>');
          }
        }
      }
    }

    // ---- Education (inject after About) ----
    if (data.education.length > 0) {
      var eduHtml =
        '<section class="section" id="education">' +
          '<div class="container">' +
            '<h2 class="section__title reveal">Education</h2>' +
            '<div class="timeline">';

      data.education.forEach(function (edu) {
        var eduLogoSrc = getCompanyLogo(edu.school);
        var eduLogoHtml = eduLogoSrc
          ? '<img src="' + escapeHtml(eduLogoSrc) + '" alt="' + escapeHtml(edu.school) + ' logo" class="timeline__company-logo-img">'
          : '<div class="timeline__company-logo" aria-hidden="true">🎓</div>';
        eduHtml +=
          '<div class="timeline__item reveal">' +
            '<div class="timeline__dot" aria-hidden="true"></div>' +
            '<div class="timeline__card">' +
              '<div class="timeline__header">' +
                eduLogoHtml +
                '<div>' +
                  '<h3 class="timeline__role">' + escapeHtml(edu.school) + '</h3>' +
                  '<p class="timeline__company">' + escapeHtml(edu.degree) + (edu.gpa ? ' — ' + escapeHtml(edu.gpa) + ' GPA' : '') + '</p>' +
                '</div>' +
              '</div>' +
              (edu.graduated ? '<div class="timeline__meta"><span class="badge">Graduated ' + escapeHtml(edu.graduated) + '</span></div>' : '') +
            '</div>' +
          '</div>';
      });

      eduHtml += '</div></div></section>';

      var expSection = document.getElementById('experience');
      if (expSection) {
        expSection.insertAdjacentHTML('beforebegin', eduHtml);
        // Add Education nav link
        var navMenu2 = document.getElementById('nav-menu');
        if (navMenu2) {
          var aboutLink = navMenu2.querySelector('a[href="#about"]');
          if (aboutLink) {
            aboutLink.parentElement.insertAdjacentHTML('afterend',
              '<li role="none"><a href="#education" class="navbar__link" role="menuitem">Education</a></li>');
          }
        }
      }
    }

    // ---- Contact ----
    if (h.email) {
      var emailLinks = document.querySelectorAll('a[href*="mailto:"]');
      emailLinks.forEach(function (el) {
        el.setAttribute('href', 'mailto:' + h.email);
        el.textContent = h.email;
      });
    }

    if (h.linkedinUrl) {
      var liLinks = document.querySelectorAll('a[href*="linkedin"]');
      liLinks.forEach(function (el) {
        el.setAttribute('href', h.linkedinUrl);
        if (el.textContent.indexOf('LinkedIn') > -1 || el.textContent.indexOf('linkedin') > -1) {
          el.textContent = 'LinkedIn';
        }
      });
    }

    // GitHub links — derive from projects (only update contact & footer links, not project cards)
    var ghUsername = '';
    data.projects.forEach(function (p) {
      if (!ghUsername && p.url) {
        var m = p.url.match(/github\.com\/([^\/]+)/);
        if (m) ghUsername = m[1];
      }
    });
    if (ghUsername) {
      var ghUrl = 'https://github.com/' + ghUsername;
      var contactSection = document.getElementById('contact');
      var footer = document.querySelector('.footer');
      [contactSection, footer].forEach(function (container) {
        if (!container) return;
        var ghLinks = container.querySelectorAll('a[href*="github"]');
        ghLinks.forEach(function (el) {
          el.setAttribute('href', ghUrl);
          if (el.textContent.indexOf('GitHub') > -1) el.textContent = 'GitHub';
        });
      });
    }

    // Footer copyright
    var footerCopy = document.querySelector('.footer__tagline');
    if (footerCopy) footerCopy.innerHTML = '&copy; ' + new Date().getFullYear() + ' ' + escapeHtml(h.name) + '. All rights reserved.';

    // ---- JSON-LD ----
    var jsonLd = document.querySelector('script[type="application/ld+json"]');
    if (jsonLd) {
      var ld = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: h.name,
        jobTitle: 'Software Engineer',
        email: h.email,
        url: window.location.href,
        sameAs: []
      };
      if (h.linkedinUrl) ld.sameAs.push(h.linkedinUrl);
      if (ghUsername) ld.sameAs.push('https://github.com/' + ghUsername);
      jsonLd.textContent = JSON.stringify(ld, null, 2);
    }

    // ---- Re-trigger reveal animations for new elements ----
    reobserveReveals();
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function reobserveReveals() {
    var els = document.querySelectorAll('.reveal:not(.revealed)');
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      els.forEach(function (el) { observer.observe(el); });
    } else {
      els.forEach(function (el) { el.classList.add('revealed'); });
    }
  }

  // ---- Main ----

  function loadResume() {
    fetch(RESUME_FILE)
      .then(function (res) {
        if (!res.ok) throw new Error('Failed to load ' + RESUME_FILE + ' (' + res.status + ')');
        return res.text();
      })
      .then(function (md) {
        var sections = splitSections(md);

        var data = {
          header: parseHeader(sections['_header'] || []),
          summary: parseSummary(sections['SUMMARY'] || []),
          education: parseEducation(sections['EDUCATION'] || []),
          experience: parseExperience(sections['PROFESSIONAL EXPERIENCE'] || []),
          skills: parseSkills(sections['SKILLS'] || []),
          projects: parseProjects(sections['PROJECTS'] || []),
          certifications: parseCertifications(sections['PROFESSIONAL CERTIFICATIONS'] || []),
          leadership: parseGenericBullets(sections['LEADERSHIP & VOLUNTEERS'] || sections['LEADERSHIP AND VOLUNTEERS'] || []),
          honors: parseGenericBullets(sections['HONORS & AWARDS'] || sections['HONORS AND AWARDS'] || [])
        };

        populatePage(data);
      })
      .catch(function (err) {
        console.error('[resume-loader]', err);
      });
  }

  // Load after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadResume);
  } else {
    loadResume();
  }

})();
