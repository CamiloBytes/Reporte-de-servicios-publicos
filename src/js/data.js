import { api } from './api.js';
import { authentication } from './auth.js';

const BASE_URL = "http://localhost:3000";

export const data = {
    // GET con autenticación opcional
    async get(endpoint, requireAuth = false) {
        if (requireAuth && !authentication.isAuthenticated()) {
            throw new Error("Usuario no autenticado");
        }
        
        try {
            const response = await fetch(`${BASE_URL}${endpoint}`);
            if (!response.ok) {
                throw new Error(`Error en la petición GET: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Error en GET:", error);
            throw error;
        }
    },

    // POST con autenticación opcional
    async post(endpoint, data, requireAuth = false) {
        if (requireAuth && !authentication.isAuthenticated()) {
            throw new Error("Usuario no autenticado");
        }
        
        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                throw new Error(`Error en la petición POST: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Error en POST:", error);
            throw error;
        }
    },

    // PUT con autenticación opcional
    async put(endpoint, data, requireAuth = false) {
        if (requireAuth && !authentication.isAuthenticated()) {
            throw new Error("Usuario no autenticado");
        }
        
        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                throw new Error(`Error en la petición PUT: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Error en PUT:", error);
            throw error;
        }
    },

    // DELETE con autenticación opcional
    async delete(endpoint, requireAuth = false) {
        if (requireAuth && !authentication.isAuthenticated()) {
            throw new Error("Usuario no autenticado");
        }
        
        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method: "DELETE"
            });
            if (!response.ok) {
                throw new Error(`Error en la petición DELETE: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Error en DELETE:", error);
            throw error;
        }
    },

    // Métodos específicos para datos de usuario autenticado
    async getUserData() {
        const user = authentication.getUserLocal();
        if (!user) {
            throw new Error("No hay usuario autenticado");
        }
        return await this.get(`/users/${user.id}`, true);
    },

    async updateUserData(userData) {
        const user = authentication.getUserLocal();
        if (!user) {
            throw new Error("No hay usuario autenticado");
        }
        return await this.put(`/users/${user.id}`, userData, true);
    }
};