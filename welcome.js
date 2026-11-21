/* Welcome pages (/welcome-founders, /welcome-advisors).
   The app sends new sign-ups here with up to three values in the link, all optional:
     ?name=Sarah            first name for the greeting
     &company=Acme%20Corp   their company (founders) or firm (advisors)
     &cid=H1Fw0I51cM        their company ID in the app, so every button opens the right screen
   Without them the page shows its generic greeting and buttons open the app's home.
   Everything is written as plain text (never HTML), trimmed and capped in length. */
(function () {
  'use strict';
  var APP = 'https://app.diligenceready.com';
  var q = new URLSearchParams(location.search);
  var page = document.body.getAttribute('data-welcome') || 'founders';
  function clean(v, max) {
    v = (v || '').replace(/[<>{}"`]/g, '').replace(/\s+/g, ' ').trim();
    return v.length > max ? v.slice(0, max).trim() : v;
  }
  var name = clean(q.get('name') || q.get('first_name'), 30).split(' ')[0];
  var company = clean(q.get('company') || q.get('firm'), 48);
  var cid = (q.get('cid') || '').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 40);
  function $(sel) { return document.querySelector(sel); }
  function set(sel, text) { var el = $(sel); if (el) el.textContent = text; }

  // ---- greeting
  if (name) set('[data-wl="lead"]', 'Welcome, ' + name + '.');
  else if (company) set('[data-wl="lead"]', 'Welcome.');
  if (page === 'founders' && company) set('[data-wl="accent"]', 'Let’s get ' + company + ' ready.');
  if (company) {
    set('[data-wl="cardname"]', company);
    set('[data-wl="initial"]', company.charAt(0).toUpperCase());
    set('[data-wl="eyebrow"]', company + (page === 'founders' ? ' · Founders plan' : ' · Trusted advisor'));
    set('[data-email-firm]', company);
  }
  if (name) set('[data-wl="avatar"]', name.charAt(0).toUpperCase());
  if (name) document.title = 'Welcome, ' + name + ' | Diligence Ready';

  // ---- buttons into the app: with a company ID they open the exact screen
  document.querySelectorAll('[data-app-path]').forEach(function (a) {
    var path = a.getAttribute('data-app-path');
    a.href = cid ? APP + '/c/' + cid + (path ? '/' + path : '') : APP + '/';
  });
  document.querySelectorAll('[data-ask]').forEach(function (a) {
    var ask = encodeURIComponent(a.getAttribute('data-ask'));
    a.href = cid ? APP + '/c/' + cid + '/assistant?q=' + ask : APP + '/';
  });

  // ---- have-these-handy checklist: remembered in this browser only
  var KEY = 'dr_welcome_handy';
  var saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { saved = {}; }
  document.querySelectorAll('[data-handy]').forEach(function (box) {
    var k = box.getAttribute('data-handy');
    box.checked = !!saved[k];
    box.addEventListener('change', function () {
      saved[k] = box.checked;
      try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (e) {}
    });
  });

  // ---- step progress: opening a step ticks it off (remembered in this browser only)
  var SKEY = 'dr_welcome_steps';
  var done = {};
  try { done = JSON.parse(localStorage.getItem(SKEY)) || {}; } catch (e) { done = {}; }
  var steps = [].slice.call(document.querySelectorAll('.wk-step[data-step]'));
  var prog = $('[data-progress]');
  function paint() {
    var n = 0, left = 0, total = 0; var next = null;
    steps.forEach(function (li) {
      var m = +li.getAttribute('data-mins') || 0, d = !!done[li.getAttribute('data-step')];
      li.classList.toggle('is-done', d);
      if (!d && !next) next = li;
      total += m; if (d) n++; else left += m;
    });
    steps.forEach(function (li) { li.classList.toggle('is-next', li === next); });
    if (!prog) return;
    prog.style.setProperty('--p', steps.length ? n / steps.length * 100 : 0);
    prog.classList.toggle('is-complete', n === steps.length);
    set('[data-done]', String(n));
    set('[data-progress-title]', n === 0 ? 'Nothing done yet' : n === steps.length ? 'All set. Nice work.' : n + ' of ' + steps.length + ' done');
    set('[data-progress-sub]', n === steps.length ? 'You’re ready when they ask' : (n ? 'About ' + left + ' minutes left' : 'About ' + total + ' minutes in all'));
  }
  steps.forEach(function (li) {
    var go = li.querySelector('.wk-go');
    if (go) go.addEventListener('click', function () {
      done[li.getAttribute('data-step')] = true;
      try { localStorage.setItem(SKEY, JSON.stringify(done)); } catch (e) {}
      paint();
    });
  });
  paint();

  // ---- advisors: copy the invite email
  var copyBtn = $('[data-copy-email]');
  if (copyBtn) copyBtn.addEventListener('click', function () {
    var text = 'Subject: ' + $('[data-email-subject]').textContent + '\n\n' + $('[data-email-body]').innerText.trim();
    var done = function () { copyBtn.textContent = 'Copied'; copyBtn.classList.add('is-done'); setTimeout(function () { copyBtn.textContent = 'Copy email'; copyBtn.classList.remove('is-done'); }, 2000); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, function () {});
    try { if (window.gtag) window.gtag('event', 'welcome_copy_email', {}); } catch (e) {}
  });
})();
