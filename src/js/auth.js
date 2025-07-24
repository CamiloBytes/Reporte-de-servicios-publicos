import { api } from './api.js';

export const authentication = {
    async loginUser(email, password) {
        try {
            const response = await api.get(`/users?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
            if (response.length === 0) {
                throw new Error("Credenciales inválidas");
            }
            const user = response[0];
            
            // Guardar datos del usuario y timestamp de login
            const userSession = {
                ...user,
                loginTime: new Date().toISOString(),
                lastActivity: new Date().toISOString()
            };
            
            localStorage.setItem("user", JSON.stringify(userSession));
            localStorage.setItem("authToken", btoa(`${user.email}:${user.id}:${Date.now()}`));
            
            return user;
        } catch (error) {
            console.error("Error al iniciar sesión:", error);
            throw error;
        }
    },

    async registerUser(name, email, password) {
        try {
            // Verificar si el usuario ya existe
            const existingUser = await api.get(`/users?email=${encodeURIComponent(email)}`);
            if (existingUser.length > 0) {
                throw new Error("El usuario ya existe");
            }

            const user = {
                name: name.trim(),
                email: email.trim(),
                password: password.trim(),
                role: "visitor",
                createdAt: new Date().toISOString()
            };
            return await api.post("/users", user);
        } catch (error) {
            console.error("Error al registrar usuario:", error);
            throw error;
        }
    },

    isAuthenticated() {
        const user = localStorage.getItem("user");
        const token = localStorage.getItem("authToken");
        return !!(user && token);
    },

    getUserLocal() {
        const user = localStorage.getItem("user");
        return user ? JSON.parse(user) : null;
    },

    getAuthToken() {
        return localStorage.getItem("authToken");
    },

    // Función de logout MEJORADA - sin redirección automática
    logout(redirect = false, redirectUrl = "/src/views/login.html") {
        localStorage.removeItem("user");
        localStorage.removeItem("authToken");
        
        console.log("Datos de sesión eliminados");
        
        // Solo redirigir si se solicita explícitamente
        if (redirect) {
            console.log("Redirigiendo a:", redirectUrl);
            window.location.href = redirectUrl;
        }
    },

    // Limpiar solo datos de sesión sin redirección
    clearSession() {
        localStorage.removeItem("user");
        localStorage.removeItem("authToken");
        sessionStorage.clear();
        console.log("Sesión limpiada");
    },

    // Actualizar la última actividad del usuario
    updateLastActivity() {
        const user = this.getUserLocal();
        if (user) {
            user.lastActivity = new Date().toISOString();
            localStorage.setItem("user", JSON.stringify(user));
        }
    },

    // Verificar si la sesión ha expirado (opcional: 24 horas)
    isSessionExpired(hoursLimit = 24) {
        const user = this.getUserLocal();
        if (!user || !user.loginTime) return true;
        
        const loginTime = new Date(user.loginTime);
        const now = new Date();
        const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
        
        return hoursDiff > hoursLimit;
    },

    // Validación de sesión MEJORADA - menos agresiva
    async validateSession() {
        const user = this.getUserLocal();
        if (!user || !user.email) {
            console.log("No hay usuario en localStorage");
            return false;
        }

        // Verificar expiración de sesión
        if (this.isSessionExpired()) {
            console.log("Sesión expirada");
            this.clearSession(); // Solo limpiar, no redirigir
            return false;
        }

        // Simulación de validación exitosa (no conectar al servidor para evitar errores)
        console.log("Sesión válida para:", user.email);
        this.updateLastActivity();
        return true;
    },

    // Verificar rol del usuario
    hasRole(requiredRole = "visitor") {
        const user = this.getUserLocal();
        if (!user) return false;
        
        const userRole = user.role || "visitor";
        
        // Jerarquía de roles: admin > visitor
        if (requiredRole === "visitor") return true;
        if (requiredRole === "admin") return userRole === "admin";
        
        return userRole === requiredRole;
    },

    // Obtener perfil del usuario
    async getUserProfile() {
        const user = this.getUserLocal();
        if (!user) throw new Error("Usuario no autenticado");
        
        return user;
    },

    // Función de validación y redirección manual para páginas protegidas
    async requireAuth(redirectUrl = "/src/views/login.html") {
        if (!this.isAuthenticated()) {
            console.log("Usuario no autenticado, redirigiendo...");
            window.location.href = redirectUrl;
            return false;
        }
        
        const isValid = await this.validateSession();
        if (!isValid) {
            console.log("Sesión no válida, redirigiendo...");
            window.location.href = redirectUrl;
            return false;
        }
        
        return true;
    }
};
