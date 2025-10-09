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
    const match = focusRoom
      ? { or: `public_slug.eq.${focusRoom},id.eq.${focusRoom}` }
      : {};
    const { data, error } = await supabase
      .from("rooms")
      .select("id,name,status,public_slug,updated_at")
      .order("name", { ascending: true })
      .match(match);

    if (error) {
      boardStatus.textContent = `Error loading rooms: ${error.message}`;
      return [];
    }

    roomsEl.innerHTML = "";
    if (!data || data.length === 0) {
      boardStatus.textContent = "No rooms found.";
      return [];
    }
    boardStatus.textContent = focusRoom ? "Showing 1 room" : `Showing ${data.length} rooms`;
    data.forEach(upsertCard);
    return data;
  };

  await fetchRooms();

  const POLL_MS = 10_000;
  let pollTimer = setInterval(fetchRooms, POLL_MS);

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
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          boardStatus.textContent += " · Live updates ON";
        }
      });

    window.addEventListener("beforeunload", () => {
      try { supabase.removeChannel(channel); } catch {}
      clearInterval(pollTimer);
    });
  } catch {
  }
})();
