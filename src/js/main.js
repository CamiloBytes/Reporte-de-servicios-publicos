// Esta función la hacemos global para que el HTML pueda usarla con onclick=""
window.goToLogin = function () {
    // Redirige a la vista de login
    const currentPath = window.location.pathname;
    if (currentPath.includes('/views/')) {
        window.location.href = "login.html";
    } else {
        window.location.href = "./src/views/login.html";
    }
}

// Esta función la hacemos global para que el HTML pueda usarla con onclick=""
window.goToHome = function () {
    // Redirige a la vista de home (página principal)
    const currentPath = window.location.pathname;
    if (currentPath.includes('/views/')) {
        window.location.href = "../../index.html";
    } else {
        window.location.href = "./index.html";
    }
}

// Esta función la hacemos global para que el HTML pueda usarla con onclick=""
window.goToForm = function () {
    // Redirige a la vista del formulario de reportes de daños
    const currentPath = window.location.pathname;
    if (currentPath.includes('/views/')) {
        window.location.href = "form.html";
    } else {
        window.location.href = "./src/views/form.html";
    }
}

// Esta función la hacemos global para que el HTML pueda usarla con onclick=""
window.goToDashboard = function () {
    // Verificar autenticación antes de redirigir al dashboard
    try {
        const user = localStorage.getItem("user");
        const token = localStorage.getItem("authToken");
        
        // Si no hay datos de autenticación, redirigir al login
        if (!user || !token) {
            console.log("Acceso denegado: Usuario no autenticado");
            window.goToLogin();
            return;
        }
        
        // Si está autenticado, proceder con la redirección al dashboard
        const currentPath = window.location.pathname;
        if (currentPath.includes('/views/')) {
            window.location.href = "dashboard.html";
        } else {
            window.location.href = "./src/views/dashboard.html";
        }
    } catch (error) {
        console.error("Error verificando autenticación:", error);
        // En caso de error, redirigir al login por seguridad
        window.goToLogin();
    }
}