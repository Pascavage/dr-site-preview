/* Welcome pages (/welcome-founders, /welcome-advisors): personalize the greeting.
   The app passes the new user's first name and company (or firm) in the link after sign-up:
     /welcome-founders?name=Sarah&company=Acme%20Corp
     /welcome-advisors?name=Sarah&company=Smith%20Advisory
   Both are optional. Without them the page shows its generic greeting.
   Everything is written as plain text (never HTML), trimmed and capped in length. */
(function () {
  'use strict';
  var q = new URLSearchParams(location.search);
  function clean(v, max) {
    v = (v || '').replace(/[<>{}"`]/g, '').replace(/\s+/g, ' ').trim();
    return v.length > max ? v.slice(0, max).trim() : v;
  }
  var name = clean(q.get('name') || q.get('first_name'), 30).split(' ')[0];
  var company = clean(q.get('company') || q.get('firm'), 48);
  if (!name && !company) return;

  var page = document.body.getAttribute('data-welcome');   // "founders" or "advisors"
  var lead = document.querySelector('[data-wl="lead"]');
  var accent = document.querySelector('[data-wl="accent"]');
  var eyebrow = document.querySelector('[data-wl="eyebrow"]');

  if (lead) lead.textContent = name ? 'Welcome, ' + name + '.' : 'Welcome.';
  if (page === 'founders') {
    if (accent) accent.textContent = company ? 'Let’s get ' + company + ' ready.' : 'Let’s get you ready.';
    if (eyebrow && company) eyebrow.textContent = company + ' · Founders plan';
  } else {
    if (eyebrow && company) eyebrow.textContent = company + ' · Trusted advisor';
  }
  document.title = (name ? 'Welcome, ' + name : 'Welcome') + ' | Diligence Ready';
})();
