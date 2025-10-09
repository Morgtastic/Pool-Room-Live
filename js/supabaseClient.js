// /js/supabaseClient.js
const SUPABASE_URL = "https://gwiweanhxxwlvnmisbbl.supabase.co"; // ← yours
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3aXdlYW5oeHh3bHZubWlzYmJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMjUxMjksImV4cCI6MjA3NTYwMTEyOX0.FaQeS9jH3WFgFGkSipjaj3lgPdm5Xoo-hGikXzWRqvg";                  // ← from Supabase → Settings → API

if (SUPABASE_URL.includes("YOUR-PROJECT-REF")) {
  console.warn("Configure SUPABASE_URL and SUPABASE_ANON_KEY in /js/supabaseClient.js");
}

window.sb = window.sb || {};
sb.client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  realtime: { params: { eventsPerSecond: 10 } }
});

sb.statusLabel = (s) => ({green:"Open / No wait", yellow:"Moderate wait", red:"Full / Busy"}[s] ?? s);
sb.statusEmoji = (s) => ({green:"🟢", yellow:"🟡", red:"🔴"}[s] ?? "❓");
sb.dotClass = (s) => ({green:"dot-green", yellow:"dot-yellow", red:"dot-red"}[s] ?? "dot-red");
sb.formatTime = (iso) => { try { return new Date(iso).toLocaleString(); } catch { return ""; } };
sb.boardUrl = () => new URL("./index.html", window.location.href).toString();
sb.roomUrl = (slugOrId) => { const u = new URL(sb.boardUrl()); u.searchParams.set("room", slugOrId); return u.toString(); };
