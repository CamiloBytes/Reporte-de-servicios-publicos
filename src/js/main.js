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
    // Redirige al dashboard del sistema de reportes
    const currentPath = window.location.pathname;
    if (currentPath.includes('/views/')) {
        window.location.href = "dashboard.html";
    } else {
        window.location.href = "./src/views/dashboard.html";
    }
}