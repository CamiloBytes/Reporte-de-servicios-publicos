import { alertError } from "./alert.js"
import { authData } from "./auth-data.js"

window.goToHome = function () {
    // Redirige a la vista de home
    const currentPath = window.location.pathname;
    if (currentPath.includes('/views/')) {
        window.location.href = "../../index.html";
    } else {
        window.location.href = "./index.html";
    }
}

window.goToForm = function () {
    // Redirige a la vista del formulario
    const currentPath = window.location.pathname;
    if (currentPath.includes('/views/')) {
        window.location.href = "form.html";
    } else {
        window.location.href = "./src/views/form.html";
    }
}

// Verificar si ya hay una sesión activa al cargar la página
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const isAuthenticated = authData.auth.isAuthenticated();
        if (isAuthenticated) {
            const isValid = await authData.auth.validateSession();
            if (isValid) {
                // Usuario ya tiene sesión válida, redirigir al dashboard
                window.location.href = "./dashboard.html";
                return;
            }
        }
    } catch (error) {
        console.log("No hay sesión previa o sesión inválida");
    }
});

document.getElementById("login-form").onsubmit = async event => {
    event.preventDefault()
    
    const email = document.getElementById("email").value.trim()
    const password = document.getElementById("password").value.trim()

    // Validaciones básicas
    if (!email || !password) {
        alertError("Por favor, ingresa email y contraseña")
        return
    }

    try {
        // Usar el módulo integrado para login con redirección automática
        await authData.loginAndRedirect(email, password, "./dashboard.html")
    } catch (error) {
        console.error("Error en login:", error)
        alertError(`Error: ${error.message || "Credenciales inválidas"}`)
    }
}

// Función global para redirección al dashboard (mantenida para compatibilidad)
window.goToDashboard = function () {
    const currentPath = window.location.pathname;
    if (currentPath.includes('/views/')) {
        window.location.href = "dashboard.html";
    } else {
        window.location.href = "./src/views/dashboard.html";
    }
}
