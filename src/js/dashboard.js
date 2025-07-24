import { authData } from './auth-data.js';
import { alertError } from './alert.js';

// Inicializar página con protección de autenticación
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Proteger la ruta - requiere autenticación
        const isAuthorized = await authData.initializePage({
            requireAuth: true,
            requiredRole: "visitor"
        });
        
        if (isAuthorized) {
            await initializeDashboard();
        }
    } catch (error) {
        console.error("Error inicializando dashboard:", error);
        authData.handleAuthError(error);
    }
});

async function initializeDashboard() {
    try {
        // Obtener datos del usuario actual
        const currentUser = authData.auth.getUserLocal();
        console.log("Usuario actual:", currentUser);
        
        // Mostrar información del usuario en la interfaz
        displayUserInfo(currentUser);
        
    } catch (error) {
        console.error("Error cargando dashboard:", error);
        alertError("Error cargando los datos del dashboard");
    }
}

function displayUserInfo(user) {
    // Mostrar información del usuario en el dashboard
    const userNameElement = document.getElementById("user-name");
    if (userNameElement) userNameElement.textContent = user.name || user.email || "Usuario";
}

// Función de cerrar sesión (ÚNICO CAMBIO AGREGADO)
window.logout = function() {
    // Mostrar confirmación antes de cerrar sesión
    const confirmLogout = confirm('¿Está seguro que desea cerrar sesión?');
    
    if (confirmLogout) {
        try {
            // Limpiar datos locales
            localStorage.removeItem("user");
            localStorage.removeItem("authToken");
            sessionStorage.clear();
            
            console.log("Sesión cerrada correctamente");
            
            // Redirección manual y controlada
            window.location.href = '../views/login.html';
            
        } catch (error) {
            console.error("Error cerrando sesión:", error);
            // Forzar redirección en caso de error
            window.location.href = '../views/login.html';
        }
    }
};