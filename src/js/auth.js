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

    logout() {
        localStorage.removeItem("user");
        localStorage.removeItem("authToken");
        // Redirigir al login
        window.location.href = "/src/views/login.html";
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

    // ✅ Nueva función: valida si el user en localStorage aún existe en el servidor
    async validateSession() {
        const user = this.getUserLocal();
        if (!user || !user.email) return false;

        // Verificar expiración de sesión
        if (this.isSessionExpired()) {
            this.logout();
            return false;
        }

        try {
            const response = await api.get(`/users?email=${encodeURIComponent(user.email)}`);
            const userExists = response.length > 0;
            
            if (userExists) {
                this.updateLastActivity();
            }
            
            return userExists;
        } catch (error) {
            console.error("Error validando sesión:", error);
            return false;
        }
    },

    // ✅ Llama esta función al cargar cualquier página
    async redirectIfSessionExists(targetUrl = "/src/views/dashboard.html") {
        const isValid = await this.validateSession();
        if (isValid) {
            window.location.href = targetUrl;
        } else {
            this.logout();
        }
    },

    // Verificar permisos de usuario
    hasRole(requiredRole) {
        const user = this.getUserLocal();
        if (!user) return false;
        
        const roles = ["visitor", "user", "admin"];
        const userRoleIndex = roles.indexOf(user.role);
        const requiredRoleIndex = roles.indexOf(requiredRole);
        
        return userRoleIndex >= requiredRoleIndex;
    },

    // Función para proteger rutas
    async protectRoute(requiredRole = "visitor") {
        const isValid = await this.validateSession();
        
        if (!isValid) {
            window.location.href = "/src/views/login.html";
            return false;
        }
        
        if (!this.hasRole(requiredRole)) {
            throw new Error("No tienes permisos para acceder a esta página");
        }
        
        return true;
    },

    // Obtener datos del perfil del usuario
    async getUserProfile() {
        const user = this.getUserLocal();
        if (!user) throw new Error("Usuario no autenticado");
        
        try {
            const response = await api.get(`/users/${user.id}`);
            return response;
        } catch (error) {
            console.error("Error obteniendo perfil:", error);
            throw error;
        }
    },

    // Actualizar datos del perfil
    async updateUserProfile(profileData) {
        const user = this.getUserLocal();
        if (!user) throw new Error("Usuario no autenticado");
        
        try {
            const updatedUser = await api.put(`/users/${user.id}`, {
                ...profileData,
                updatedAt: new Date().toISOString()
            });
            
            // Actualizar localStorage con los nuevos datos
            const currentSession = this.getUserLocal();
            const updatedSession = { ...currentSession, ...updatedUser };
            localStorage.setItem("user", JSON.stringify(updatedSession));
            
            return updatedUser;
        } catch (error) {
            console.error("Error actualizando perfil:", error);
            throw error;
        }
    }
};
