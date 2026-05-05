/* ============================================================
   agent-loader.js — Fetch & parse agent.md, then render
   agent cards into the #agents-grid container and update
   the Agents stat in the About section.

   Data format (asset/agents/agent.md):
   ---
   count: 6
   ---

   ## Agent Name
   **Type:** Type
   **Status:** Active | Experimental | Deprecated
   **Icon:** emoji
   **Tools:** Tool1, Tool2, Tool3
   **Description:** Short description of what the agent does.
   ============================================================ */

(function () {
  'use strict';

  var AGENTS_FILE = window.AGENTS_FILE || 'asset/agents/agent.md';

  // ---- Helpers ----

  function stripMd(text) {
    if (!text) return '';
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .trim();
  }

  function getField(lines, fieldName) {
    for (var i = 0; i < lines.length; i++) {
      var re = new RegExp('^\\*\\*' + fieldName + ':\\*\\*\\s*(.+)$');
      var m = lines[i].trim().match(re);
      if (m) return m[1].trim();
    }
    return '';
  }

  // ---- Frontmatter Parser ----

  function parseFrontmatter(md) {
    var result = { count: null, body: md };
    // Normalize CRLF so regex anchors work on Windows-style files
    md = md.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    var fmMatch = md.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
    if (!fmMatch) return result;

    var yamlBlock = fmMatch[1];
    result.body = fmMatch[2];

    var countMatch = yamlBlock.match(/count:\s*(\d+)/);
    if (countMatch) result.count = parseInt(countMatch[1], 10);

    return result;
  }

  // ---- Agent Block Parser ----

  function parseAgents(body) {
    var agents = [];
    // Normalize CRLF so regex line anchors work correctly
    var lines = body.replace(/\r/g, '').split('\n');
    var current = null;

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var h2 = line.match(/^##\s+(.+)$/);
      if (h2) {
        if (current) agents.push(current);
        current = { name: h2[1].trim(), lines: [] };
      } else if (current) {
        current.lines.push(line);
      }
    }
    if (current) agents.push(current);

    return agents.map(function (a) {
      return {
        name:        a.name,
        type:        getField(a.lines, 'Type'),
        status:      getField(a.lines, 'Status'),
        icon:        getField(a.lines, 'Icon') || '🤖',
        tools:       getField(a.lines, 'Tools'),
        description: getField(a.lines, 'Description')
      };
    });
  }

  // ---- Card Renderer ----

  function statusClass(status) {
    if (!status) return '';
    var s = status.toLowerCase();
    if (s === 'active')       return 'agent-card__badge--active';
    if (s === 'experimental') return 'agent-card__badge--experimental';
    if (s === 'deprecated')   return 'agent-card__badge--deprecated';
    return '';
  }

  function renderCard(agent) {
    var toolTags = '';
    if (agent.tools) {
      agent.tools.split(',').forEach(function (t) {
        toolTags += '<span class="skill-tag skill-tag--sm">' + t.trim() + '</span>';
      });
    }

    return [
      '<article class="agent-card reveal">',
      '  <div class="agent-card__image">',
      '    <span class="agent-card__type">' + agent.type + '</span>',
      '    <span class="agent-card__badge ' + statusClass(agent.status) + '">' + agent.status + '</span>',
      '  </div>',
      '  <div class="agent-card__body">',
      '    <h3 class="agent-card__name">' + agent.name + '</h3>',
      '    <p class="agent-card__desc">' + agent.description + '</p>',
      '    <div class="agent-card__tools">' + toolTags + '</div>',
      '  </div>',
      '</article>'
    ].join('\n');
  }

  // ---- DOM Update ----

  function updateAgentStat(count) {
    var el = document.getElementById('agent-count');
    if (el) el.textContent = count + '+';
  }

  function renderAgents(agents) {
    var grid = document.getElementById('agents-grid');
    if (!grid) return;

    if (!agents || agents.length === 0) {
      grid.innerHTML = '<p class="agents-empty">No agents found. Add entries to <code>asset/agents/agent.md</code>.</p>';
      return;
    }

    grid.innerHTML = agents.map(renderCard).join('\n');

    // Re-run reveal observer on new elements
    if ('IntersectionObserver' in window && window._revealObserver) {
      grid.querySelectorAll('.reveal').forEach(function (el) {
        window._revealObserver.observe(el);
      });
    } else {
      grid.querySelectorAll('.reveal').forEach(function (el) {
        el.classList.add('revealed');
      });
    }
  }

  // ---- Fetch & Bootstrap ----

  function loadAgents() {
    fetch(AGENTS_FILE)
      .then(function (res) {
        if (!res.ok) throw new Error('Failed to load ' + AGENTS_FILE + ' (' + res.status + ')');
        return res.text();
      })
      .then(function (md) {
        var parsed   = parseFrontmatter(md);
        var agents   = parseAgents(parsed.body);
        var count    = parsed.count !== null ? parsed.count : agents.length;

        updateAgentStat(count);
        renderAgents(agents);
      })
      .catch(function (err) {
        console.warn('[agent-loader]', err.message);
        var grid = document.getElementById('agents-grid');
        if (grid) grid.innerHTML = '<p class="agents-empty">Could not load agent data.</p>';
      });
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAgents);
  } else {
    loadAgents();
  }

})();
