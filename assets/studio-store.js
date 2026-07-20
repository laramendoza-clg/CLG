/* CapLink Studio — shared key/value store (Supabase `studio_state` table).
   Same approach as milestones.js: plain fetch with the publishable key, and it
   degrades quietly. If the table does not exist yet, or the network is blocked,
   get() resolves null and set() resolves false — callers just fall back to
   localStorage, so nothing breaks before the SQL is run. It auto-upgrades to
   shared the moment the table is created, with no code change.

   Resilience (added): transient failures (503/429/5xx/network — the free-tier
   IO throttle) are retried with backoff instead of surfacing as errors, and
   writes are coalesced per key: rapid saves collapse to the latest payload and
   an unchanged payload is never re-sent. This keeps the editors from
   machine-gunning the database on every keystroke. */
(function () {
  var URL = "https://buijepdhgvcfmclztjez.supabase.co";
  var KEY = "sb_publishable_wWAcHfVy2dX0PZoxJ4NgrQ_-QhhFfGg";

  var lastSent = {};   // key -> body string last confirmed saved (skip identical re-sends)
  var latest   = {};   // key -> most recent body requested (coalescing target)
  var chain    = {};   // key -> tail of the per-key write queue

  function who() {
    try { var p = JSON.parse(localStorage.getItem("caplink-profile") || "null");
      return (p && p.name) || null; } catch (_) { return null; }
  }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  // retry on network error (0) and transient server states; NOT on 4xx (bad request/auth)
  function retriable(s) { return s === 0 || s === 429 || s === 500 || s === 502 || s === 503 || s === 504; }

  /* get(key) -> Promise<data | null> — retries a throttled read a couple of times */
  function get(key) {
    var u = URL + "/rest/v1/studio_state?key=eq." +
      encodeURIComponent(key) + "&select=data";
    var delays = [500, 1400];
    function attempt(i) {
      return fetch(u, { headers: { apikey: KEY } })
        .then(function (r) {
          if (r.ok) return r.json().then(function (rows) {
            return (rows && rows[0]) ? rows[0].data : null;
          });
          if (i < delays.length && retriable(r.status))
            return sleep(delays[i]).then(function () { return attempt(i + 1); });
          return null;
        })
        .catch(function () {
          if (i < delays.length)
            return sleep(delays[i]).then(function () { return attempt(i + 1); });
          return null;
        });
    }
    return attempt(0);
  }

  function postOnce(body) {
    return fetch(URL + "/rest/v1/studio_state", {
        method: "POST",
        headers: { apikey: KEY, "Content-Type": "application/json",
                   Prefer: "resolution=merge-duplicates" },
        body: body
      })
      .then(function (r) { return { ok: r.ok, status: r.status }; })
      .catch(function () { return { ok: false, status: 0 }; });
  }
  function postWithRetry(body) {
    var delays = [500, 1400, 3000];
    function attempt(i) {
      return postOnce(body).then(function (res) {
        if (res.ok) return true;
        if (i < delays.length && retriable(res.status))
          return sleep(delays[i]).then(function () { return attempt(i + 1); });
        return false;
      });
    }
    return attempt(0);
  }

  /* set(key, data) -> Promise<boolean> (true only if it actually saved).
     Coalesced per key: overlapping saves queue and only the freshest payload is
     sent; an unchanged payload resolves true without touching the network. */
  function set(key, data) {
    var body = JSON.stringify({ key: key, data: data, by_name: who() });
    latest[key] = body;
    if (lastSent[key] === body) return Promise.resolve(true);   // nothing changed since last save
    var run = function () {
      var fresh = latest[key];                                  // always send the newest queued body
      if (lastSent[key] === fresh) return true;
      return postWithRetry(fresh).then(function (ok) {
        if (ok) lastSent[key] = fresh;
        return ok;
      });
    };
    var tail = (chain[key] || Promise.resolve()).then(run, run);
    chain[key] = tail.catch(function () {});                    // keep the queue alive after a failure
    return tail;
  }

  window.StudioStore = { get: get, set: set };
})();
