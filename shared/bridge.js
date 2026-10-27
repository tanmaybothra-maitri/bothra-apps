/* bridge.js — lets the Apps Script pages run on GitHub Pages.
   - google.script.run   -> POST to the Apps Script /exec (doPost in 60_Api.gs)
   - google.script.history.replace -> this page's address bar, also saved on the phone
   - PARAMS (?app, ?s, ?d, ?k) come from the address bar, or the saved copy when the
     home-screen icon opens the bare page. */
(function () {
  var EXEC = 'https://script.google.com/macros/s/AKfycbyKbgAK9NkmXoGfBTZVV9V4PjfVHXcwmjo61ck98vPqpHW0SXuG-yk7dOeiWrahSUvfJg/exec';
  var EXEC_RE = /https:\/\/script\.google\.com\/(?:a\/[^\/"]+\/)?macros\/s\/[A-Za-z0-9_-]+\/(?:exec|dev)/g;
  var ROOT = location.origin + '/' + location.pathname.split('/')[1] + '/';
  var APP = document.documentElement.getAttribute('data-app') || '';
  var KEY = 'bothra_q_' + location.pathname;

  function save(q) { try { localStorage.setItem(KEY, JSON.stringify(q)); } catch (e) {} }
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } }
  function toUrl(q) { var s = new URLSearchParams(q).toString(); return location.pathname + (s ? '?' + s : '') + location.hash; }

  var q = {};
  new URLSearchParams(location.search).forEach(function (v, k) { q[k] = v; });
  var signed = Object.keys(q).some(function (k) { return k !== 'app'; });
  if (signed) save(q);
  else {
    var sv = load();
    if (sv && (!sv.app || sv.app === APP || !q.app)) { q = sv; try { history.replaceState(null, '', toUrl(q)); } catch (e) {} }
  }
  if (!q.app && APP) q.app = APP;
  window.__PARAMS = q;

  function call(fn, args, ok, fail) {
    fetch(EXEC, { method: 'POST', redirect: 'follow', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ fn: fn, args: args }) })
      .then(function (r) { return r.text(); })
      .then(function (t) {
        var o;
        try { o = JSON.parse(t.replace(EXEC_RE, ROOT)); }
        catch (e) { throw new Error('The server sent an unexpected reply. Try again.'); }
        if (o.ok) { if (ok) ok(o.r); }
        else if (fail) fail(new Error(o.e || 'Something went wrong'));
      })
      .catch(function (e) {
        if (!fail) return;
        var m = String((e && e.message) || e);
        fail(new Error(/fetch|network|load failed/i.test(m) ? 'No connection. Check the internet and try again.' : m));
      });
  }
  function runner(ok, fail) {
    return new Proxy({}, {
      get: function (t, name) {
        if (name === 'withSuccessHandler') return function (h) { return runner(h, fail); };
        if (name === 'withFailureHandler') return function (h) { return runner(ok, h); };
        if (name === 'withUserObject') return function () { return runner(ok, fail); };
        return function () { call(name, Array.prototype.slice.call(arguments), ok, fail); };
      }
    });
  }

  window.google = window.google || {};
  window.google.script = {
    run: runner(null, null),
    history: {
      replace: function (state, params) {
        var p = {}; Object.keys(params || {}).forEach(function (k) { if (params[k] != null && params[k] !== '') p[k] = params[k]; });
        save(p); try { history.replaceState(null, '', toUrl(p)); } catch (e) {}
      },
      push: function (state, params) { this.replace(state, params); },
      setChangeHandler: function () {}
    },
    url: { getLocation: function (cb) { cb({ parameter: q, parameters: {}, hash: location.hash.slice(1) }); } },
    host: { close: function () {}, setHeight: function () {}, setWidth: function () {} }
  };

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () { navigator.serviceWorker.register(ROOT + 'sw.js', { scope: ROOT }).catch(function () {}); });
  }
})();
