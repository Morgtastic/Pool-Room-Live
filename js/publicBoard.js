<script type="module" src="../vendor/supabase-global.js?v=1"></script>
<script defer src="../js/supabaseClient.js?v=2"></script>
<script>
  (async () => {
    const wait = (ms) => new Promise(r => setTimeout(r, ms));
    let waited = 0;
    while (waited < 6000 && (!window.supabase || !window.sb || !sb.client)) { await wait(300); waited += 300; }
    if (!window.supabase) {
      const b = document.createElement('div'); b.style.cssText="position:fixed;left:0;right:0;top:0;background:#b00020;color:#fff;padding:10px 14px;font:14px system-ui;z-index:99999"; b.textContent="Supabase SDK missing. Check ../vendor/supabase-global.js tag."; document.addEventListener('DOMContentLoaded',()=>document.body.appendChild(b));
    } else if (!window.sb || !sb.client) {
      const b = document.createElement('div'); b.style.cssText="position:fixed;left:0;right:0;top:0;background:#b00020;color:#fff;padding:10px 14px;font:14px system-ui;z-index:99999"; b.textContent="Supabase client missing. Check ../js/supabaseClient.js and your anon key."; document.addEventListener('DOMContentLoaded',()=>document.body.appendChild(b));
    }
  })();
</script>


// /js/publicBoard.js
(async () => {
  const supabase = sb.client;
  const roomsEl = document.getElementById("rooms");
  const boardStatus = document.getElementById("board-status");

  const url = new URL(window.location.href);
  const focusRoom = url.searchParams.get("room");

  const renderCard = (r) => {
    const el = document.createElement("div");
    el.className = "card room-card";
    el.id = `room-${r.id}`;
    el.innerHTML = `
      <h3>
        <span class="status-dot ${sb.dotClass(r.status)}"></span>
        <span>${r.name}</span>
      </h3>
      <div class="badge ${r.status}">
        <span>${sb.statusEmoji(r.status)}</span>
        <span>${sb.statusLabel(r.status)}</span>
      </div>
      <div class="updated">Updated: ${sb.formatTime(r.updated_at)}</div>
      <div class="row wrap" style="margin-top:8px">
        <a class="link" href="${sb.roomUrl(r.public_slug)}">Share</a>
      </div>
    `;
    return el;
  };

  const upsertCard = (r) => {
    const existing = document.getElementById(`room-${r.id}`);
    if (!existing) { roomsEl.appendChild(renderCard(r)); return; }
    existing.querySelector(".status-dot").className = `status-dot ${sb.dotClass(r.status)}`;
    const badge = existing.querySelector(".badge");
    badge.className = `badge ${r.status}`;
    badge.innerHTML = `<span>${sb.statusEmoji(r.status)}</span><span>${sb.statusLabel(r.status)}</span>`;
    existing.querySelector(".updated").textContent = `Updated: ${sb.formatTime(r.updated_at)}`;
  };

  const fetchRooms = async () => {
    boardStatus.textContent = "Loading rooms…";
    const match = focusRoom ? { or: `public_slug.eq.${focusRoom},id.eq.${focusRoom}` } : {};
    const { data, error } = await supabase
      .from("rooms")
      .select("id,name,status,public_slug,updated_at")
      .order("name", { ascending: true })
      .match(match);

    if (error) { boardStatus.textContent = `Error loading rooms: ${error.message}`; return []; }
    roomsEl.innerHTML = "";
    if (!data || data.length === 0) { boardStatus.textContent = "No rooms found."; return []; }
    boardStatus.textContent = focusRoom ? "Showing 1 room" : `Showing ${data.length} rooms`;
    data.forEach(upsertCard);
    return data;
  };

  await fetchRooms();

  // Poll every 10s so it works even without realtime
  const POLL_MS = 10_000;
  setInterval(fetchRooms, POLL_MS);

  // Optional realtime (if your project supports it)
  try {
    const channel = supabase
      .channel("rooms-stream")
      .on("postgres_changes", { event: "*", schema: "public", table: "rooms" }, (payload) => {
        if (payload.eventType === "DELETE") {
          const el = document.getElementById(`room-${payload.old.id}`);
          if (el) el.remove();
          return;
        }
        const row = payload.new;
        if (focusRoom && !(row.public_slug === focusRoom || row.id === focusRoom)) return;
        upsertCard(row);
      })
      .subscribe((status) => { if (status === "SUBSCRIBED") boardStatus.textContent += " · Live updates ON"; });
  } catch {}
})();
