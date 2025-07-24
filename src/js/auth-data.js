import { authentication } from './auth.js';
import { data } from './data.js';
import { api } from './api.js';

/**
 * Módulo integrado para autenticación y manejo de datos
 * Combina funcionalidades de auth.js y data.js
 */
export const authData = {
    // Re-exportar funciones de autenticación
    auth: authentication,
    
    // Re-exportar funciones de datos
    data: data,
    
    // Funciones integradas que combinan auth + data
    
    /**
     * Realiza una petición GET con verificación automática de autenticación
     */
    async secureGet(endpoint, requireAuth = true) {
        if (requireAuth && !authentication.isAuthenticated()) {
            authentication.logout();
            throw new Error("Usuario no autenticado");
        }
        
        // Actualizar actividad del usuario
        if (authentication.isAuthenticated()) {
            authentication.updateLastActivity();
        }
        
        return await data.get(endpoint, requireAuth);
    },

    /**
     * Realiza una petición POST con verificación automática de autenticación
     */
    async securePost(endpoint, postData, requireAuth = true) {
        if (requireAuth && !authentication.isAuthenticated()) {
            authentication.logout();
            throw new Error("Usuario no autenticado");
        }
        
        // Actualizar actividad del usuario
        if (authentication.isAuthenticated()) {
            authentication.updateLastActivity();
        }
        
        return await data.post(endpoint, postData, requireAuth);
    },

    /**
     * Realiza una petición PUT con verificación automática de autenticación
     */
    async securePut(endpoint, putData, requireAuth = true) {
        if (requireAuth && !authentication.isAuthenticated()) {
            authentication.logout();
            throw new Error("Usuario no autenticado");
        }
        
        // Actualizar actividad del usuario
        if (authentication.isAuthenticated()) {
            authentication.updateLastActivity();
        }
        
        return await data.put(endpoint, putData, requireAuth);
    },

    /**
     * Realiza una petición DELETE con verificación automática de autenticación
     */
    async secureDelete(endpoint, requireAuth = true) {
        if (requireAuth && !authentication.isAuthenticated()) {
            authentication.logout();
            throw new Error("Usuario no autenticado");
        }
        
        // Actualizar actividad del usuario
        if (authentication.isAuthenticated()) {
            authentication.updateLastActivity();
        }
        
        return await data.delete(endpoint, requireAuth);
    },

    /**
     * Inicializa la sesión en una página
     * Verifica autenticación y redirecciona si es necesario
     */
    async initializePage(options = {}) {
        const {
            requireAuth = true,
            requiredRole = "visitor",
            redirectToLogin = "/src/views/login.html",
            redirectToDashboard = "/src/views/dashboard.html"
        } = options;

        try {
            if (requireAuth) {
                const isValid = await authentication.validateSession();
                
                if (!isValid) {
                    window.location.href = redirectToLogin;
                    return false;
                }
                
                if (!authentication.hasRole(requiredRole)) {
                    throw new Error(`Requiere rol: ${requiredRole}`);
                }
            }
            
            return true;
        } catch (error) {
            console.error("Error inicializando página:", error);
            if (requireAuth) {
                window.location.href = redirectToLogin;
            }
            return false;
        }
    },

    /**
     * Login con redirección automática
     */
    async loginAndRedirect(email, password, redirectTo = "/src/views/dashboard.html") {
        try {
            const user = await authentication.loginUser(email, password);
            console.log("Login exitoso:", user);
            window.location.href = redirectTo;
            return user;
        } catch (error) {
            console.error("Error en login:", error);
            throw error;
        }
    },

    /**
     * Obtener datos del usuario actual con validación de sesión
     */
    async getCurrentUserData() {
        await authentication.validateSession();
        return await authentication.getUserProfile();
    },

    /**
     * Función utilitaria para manejar errores de autenticación
     */
    handleAuthError(error, fallbackUrl = "/src/views/login.html") {
        console.error("Error de autenticación:", error);
        
        if (error.message.includes("autenticado") || 
            error.message.includes("autenticacion") ||
            error.message.includes("sesión")) {
            authentication.logout();
            window.location.href = fallbackUrl;
        }
        
        throw error;
    },

    /**
     * Verificar si el usuario tiene acceso a una funcionalidad específica
     */
    canAccess(requiredRole = "visitor") {
        return authentication.isAuthenticated() && authentication.hasRole(requiredRole);
    },

    /**
     * Configurar interceptores automáticos para todas las peticiones
     */
    setupAutoAuth() {
        // Interceptar errores 401/403 automáticamente
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            try {
                const response = await originalFetch(...args);
                
                if (response.status === 401 || response.status === 403) {
                    console.warn("Sesión expirada, redirigiendo al login...");
                    authentication.logout();
                }
                
                return response;
            } catch (error) {
                console.error("Error en petición:", error);
                throw error;
            }
        };
    }
};

// Configurar interceptores automáticamente
authData.setupAutoAuth();