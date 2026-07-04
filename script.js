/**
 * Healthcare Portfolio — minimal interactions
 */

(function () {
  'use strict';

  const siteHeader = document.querySelector('.site-header');
  const hero = document.querySelector('.hero-dark');

  // Header theme: dark glass over hero, light after scroll
  if (siteHeader && hero) {
    const toggleHeaderTheme = function () {
      const heroBottom = hero.getBoundingClientRect().bottom;
      siteHeader.classList.toggle('is-scrolled', heroBottom <= varHeaderHeight());
    };

    function varHeaderHeight() {
      return parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height'), 10) || 64;
    }

    toggleHeaderTheme();
    window.addEventListener('scroll', toggleHeaderTheme, { passive: true });
    window.addEventListener('resize', toggleHeaderTheme);
  }

  // Mobile navigation toggle
  const navToggle = document.querySelector('.nav-toggle');
  const siteNav = document.querySelector('.site-nav');

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      const isOpen = siteNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', isOpen);
      navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    });

    // Close menu when a nav link is clicked
    siteNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        siteNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Open menu');
      });
    });

    // Close menu on escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && siteNav.classList.contains('is-open')) {
        siteNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Open menu');
        navToggle.focus();
      }
    });
  }

  // Highlight active nav link on scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.site-nav a');

  if (sections.length && navLinks.length) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach(function (link) {
              const isActive = link.getAttribute('href') === '#' + id;
              if (isActive) {
                link.style.color = siteHeader && !siteHeader.classList.contains('is-scrolled') && hero
                  ? 'var(--seafoam-bright)'
                  : 'var(--color-text)';
                link.style.fontWeight = '500';
              } else {
                link.style.color = '';
                link.style.fontWeight = '';
              }
            });
          }
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  // Case study tabs — switch in place instead of scrolling the page
  const caseTabs = document.getElementById('case-tabs');
  const workSection = document.getElementById('work');

  if (caseTabs && workSection) {
    const TAB_HASH = {
      onboarding: 'case-onboarding',
      attune: 'case-attune',
      workflow: 'case-workflow',
      plants: 'case-plants'
    };
    const HASH_TAB = Object.fromEntries(
      Object.entries(TAB_HASH).map(function (entry) {
        return [entry[1], entry[0]];
      })
    );

    const tabButtons = caseTabs.querySelectorAll('[role="tab"]');
    const panels = caseTabs.querySelectorAll('[role="tabpanel"]');

    function headerOffset() {
      return parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height'), 10) || 64;
    }

    function isWorkInView() {
      const rect = workSection.getBoundingClientRect();
      return rect.top < window.innerHeight * 0.4 && rect.bottom > headerOffset();
    }

    function scrollToWorkTabs() {
      const top = workSection.getBoundingClientRect().top + window.scrollY - headerOffset() - 12;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }

    function scrollToPanelTop() {
      const panelsTop = caseTabs.querySelector('.case-tabs__panels').getBoundingClientRect().top;
      const target = panelsTop + window.scrollY - headerOffset() - 12;
      if (window.scrollY > target + 24) {
        window.scrollTo({ top: Math.max(0, target), behavior: 'smooth' });
      }
    }

    function activateTab(tabId, options) {
      const opts = options || {};

      tabButtons.forEach(function (btn) {
        const selected = btn.dataset.tab === tabId;
        btn.setAttribute('aria-selected', selected ? 'true' : 'false');
        btn.tabIndex = selected ? 0 : -1;
      });

      panels.forEach(function (panel) {
        const active = panel.id === TAB_HASH[tabId];
        panel.classList.toggle('is-active', active);
        panel.hidden = !active;
      });

      if (opts.updateHash !== false) {
        history.replaceState(null, '', '#' + TAB_HASH[tabId]);
      }

      if (opts.scrollToWork) {
        scrollToWorkTabs();
      } else if (opts.scrollPanelTop) {
        scrollToPanelTop();
      }
    }

    tabButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        activateTab(btn.dataset.tab, { scrollToWork: false, scrollPanelTop: true });
      });
    });

    caseTabs.querySelector('.case-tabs__bar').addEventListener('keydown', function (e) {
      const tabs = Array.prototype.slice.call(tabButtons);
      const currentIndex = tabs.findIndex(function (tab) {
        return tab.getAttribute('aria-selected') === 'true';
      });
      let nextIndex = currentIndex;

      if (e.key === 'ArrowRight') {
        nextIndex = (currentIndex + 1) % tabs.length;
      } else if (e.key === 'ArrowLeft') {
        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      } else if (e.key === 'Home') {
        nextIndex = 0;
      } else if (e.key === 'End') {
        nextIndex = tabs.length - 1;
      } else {
        return;
      }

      e.preventDefault();
      tabs[nextIndex].focus();
      activateTab(tabs[nextIndex].dataset.tab, { scrollToWork: false, scrollPanelTop: true });
    });

    function applyHash(scrollToWork) {
      const tabId = HASH_TAB[location.hash.slice(1)];
      if (tabId) {
        activateTab(tabId, { scrollToWork: scrollToWork, updateHash: false });
      }
    }

    applyHash(!isWorkInView());
    if (!HASH_TAB[location.hash.slice(1)]) {
      activateTab('attune', { updateHash: false });
    }
    window.addEventListener('hashchange', function () {
      applyHash(!isWorkInView());
    });

    document.querySelectorAll('a[href^="#case-"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        const tabId = HASH_TAB[this.getAttribute('href').slice(1)];
        if (!tabId) {
          return;
        }
        e.preventDefault();
        activateTab(tabId, { scrollToWork: !isWorkInView() });
      });
    });
  }
})();
