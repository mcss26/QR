// Config is loaded from ../config.js which provides window.supabaseClient
const supabase = window.supabaseClient;

const loginForm = document.getElementById('loginForm');
const errorBanner = document.getElementById('errorMessage');
const submitBtn = document.getElementById('submitBtn');
const loader = submitBtn.querySelector('.loader');
const btnText = submitBtn.querySelector('span');

// Check if already logged in
async function checkCurrentSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        handleRedirection(session.user);
    }
}

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    setLoading(true);
    errorBanner.classList.add('hidden');

    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) throw error;
        
        handleRedirection(data.user);

    } catch (err) {
        errorBanner.textContent = err.message || "Error al iniciar sesión";
        errorBanner.classList.remove('hidden');
        setLoading(false);
    }
});

async function handleRedirection(user) {
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (error || !profile) {
        errorBanner.textContent = "No se pudo obtener el perfil del usuario.";
        errorBanner.classList.remove('hidden');
        setLoading(false);
        return;
    }

    if (profile.role === 'ADMIN') {
        window.location.href = '../admin/index.html';
    } else if (profile.role === 'OPERATIVO') {
        window.location.href = '../scanner/index.html';
    } else {
        errorBanner.textContent = "No tienes permisos suficidntes.";
        errorBanner.classList.remove('hidden');
        setLoading(false);
        await supabase.auth.signOut();
    }
}

function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    if (isLoading) {
        loader.classList.remove('hidden');
        btnText.style.opacity = '0.5';
    } else {
        loader.classList.add('hidden');
        btnText.style.opacity = '1';
    }
}

checkCurrentSession();
