/* CapLink Studio — shared key/value store (Supabase `studio_state` table).
   Same approach as milestones.js: plain fetch with the publishable key, and it
   degrades quietly. If the table does not exist yet, or the network is blocked,
   get() resolves null and set() resolves false — callers just fall back to
   localStorage, so nothing breaks before the SQL is run. It auto-upgrades to
   shared the moment the table is created, with no code change. */
(function () {
  var URL = "https://buijepdhgvcfmclztjez.supabase.co";
  var KEY = "sb_publishable_wWAcHfVy2dX0PZoxJ4NgrQ_-QhhFfGg";

  function who() {
    try { var p = JSON.parse(localStorage.getItem("caplink-profile") || "null");
      return (p && p.name) || null; } catch (_) { return null; }
  }

  /* get(key) -> Promise<data | null> */
  function get(key) {
    return fetch(URL + "/rest/v1/studio_state?key=eq." +
        encodeURIComponent(key) + "&select=data", { headers: { apikey: KEY } })
      .then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (rows) { return (rows && rows[0]) ? rows[0].data : null; })
      .catch(function () { return null; });
  }

  /* set(key, data) -> Promise<boolean> (true only if it actually saved) */
  function set(key, data) {
    return fetch(URL + "/rest/v1/studio_state", {
        method: "POST",
        headers: { apikey: KEY, "Content-Type": "application/json",
                   Prefer: "resolution=merge-duplicates" },
        body: JSON.stringify({ key: key, data: data, by_name: who() })
      })
      .then(function (r) { return r.ok; })
      .catch(function () { return false; });
  }

  window.StudioStore = { get: get, set: set };
})();
