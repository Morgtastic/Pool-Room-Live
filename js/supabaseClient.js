// /js/supabaseClient.js
const SUPABASE_URL = "https://gwiweanhxxwlvnmisbbl.supabase.co"; // ← yours
const SUPABASE_ANON_KEY = "PASTE-YOUR-ANON-KEY";                  // ← from Supabase → Settings → API

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
