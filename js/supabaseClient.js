// FILE: js/supabaseClient.js
// TYPE: Plain JavaScript file (NO <script> tags, NO SQL, NO Markdown fences)

const SUPABASE_URL = "https://gwiweanhxxwlvnmisbbl.supabase.co"; // ← exact project URL
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3aXdlYW5oeHh3bHZubWlzYmJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMjUxMjksImV4cCI6MjA3NTYwMTEyOX0.FaQeS9jH3WFgFGkSipjaj3lgPdm5Xoo-hGikXzWRqvg";            // ← Settings → API → Anonymous public

// Safety checks (helps catch bad pastes)
if (!/^https:\/\/[a-z0-9]+\.supabase\.co$/.test(SUPABASE_URL)) {
  console.error("SUPABASE_URL looks wrong. Expected https://xxxxx.supabase.co");
}
if (!/^eyJ/.test(SUPABASE_ANON_KEY)) {
  console.error("Anon key should start with 'eyJ…' (JWT). Did you paste the service role or add extra quotes/lines?");
}

if (!window.supabase) {
  throw new Error("Supabase SDK not loaded. Ensure index.html/admin.html include @supabase/supabase-js@2 <script> before this file.");
}

// Create client
window.sb = window.sb || {};
sb.client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  realtime: { params: { eventsPerSecond: 10 } }
});

// Shared helpers
sb.statusLabel = (s) => ({ green: "Open / No wait", yellow: "Moderate wait", red: "Full / Busy" }[s] ?? s);
sb.statusEmoji = (s) => ({ green: "🟢", yellow: "🟡", red: "🔴" }[s] ?? "❓");
sb.dotClass = (s) => ({ green: "dot-green", yellow: "dot-yellow", red: "dot-red" }[s] ?? "dot-red");
sb.formatTime = (iso) => { try { return new Date(iso).toLocaleString(); } catch { return ""; } };
sb.boardUrl = () => new URL("./index.html", window.location.href).toString();
sb.roomUrl = (slugOrId) => { const u = new URL(sb.boardUrl()); u.searchParams.set("room", slugOrId); return u.toString(); };

// Expose for diagnostics
window.SUPABASE_URL = SUPABASE_URL;
window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;

/* Quick self-test (shows clear errors in the console)
   - Why: to immediately surface misconfigured URL/key on any page that loads this file. */
(async () => {
  try {
    const { error } = await sb.client.from("rooms").select("id", { head: true, count: "exact" });
    if (error) console.error("Supabase 'rooms' test failed:", error.message);
  } catch (e) {
    console.error("Supabase client test threw:", e.message);
  }
})();


// Expose for diagnostics
window.SUPABASE_URL = SUPABASE_URL;
window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;
