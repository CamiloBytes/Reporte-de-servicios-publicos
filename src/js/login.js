import { alertError } from "./alert.js"
import { authentication } from "./auth.js"

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

document.getElementById("login-form").onsubmit = async event => {
    event.preventDefault()
    const email = document.getElementById("email").value
    const password = document.getElementById("password").value

    try {
        const user = await authentication.loginUser(email, password)
        console.log("Inicio de sesión exitoso:", user)

        window.goToDashboard = function () {
            const currentPath = window.location.pathname;
            if (currentPath.includes('/views/')) {
                window.location.href = "form.html";
            } else {
                window.location.href = "./src/views/dashboard.html";// Redirige al dashboard
            }
        }

        location.href = "./dashboard.html" // Redirige al dashboard
    } catch (error) {
        alertError("Error: Credenciales inválidas")
    }
}
