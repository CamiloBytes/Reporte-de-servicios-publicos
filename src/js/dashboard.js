import Swal from "sweetalert2";
import { authentication } from './auth.js';

// Verificar autenticación antes de continuar con la carga del dashboard
await authentication.requireAuth();

// Función de cerrar sesión
window.logout = function() {
    // Mostrar confirmación antes de cerrar sesión
    Swal.fire({
        title: "¿Está seguro que desea cerrar sesión?",
        showCancelButton: true,
        confirmButtonText: "Si",
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            try {
                // Limpiar datos locales
                localStorage.removeItem("user")
                localStorage.removeItem("authToken")
                sessionStorage.clear()
                
                console.log("Sesión cerrada correctamente")
                
                // Redirección manual y controlada
                window.location.href = '../views/login.html'
                
            } catch (error) {
                console.error("Error cerrando sesión:", error)
                // Forzar redirección en caso de error
                window.location.href = '../views/login.html'
            }
        } 
      });
    
}

// Mostrar información del usuario si existe el elemento
document.addEventListener('DOMContentLoaded', () => {
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        const userNameElement = document.getElementById("user-name")
        if (userNameElement && user.name) {
            userNameElement.textContent = user.name || user.email || "Usuario"
        }
        console.log("Dashboard: información de usuario cargada")
    } catch (error) {
        console.log("Dashboard: no se pudo cargar información de usuario")
    }
})