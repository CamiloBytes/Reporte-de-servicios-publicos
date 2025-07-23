import { api } from './api.js';

export const authentication = {
    async loginUser(email, password) {
        try {
            const response = await api.get(`/users?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
            if (response.length === 0) {
                throw new Error("Credenciales inválidas");
            }
            const user = response[0];
            localStorage.setItem("user", JSON.stringify(user));
            return user;
        } catch (error) {
            console.error("Error al iniciar sesión:", error);
            throw error;
        }
    },

    async registerUser(name, email, password) {
        try {
            const user = {
                name: name.trim(),
                email: email.trim(),
                password: password.trim(),
                role: "visitor"
            };
            return await api.post("/users", user);
        } catch (error) {
            console.error("Error al registrar usuario:", error);
            throw error;
        }
    },

    isAuthenticated() {
        return !!localStorage.getItem("user");
    },

    getUserLocal() {
        const user = localStorage.getItem("user");
        return user ? JSON.parse(user) : null;
    },

    logout() {
        localStorage.removeItem("user");
    },

    // ✅ Nueva función: valida si el user en localStorage aún existe en el servidor
    async validateSession() {
        const user = this.getUserLocal();
        if (!user || !user.email) return false;

        try {
            const response = await api.get(`/users?email=${encodeURIComponent(user.email)}`);
            return response.length > 0;
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
            window.location.href = "/src/views/login.html";
        }
    }
};
