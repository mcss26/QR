// config.js
// Centralized configuration for Midnight QR
const SB_URL = "https://zlhnxrsbdhbmqwlbyqbt.supabase.co";
const SB_KEY = "sb_publishable_fPAvZGteb6eNrs5jrU1Ejg_jp7etyZe";

if (!window.supabase) {
    console.error("Supabase SDK not loaded!");
}

const supabaseClient = window.supabase.createClient(SB_URL, SB_KEY);
window.supabaseClient = supabaseClient;
