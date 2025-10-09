// /js/admin.js
(async () => {
  const supabase = sb.client;

  const authPanel = document.getElementById("auth-panel");
  const dashPanel = document.getElementById("dash-panel");
  const signinForm = document.getElementById("signin-form");
  const emailEl = document.getElementById("email");
  const passEl = document.getElementById("password");
  const signinBtn = document.getElementById("signin-btn");
  const signupBtn = document.getElementById("signup-btn");
  const authMsg = document.getElementById("auth-msg");
  const roomsWrap = document.getElementById("rooms-wrap");
  const signoutBtn = document.getElementById("signout-btn");

  const qrBoardCanvas = document.getElementById("qr-board");
  const boardLinkInput = document.getElementById("board-link");
  const copyBoardBtn = document.getElementById("copy-board");

  const setMsg = (m) => authMsg.textContent = m ?? "";
  const showDash = (show) => { authPanel.classList.toggle("hidden", show); dashPanel.classList.toggle("hidden", !show); };

  const getSession = async () => (await supabase.auth.getSession()).data.session;
  const signIn = async (email, password) => { const { error } = await supabase.auth.signInWithPassword({ email, password }); if (error) throw error; };
  const signUp = async (email, password) => { const { error } = await supabase.auth.signUp({ email, password }); if (error) throw error; };
  const signOut = async () => { const { error } = await supabase.auth.signOut(); if (error) throw error; };

  const statusButtons = (room) => {
    const wrap = document.createElement("div");
    wrap.className = "status-grid";
    [["green","🟢"],["yellow","🟡"],["red","🔴"]].forEach(([s, dot]) => {
      const b = document.createElement("button");
      b.className = `btn status-btn ${s}`;
      b.textContent = `${dot} ${s.toUpperCase()}`;
      b.onclick = async () => {
        b.disabled = true;
        try {
          const { error } = await supabase.from("rooms").update({ status: s }).eq("id", room.id);
          if (error) throw error;
        } catch (e) { alert(`Update failed: ${e.message}`); } finally { b.disabled = false; }
      };
      wrap.appendChild(b);
    });
    return wrap;
  };

  const roomCard = (room) => {
    const card = document.createElement("div");
    card.className = "card";
    card.id = `myroom-${room.id}`;
    card.innerHTML = `
      <div class="row between">
        <h3><span class="status-dot ${sb.dotClass(room.status)}"></span> ${room.name}</h3>
        <span class="badge ${room.status}">${sb.statusEmoji(room.status)} ${sb.statusLabel(room.status)}</span>
      </div>
      <div class="updated">Updated: ${sb.formatTime(room.updated_at)}</div>
      <div class="vstack gap" style="margin-top:8px">
        <div class="row wrap">
          <input class="input mono" value="${sb.roomUrl(room.public_slug)}" readonly />
          <button class="btn" data-room-copy>Copy Room Link</button>
        </div>
        <canvas class="qr" data-room-qr></canvas>
      </div>
    `;
    const qrCanvas = card.querySelector("[data-room-qr]");
    QRCode.toCanvas(qrCanvas, sb.roomUrl(room.public_slug), { width: 160 });

    const copyBtn = card.querySelector("[data-room-copy]");
    copyBtn.onclick = async () => {
      await navigator.clipboard.writeText(sb.roomUrl(room.public_slug));
      copyBtn.textContent = "Copied!";
      setTimeout(() => (copyBtn.textContent = "Copy Room Link"), 1200);
    };

    card.appendChild(statusButtons(room));
    return card;
  };

  const renderRooms = (rows) => {
    roomsWrap.innerHTML = "";
    if (!rows || rows.length === 0) {
      roomsWrap.innerHTML = `<div class="card"><p class="muted">No rooms yet. Ask admin to add one.</p></div>`;
      return;
    }
    rows.forEach((r) => roomsWrap.appendChild(roomCard(r)));
  };

  const loadMyRooms = async () => {
    const session = await getSession();
    if (!session) return;
    const { data, error } = await supabase
      .from("rooms")
      .select("id,name,status,public_slug,updated_at")
      .eq("owner_id", session.user.id)
      .order("name", { ascending: true });
    if (error) { alert(error.message); return; }
    renderRooms(data);
  };

  // Init
  const session = await getSession();
  showDash(!!session);

  const boardUrl = sb.boardUrl();
  boardLinkInput.value = boardUrl;
  QRCode.toCanvas(qrBoardCanvas, boardUrl, { width: 180 });
  copyBoardBtn.onclick = async () => {
    await navigator.clipboard.writeText(boardUrl);
    copyBoardBtn.textContent = "Copied!";
    setTimeout(() => (copyBoardBtn.textContent = "Copy Link"), 1200);
  };

  if (session) await loadMyRooms();

  supabase.auth.onAuthStateChange(async (_ev, sess) => {
    showDash(!!sess);
    if (sess) await loadMyRooms();
  });

  // Poll every 10s so it works even without realtime
  const POLL_MS = 10_000;
  setInterval(loadMyRooms, POLL_MS);

  // Optional realtime
  try {
    const channel = supabase
      .channel("my-rooms")
      .on("postgres_changes", { event: "*", schema: "public", table: "rooms" }, (payload) => {
        const row = payload.new ?? payload.old;
        const card = document.getElementById(`myroom-${row.id}`);
        if (!card) return;
        if (payload.eventType === "DELETE") { card.remove(); return; }
        const current = payload.new;
        card.querySelector(".status-dot").className = `status-dot ${sb.dotClass(current.status)}`;
        const badge = card.querySelector(".badge");
        badge.className = `badge ${current.status}`;
        badge.textContent = `${sb.statusEmoji(current.status)} ${sb.statusLabel(current.status)}`;
        card.querySelector(".updated").textContent = `Updated: ${sb.formatTime(current.updated_at)}`;
      })
      .subscribe();
  } catch {}
})();
