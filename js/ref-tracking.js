/**
 * APAC FINSTAB - Ref Parameter Tracking
 * 
 * Purpose: Track traffic sources via ?ref= parameter
 * 
 * Usage:
 *   1. Include this script on all pages: <script src="/js/ref-tracking.js"></script>
 *   2. Link to pages with ?ref=source (e.g., ?ref=twitter, ?ref=mcp, ?ref=chatgpt)
 *   3. Ref is stored in localStorage for 30 days and attached to all CTA clicks
 * 
 * How it works:
 *   - Captures ?ref= from URL on page load
 *   - Stores in localStorage with timestamp
 *   - Attaches ref to outbound CTA links
 *   - Reports conversions to /api/track endpoint (if available)
 */

(function() {
  'use strict';

  const STORAGE_KEY = 'apacfinstab_ref';
  const STORAGE_EXPIRY_DAYS = 30;
  const TRACK_ENDPOINT = '/api/track'; // Optional: server-side tracking

  // Extract ref from URL
  function getRefFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('ref') || params.get('utm_source');
  }

  // Get stored ref data
  function getStoredRef() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return null;
      
      const parsed = JSON.parse(data);
      const now = Date.now();
      const expiryMs = STORAGE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
      
      // Check expiry
      if (now - parsed.timestamp > expiryMs) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      
      return parsed;
    } catch (e) {
      return null;
    }
  }

  // Store ref data
  function storeRef(ref, landingPage) {
    const data = {
      ref: ref,
      landingPage: landingPage,
      timestamp: Date.now(),
      visits: 1
    };
    
    // Merge with existing if same ref
    const existing = getStoredRef();
    if (existing && existing.ref === ref) {
      data.visits = (existing.visits || 1) + 1;
      data.timestamp = existing.timestamp; // Keep original timestamp
    }
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      // localStorage might be unavailable
    }
  }

  // Track event (fire-and-forget)
  function trackEvent(event, data) {
    // Try navigator.sendBeacon for non-blocking tracking
    if (navigator.sendBeacon) {
      const payload = JSON.stringify({
        event: event,
        ...data,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      });
      navigator.sendBeacon(TRACK_ENDPOINT, payload);
    }
    
    // Also log to console for debugging
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('[RefTrack]', event, data);
    }
  }

  // Attach ref to CTA links
  function attachRefToLinks() {
    const refData = getStoredRef();
    if (!refData) return;
    
    // Find all CTA links and forms
    const ctaSelectors = [
      'a.btn-primary',
      'a.cta-button',
      'a[href*="contact"]',
      'a[href*="subscribe"]',
      'a[href*="signup"]',
      'form[action*="subscribe"]'
    ];
    
    document.querySelectorAll(ctaSelectors.join(', ')).forEach(el => {
      if (el.tagName === 'A') {
        const href = el.getAttribute('href');
        if (href && !href.startsWith('mailto:') && !href.includes('ref=')) {
          const separator = href.includes('?') ? '&' : '?';
          el.setAttribute('href', `${href}${separator}ref=${encodeURIComponent(refData.ref)}`);
        }
        
        // Track CTA click
        el.addEventListener('click', function() {
          trackEvent('cta_click', {
            ref: refData.ref,
            ctaText: el.textContent.trim().substring(0, 50),
            ctaHref: el.getAttribute('href')
          });
        });
      }
    });
  }

  // Main initialization
  function init() {
    const urlRef = getRefFromUrl();
    
    if (urlRef) {
      // New ref from URL - store it
      storeRef(urlRef, window.location.pathname);
      trackEvent('ref_landing', {
        ref: urlRef,
        landingPage: window.location.pathname
      });
    }
    
    // Attach ref to CTAs regardless (use stored ref if available)
    attachRefToLinks();
    
    // Track page view with ref context
    const refData = getStoredRef();
    if (refData) {
      trackEvent('pageview', {
        ref: refData.ref,
        visits: refData.visits
      });
    }
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for debugging
  window.APAC_RefTrack = {
    getRef: getStoredRef,
    clearRef: function() { localStorage.removeItem(STORAGE_KEY); }
  };

})();
