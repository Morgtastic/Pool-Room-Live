// /vendor/supabase-global.js
// Robust loader: injects UMD script tag; fires 'supabase-ready' on success.
(function loadSupabaseUMD() {
  function ok() {
    // UMD exposes global window.supabase
    if (window.supabase && typeof window.supabase.createClient === 'function') {
      window.dispatchEvent(new Event('supabase-ready'));
    } else {
      console.error('[supabase-global] UMD loaded but window.supabase missing.');
    }
  }
  function add(src, onerror) {
    var s = document.createElement('script');
    s.src = src;
    s.defer = true;
    s.onload = ok;
    s.onerror = onerror || function(e){ console.error('[supabase-global] failed:', src); };
    document.head.appendChild(s);
  }
  // Try jsDelivr UMD, then fallback to unpkg UMD
  add('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js', function(){
    add('https://unpkg.com/@supabase/supabase-js@2/dist/umd/supabase.js');
  });
})();
