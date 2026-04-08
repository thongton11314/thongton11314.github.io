# Personal Portfolio Website — AI Build Prompt

> **How to use:** Copy each **Phase** into a new AI chat session. Complete one phase before moving to the next. This prevents context loss during long interactions.

---

## Technology Choice: Vanilla HTML + CSS + JS

**Why this is the best approach for a personal static site:**

| Option | Pros | Cons |
|---|---|---|
| **Vanilla HTML/CSS/JS** ✅ | Zero build step, instant GitHub Pages deploy, full control, no dependencies, fast loading, easy to maintain | Manual code for everything |
| Jekyll | GitHub Pages native support, Markdown blog posts | Ruby dependency, theme lock-in, slower iteration |
| Hugo | Extremely fast builds, great for blogs | Go dependency, learning curve, overkill for portfolio |
| Next.js/Gatsby | React ecosystem, rich plugins | Node.js build step, complex deploy, heavy for a portfolio |
| Astro | Modern, fast, component-based | Build step required, newer ecosystem |

**Verdict:** For a job-search portfolio with future extensibility, vanilla HTML/CSS/JS gives you the fastest deploy, zero maintenance burden, and complete design control. You can always migrate later.

---

## Project Structure

```
username.github.io/
├── index.html          ← Single-page site (all sections)
├── css/
│   └── style.css       ← All styles
├── js/
│   └── main.js         ← Interactivity (nav, scroll, theme)
├── assets/
│   ├── images/         ← Profile photo, project screenshots
│   └── resume/         ← Downloadable resume PDF
├── projects/           ← Future: individual project pages
│   └── template.html   ← Reusable project detail template
└── README.md
```

---

## Site Sections Overview

1. **Hero / Header** — Name, title, tagline, CTA buttons
2. **About Me** — Professional summary, photo
3. **Experience** — Work history timeline
4. **Skills** — Technical & soft skills grid
5. **Projects** — Placeholder grid (extensible)
6. **Interests & Hobbies** — Professional presentation of personal interests
7. **Contact** — Email, LinkedIn, GitHub links
8. **Footer** — Copyright, quick links

---

# PHASE 1 — Foundation & Hero Section

Copy the prompt below into a fresh AI chat:

---

```
I'm building a personal portfolio website using vanilla HTML, CSS, and JavaScript,
hosted on GitHub Pages. Help me create the foundation files.

## Design Requirements
- Bright, professional theme (white background, accent color: #2563EB blue)
- Clean sans-serif typography (Inter from Google Fonts)
- Fully responsive (mobile-first)
- Smooth scroll navigation
- Subtle animations on scroll (CSS only, no heavy libraries)

## File Structure
Create these files:
1. index.html — with proper meta tags, Open Graph tags, favicon placeholder
2. css/style.css — CSS custom properties for theming, reset, base styles
3. js/main.js — mobile nav toggle, smooth scroll, scroll-based nav highlight

## Sections to build in this phase

### Navigation Bar
- Fixed top navigation, transparent → white background on scroll
- Logo/name on the left
- Menu links: About, Experience, Skills, Projects, Interests, Contact
- Hamburger menu on mobile
- "Download Resume" button styled as accent CTA

### Hero Section
- Full viewport height
- Large heading: "[Your Name]" (use placeholder)
- Subtitle: "[Your Title — e.g., Software Engineer]"
- Brief tagline (1-2 sentences, placeholder text)
- Two CTA buttons: "View My Work" (scrolls to Projects) and "Get in Touch" (scrolls to Contact)
- Subtle gradient or geometric background decoration (CSS only)

## CSS Architecture
- Use CSS custom properties for all colors, spacing, fonts
- Mobile-first breakpoints: 768px (tablet), 1024px (desktop)
- BEM-like class naming
- Utility classes for common patterns (flex, grid, spacing)

## Color Palette (CSS variables)
--color-primary: #2563EB
--color-primary-light: #3B82F6
--color-primary-dark: #1D4ED8
--color-accent: #F59E0B
--color-bg: #FFFFFF
--color-bg-alt: #F8FAFC
--color-text: #1E293B
--color-text-light: #64748B
--color-border: #E2E8F0

Please generate all three files with clean, well-commented code.
```

---

# PHASE 2 — About Me & Experience Sections

Copy this prompt into the SAME or a NEW chat, pasting your current `index.html` and `style.css`:

---

```
I have a personal portfolio website in progress. Here are my current files:

[PASTE your index.html here]
[PASTE your css/style.css here]

Add these two sections to the page:

### About Me Section
- Two-column layout (image left, text right — stacks on mobile)
- Circular profile photo placeholder (use a colored div with initials as placeholder)
- Professional summary paragraph (use placeholder lorem text but structure it as:
  sentence about current role → sentence about expertise → sentence about what drives you)
- Small stats row below text: "X+ Years Experience" | "Y+ Projects" | "Z+ Technologies"
- Light background (#F8FAFC) to alternate with white sections

### Experience Section
- Vertical timeline layout on desktop, simple card stack on mobile
- Timeline line on the left with colored dots at each entry
- Each entry card contains:
  - Company name + Logo placeholder
  - Job title (bold)
  - Date range (styled as badge/tag)
  - Location
  - 3-4 bullet points of responsibilities/achievements
- Include 2-3 placeholder entries to show the pattern
- "Earlier experience available on LinkedIn" link at bottom
- Use CSS grid/flexbox, no tables

Keep all existing styles. Add new styles at the end of style.css.
Match the existing color palette and typography.
```

---

# PHASE 3 — Skills Section

```
I have a personal portfolio website in progress. Here are my current files:

[PASTE your index.html here]
[PASTE your css/style.css here]

Add a Skills section after the Experience section:

### Skills Section
- Section title: "Skills & Technologies"
- Organized into categories displayed as cards:
  - "Languages & Frameworks"
  - "Tools & Platforms"
  - "Soft Skills"
  (Adjust categories to your actual skills)
- Each skill shown as a styled tag/pill/badge inside its category card
- Clean grid layout: 3 columns on desktop, 2 on tablet, 1 on mobile
- Use the accent color palette for skill tags
- Subtle hover effect on tags
- Use placeholder skill names (Python, JavaScript, React, Docker, AWS, Git,
  Communication, Problem Solving, etc.)
- White background section

Keep all existing styles and sections intact. Append new CSS to style.css.
```

---

# PHASE 4 — Projects Section (Extensible)

```
I have a personal portfolio website in progress. Here are my current files:

[PASTE your index.html here]
[PASTE your css/style.css here]

Add a Projects section. I don't have projects yet, but the structure must be
easy to extend later.

### Projects Section
- Section title: "Projects"
- Brief intro text: "Here are some projects I've worked on. More coming soon!"
- Grid of project cards: 3 columns desktop, 2 tablet, 1 mobile
- Each project card contains:
  - Screenshot/thumbnail placeholder (colored gradient rectangle)
  - Project title
  - Short description (2 lines max)
  - Technology tags (small pills)
  - Two icon-links: "Live Demo" and "GitHub Repo"
- Include 2-3 placeholder cards with "Coming Soon" styling:
  - Slightly muted/dashed border
  - "🚧 Coming Soon" label
  - Still looks clean and intentional, not broken
- Light background section (#F8FAFC)

### Extensibility
- Comment the HTML clearly so adding a new project card is copy-paste simple
- Include a template comment block:
  <!-- PROJECT CARD TEMPLATE — Copy this block to add a new project
       1. Replace the image src
       2. Update title and description
       3. Update tech tags
       4. Add demo and repo links
  -->

Also create a file: projects/template.html
- A standalone project detail page template
- Matches the main site's nav and footer
- Has sections for: Project overview, screenshots, tech stack, challenges,
  links
- This is for future use when I want dedicated project pages

Keep all existing styles and sections intact. Append new CSS.
```

---

# PHASE 5 — Interests & Hobbies Section

```
I have a personal portfolio website in progress. Here are my current files:

[PASTE your index.html here]
[PASTE your css/style.css here]

Add an "Interests & Hobbies" section after Projects. This section must remain
fully PROFESSIONAL — it should feel like the "personal touch" section of a
polished portfolio, not a casual blog.

### Interests Section
- Section title: "Beyond Work" or "Interests"
- Brief intro: one sentence about being a well-rounded individual
- Display as a card grid (2 or 3 columns desktop, 1 mobile)
- Each card represents one interest:

1. **Sports & Fitness**
   - Icon: 🏃 or sports icon
   - Title: "Sports & Active Living"
   - Professional framing: "Passionate about teamwork and discipline
     through competitive sports. Regular participant in [sport].
     Values the parallels between athletic training and professional growth."

2. **Photography**
   - Icon: 📷 or camera icon
   - Title: "Visual Storytelling"
   - Professional framing: "Capturing moments through photography —
     developing an eye for composition, lighting, and detail.
     A practice that strengthens observation and creative thinking."

3. **Philosophy & Reading**
   - Icon: 📚 or book icon
   - Title: "Philosophy & Critical Thinking"
   - Professional framing: "Avid reader of philosophy and classical texts.
     Enjoys exploring Stoicism, existentialism, and ethical frameworks
     that inform thoughtful decision-making."

4. **Economics & Current Affairs**
   - Icon: 📊 or chart icon
   - Title: "Economics & Global Perspectives"
   - Professional framing: "Keen interest in macroeconomics, market trends,
     and public policy. Enjoys analyzing how economic forces shape
     technology and society."

- Each card should have:
  - A colored icon or emoji at top
  - Title
  - 2-3 sentence description (professional tone)
  - Subtle border and shadow, hover lift effect
- White background section
- The tone throughout must suggest: "This person is intellectually curious,
  disciplined, and well-rounded" — NOT "here are my hobbies"

Keep all existing styles and sections intact. Append new CSS.
```

---

# PHASE 6 — Contact Section & Footer

```
I have a personal portfolio website in progress. Here are my current files:

[PASTE your index.html here]
[PASTE your css/style.css here]

Add the Contact section and Footer:

### Contact Section
- Section title: "Get in Touch"
- Two-column layout:
  - Left: Heading + paragraph inviting visitors to reach out, followed by
    contact info items (email, location, LinkedIn — each with an icon)
  - Right: Simple contact form with fields:
    - Name (required)
    - Email (required)
    - Subject
    - Message (textarea, required)
    - Submit button (accent color)
  - Form action: use https://formspree.io/ as the backend
    (placeholder action URL — user will register later)
  - Form validation via HTML5 required attributes + JS validation
- Light background (#F8FAFC)

### Footer
- Dark background (#1E293B) with light text
- Three columns:
  - Quick links: About, Experience, Projects, Contact
  - Social links: GitHub, LinkedIn, Email (icon links)
  - Short tagline or copyright: "© 2026 [Your Name]. All rights reserved."
- Responsive: stacks on mobile
- Back-to-top button (smooth scroll)

### Final JS additions to main.js:
- Form validation with user-friendly error messages
- Back-to-top button show/hide on scroll
- Scroll-reveal animation for all sections (simple CSS class toggle
  using IntersectionObserver)
- Active nav link highlighting based on scroll position

Keep all existing styles and sections intact. Append new CSS and JS.
```

---

# PHASE 7 — Polish, Accessibility & Performance

```
I have my complete personal portfolio website. Here are all files:

[PASTE index.html]
[PASTE css/style.css]
[PASTE js/main.js]

Review and improve the site for production readiness:

### Accessibility (a11y)
- Add proper ARIA labels to navigation, buttons, form fields
- Ensure all interactive elements are keyboard accessible
- Add skip-to-content link
- Check color contrast ratios meet WCAG AA
- Add alt text placeholders for all images
- Ensure focus styles are visible

### Performance
- Add loading="lazy" to images below the fold
- Add preconnect for Google Fonts
- Minify-ready structure (clean comments for dev, no inline styles)
- Add proper meta description and keywords

### SEO
- Structured data (JSON-LD) for Person schema
- Open Graph and Twitter Card meta tags
- Canonical URL placeholder
- Sitemap.xml
- robots.txt

### Print Styles
- Add @media print CSS that creates a clean, resume-like printout
- Hide navigation, footer, decorative elements in print

### Final Touches
- Verify all placeholder text is clearly marked with [BRACKETS]
  so I can find-and-replace easily
- Ensure consistent spacing, typography, and color usage
- Test responsiveness: 320px, 768px, 1024px, 1440px
- Add favicon placeholder instructions as HTML comment

Generate the final versions of all files.
```

---

# PHASE 8 — GitHub Pages Deployment

This phase is a step-by-step guide (no AI needed, but you can ask AI for help):

```
## Deploying to GitHub Pages — Step by Step

### Prerequisites
- A GitHub account (https://github.com/signup — free)
- Git installed on your computer (https://git-scm.com/downloads)

### Step 1: Create the Repository
1. Go to https://github.com/new
2. Repository name: `yourusername.github.io`
   (replace "yourusername" with your actual GitHub username — MUST match exactly)
3. Set to **Public**
4. Do NOT initialize with README (you already have files)
5. Click "Create repository"

### Step 2: Push Your Code
Open a terminal in your project folder and run:

git init
git add .
git commit -m "Initial portfolio site"
git branch -M main
git remote add origin https://github.com/yourusername/yourusername.github.io.git
git push -u origin main

### Step 3: Enable GitHub Pages
1. Go to your repository → Settings → Pages
2. Source: "Deploy from a branch"
3. Branch: main, folder: / (root)
4. Click Save

### Step 4: Verify
- Wait 1-2 minutes
- Visit: https://yourusername.github.io
- Your site should be live!

### Step 5: Custom Domain (Optional)
1. Buy a domain (Namecheap, Google Domains, Cloudflare, etc.)
2. In repo Settings → Pages → Custom domain: enter your domain
3. Add DNS records:
   - A records pointing to GitHub's IPs:
     185.199.108.153
     185.199.109.153
     185.199.110.153
     185.199.111.153
   - CNAME record: www → yourusername.github.io
4. Check "Enforce HTTPS"

### Updating Your Site
Whenever you change files:
git add .
git commit -m "Update: description of change"
git push

Changes go live within 1-2 minutes.
```

---

# Quick Reference: Adding a New Project Later

```
To add a new project to your portfolio:

1. Open index.html
2. Find the <!-- PROJECT CARD TEMPLATE --> comment in the Projects section
3. Copy the template block
4. Paste it before the "Coming Soon" cards
5. Fill in:
   - Project screenshot (put image in assets/images/)
   - Title
   - Description
   - Tech tags
   - Demo URL and GitHub repo URL
6. Optionally remove one "Coming Soon" card
7. Commit and push:
   git add .
   git commit -m "Add project: [Project Name]"
   git push
```

---

# Tips for Best Results

1. **One phase per chat session** — prevents the AI from losing track of earlier code
2. **Always paste your current files** — the AI needs the full context to add code correctly
3. **Replace placeholders** — search for `[` in your files to find all placeholder text
4. **Test locally first** — open `index.html` in a browser before pushing to GitHub
5. **Use VS Code Live Server** — install the "Live Server" extension for hot-reload during development
6. **Image optimization** — before adding images, compress them at https://squoosh.app
7. **Profile photo** — use a professional headshot, minimum 400x400px
