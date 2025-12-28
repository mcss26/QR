// Supabase Configuration
const SB_URL = "https://zlhnxrsbdhbmqwlbyqbt.supabase.co";
const SB_KEY = "sb_publishable_fPAvZGteb6eNrs5jrU1Ejg_jp7etyZe";

const supabase = window.supabase.createClient(SB_URL, SB_KEY);

const el = (id) => document.getElementById(id);

async function init() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
        window.location.href = '../auth/login.html';
        return;
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

    if (!profile || profile.role !== 'ADMIN') {
        alert("Acceso restringido a Administradores.");
        window.location.href = '../auth/login.html';
        return;
    }

    el('userWelcome').textContent = `Hola, ${profile.full_name || 'Admin'}`;
    
    loadStats();
    loadActivity();
}

async function loadStats() {
    const { count: total } = await supabase.from('qr_codes').select('*', { count: 'exact', head: true });
    const { count: accredited } = await supabase.from('qr_codes').select('*', { count: 'exact', head: true }).eq('status', 'ACREDITADO');
    const { count: pending } = await supabase.from('qr_codes').select('*', { count: 'exact', head: true }).eq('status', 'PENDIENTE');

    el('totalQrs').textContent = total || 0;
    el('totalAccredited').textContent = accredited || 0;
    el('totalPending').textContent = pending || 0;
}

async function loadActivity() {
    const { data, error } = await supabase
        .from('qr_checkins')
        .select('*, qr_codes(code), profiles!qr_checkins_operator_id_fkey(full_name)')
        .order('created_at', { ascending: false })
        .limit(10);

    const list = el('activityList');
    list.innerHTML = "";

    if (error || !data || data.length === 0) {
        list.innerHTML = '<p class="empty-msg">No hay actividad reciente.</p>';
        return;
    }

    data.forEach(item => {
        const div = document.createElement('div');
        div.className = "activity-item";
        div.innerHTML = `
            <div class="a-main">
                <span class="a-code">${item.qr_codes?.code || '---'}</span>
                <span class="a-meta">Por ${item.profiles?.full_name || 'Staff'} • ${new Date(item.created_at).toLocaleString()}</span>
            </div>
            <span class="a-status ${item.success ? 'ok' : 'no'}">${item.success ? 'Acceso OK' : 'Denegado'}</span>
        `;
        list.appendChild(div);
    });
}

el('btnLogout').addEventListener('click', async () => {
    await supabaseClient.auth.signOut();
    window.location.href = '../auth/login.html';
});

init();
