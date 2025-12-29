/**
 * LoL Stonks RSS - Custom JavaScript
 * Enhances documentation with interactive features
 */

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
  initRSSPreview();
  initMermaid();
  initCopyButtons();
});

/**
 * Initialize RSS Feed Preview Widget
 */
function initRSSPreview() {
  const previewButtons = document.querySelectorAll('.rss-load-button');

  previewButtons.forEach(button => {
    button.addEventListener('click', async function() {
      const container = this.closest('.rss-preview');
      const outputDiv = container.querySelector('.rss-output');
      const feedUrl = container.querySelector('.rss-feed-url')?.value || 'http://localhost:8000/feed';

      // Show loading state
      outputDiv.innerHTML = '<div class="rss-loading">Loading RSS feed...</div>';

      try {
        const response = await fetch(feedUrl);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

        // Check for parsing errors
        const parseError = xmlDoc.querySelector('parsererror');
        if (parseError) {
          throw new Error('Invalid XML format');
        }

        // Display formatted RSS feed
        displayRSSFeed(xmlDoc, outputDiv);

      } catch (error) {
        outputDiv.innerHTML = `
          <div class="rss-error">
            <strong>Error loading RSS feed:</strong><br>
            ${error.message}<br><br>
            <small>Make sure the LoL Stonks RSS server is running at ${feedUrl}</small>
          </div>
        `;
      }
    });
  });
}

/**
 * Display RSS feed in formatted view
 */
function displayRSSFeed(xmlDoc, container) {
  const channel = xmlDoc.querySelector('channel');
  if (!channel) {
    container.innerHTML = '<div class="rss-error">Invalid RSS format: No channel found</div>';
    return;
  }

  const title = channel.querySelector('title')?.textContent || 'Untitled Feed';
  const description = channel.querySelector('description')?.textContent || '';
  const items = Array.from(xmlDoc.querySelectorAll('item'));

  let html = `
    <div class="rss-feed-display">
      <h4 style="color: var(--lol-gold); margin-top: 0;">📡 ${escapeHtml(title)}</h4>
      <p style="color: var(--md-default-fg-color--light); margin-bottom: 1rem;">
        ${escapeHtml(description)}
      </p>
      <div class="rss-stats" style="display: flex; gap: 1rem; margin-bottom: 1rem; padding: 0.5rem; background: var(--md-default-bg-color); border-radius: 4px;">
        <span><strong>Items:</strong> ${items.length}</span>
        <span><strong>Format:</strong> RSS 2.0</span>
        <span><strong>Status:</strong> <span style="color: #4caf50;">✓ Valid</span></span>
      </div>
      <hr style="border-color: var(--md-default-fg-color--lightest);">
      <h5 style="color: var(--lol-blue);">Recent Items:</h5>
  `;

  items.slice(0, 5).forEach((item, index) => {
    const itemTitle = item.querySelector('title')?.textContent || 'Untitled';
    const itemLink = item.querySelector('link')?.textContent || '#';
    const itemDesc = item.querySelector('description')?.textContent || '';
    const pubDate = item.querySelector('pubDate')?.textContent || '';

    html += `
      <div style="margin-bottom: 1rem; padding: 0.75rem; background: var(--md-default-bg-color); border-left: 3px solid var(--lol-gold); border-radius: 0 4px 4px 0;">
        <div style="display: flex; justify-content: space-between; align-items: start; gap: 1rem;">
          <a href="${escapeHtml(itemLink)}" target="_blank" style="color: var(--lol-gold); font-weight: bold; text-decoration: none;">
            ${index + 1}. ${escapeHtml(itemTitle)}
          </a>
          ${pubDate ? `<small style="color: var(--md-default-fg-color--light); white-space: nowrap;">${formatDate(pubDate)}</small>` : ''}
        </div>
        ${itemDesc ? `<p style="margin: 0.5rem 0 0 0; color: var(--md-default-fg-color--light); font-size: 0.9rem;">${escapeHtml(itemDesc.substring(0, 150))}${itemDesc.length > 150 ? '...' : ''}</p>` : ''}
      </div>
    `;
  });

  if (items.length > 5) {
    html += `<p style="color: var(--md-default-fg-color--light); font-style: italic;">...and ${items.length - 5} more items</p>`;
  }

  html += '</div>';
  container.innerHTML = html;
}

/**
 * Format date string
 */
function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return dateString;
  }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Initialize Mermaid diagrams
 */
function initMermaid() {
  if (typeof mermaid !== 'undefined') {
    mermaid.initialize({
      startOnLoad: true,
      theme: document.body.dataset.mdColorScheme === 'slate' ? 'dark' : 'default',
      themeVariables: {
        primaryColor: '#0ac8b9',
        primaryTextColor: '#f0e6d2',
        primaryBorderColor: '#c89b3c',
        lineColor: '#5b5a56',
        secondaryColor: '#005a82',
        tertiaryColor: '#0a0e14'
      }
    });
  }
}

/**
 * Enhanced copy buttons for code blocks
 */
function initCopyButtons() {
  document.querySelectorAll('pre code').forEach((block) => {
    const pre = block.parentElement;
    if (!pre.querySelector('.copy-button')) {
      const button = document.createElement('button');
      button.className = 'copy-button';
      button.textContent = 'Copy';
      button.style.cssText = `
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        padding: 0.25rem 0.75rem;
        background: var(--lol-gold);
        color: var(--lol-black);
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.8rem;
        font-weight: bold;
        opacity: 0;
        transition: opacity 0.2s;
      `;

      pre.style.position = 'relative';
      pre.appendChild(button);

      pre.addEventListener('mouseenter', () => {
        button.style.opacity = '1';
      });

      pre.addEventListener('mouseleave', () => {
        button.style.opacity = '0';
      });

      button.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(block.textContent);
          button.textContent = '✓ Copied!';
          button.style.background = '#4caf50';

          setTimeout(() => {
            button.textContent = 'Copy';
            button.style.background = 'var(--lol-gold)';
          }, 2000);
        } catch (err) {
          button.textContent = '✗ Failed';
          button.style.background = '#ff5252';

          setTimeout(() => {
            button.textContent = 'Copy';
            button.style.background = 'var(--lol-gold)';
          }, 2000);
        }
      });
    }
  });
}

/**
 * Theme switch handler - update Mermaid theme
 */
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.attributeName === 'data-md-color-scheme') {
      initMermaid();
    }
  });
});

observer.observe(document.body, {
  attributes: true,
  attributeFilter: ['data-md-color-scheme']
});

/**
 * Smooth scroll for anchor links
 */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href !== '#') {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  });
});

// Export for use in other scripts
window.lolStonksRSS = {
  initRSSPreview,
  displayRSSFeed,
  formatDate,
  escapeHtml
};
