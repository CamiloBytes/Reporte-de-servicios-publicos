import { authData } from './auth-data.js';

// Usuarios de prueba para el sistema sin servidor
const testUsers = [
    {
        id: 1,
        name: "Administrador",
        email: "admin@sistema.com",
        password: "admin123",
        role: "admin"
    },
    {
        id: 2,
        name: "Usuario Visitante",
        email: "user@sistema.com", 
        password: "user123",
        role: "visitor"
    },
    {
        id: 3,
        name: "Juan Pérez",
        email: "juan@correo.com",
        password: "123456",
        role: "visitor"
    }
];

document.addEventListener('DOMContentLoaded', function() {
    console.log("Login page loaded");
    
    // Verificar si ya hay una sesión activa
    const user = authData.auth.getUserLocal();
    if (user && authData.auth.getAuthToken()) {
        console.log("Usuario ya autenticado, redirigiendo al dashboard...");
        // Dar tiempo para que se vea la página antes de redireccionar
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 500);
        return;
    }

    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Mostrar información de usuarios de prueba
    showTestUsersInfo();
});

async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email')?.value?.trim();
    const password = document.getElementById('password')?.value?.trim();
    
    console.log("Intento de login:", { email, password: "***" });

    if (!email || !password) {
        showNotification("Por favor complete todos los campos", "error");
        return;
    }

    // Mostrar indicador de carga
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Iniciando sesión...';
    submitButton.disabled = true;

    try {
        // Simulación de login con usuarios de prueba
        const user = await simulateLogin(email, password);
        
        console.log("Login exitoso:", user);
        showNotification("Inicio de sesión exitoso", "success");
        
        // Redirigir al dashboard después de un breve delay
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
        
    } catch (error) {
        console.error("Error en login:", error);
        showNotification(error.message || "Error al iniciar sesión", "error");
    } finally {
        // Restaurar botón
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    }
}

// Función de login simulado para trabajar sin servidor
async function simulateLogin(email, password) {
    return new Promise((resolve, reject) => {
        // Simular delay de red
        setTimeout(() => {
            // Buscar usuario en la lista de prueba
            const user = testUsers.find(u => u.email === email && u.password === password);
            
            if (user) {
                // Crear sesión local
                const userSession = {
                    ...user,
                    loginTime: new Date().toISOString(),
                    lastActivity: new Date().toISOString()
                };
                
                localStorage.setItem("user", JSON.stringify(userSession));
                localStorage.setItem("authToken", btoa(`${user.email}:${user.id}:${Date.now()}`));
                
                resolve(user);
            } else {
                reject(new Error("Credenciales inválidas. Verifique su email y contraseña."));
            }
        }, 800); // Simular delay de 800ms
    });
}

function showTestUsersInfo() {
    // Crear un panel informativo con los usuarios de prueba
    const infoPanel = document.createElement('div');
    infoPanel.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
        color: white;
        padding: 15px;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        max-width: 300px;
        z-index: 1000;
        font-size: 12px;
        cursor: pointer;
    `;
    
    infoPanel.innerHTML = `
        <div style="margin-bottom: 10px;">
            <strong><i class="fas fa-info-circle"></i> Usuarios de Prueba</strong>
        </div>
        <div style="margin-bottom: 5px;">
            <strong>👤 Admin:</strong> admin@sistema.com / admin123
        </div>
        <div style="margin-bottom: 5px;">
            <strong>👤 Usuario:</strong> user@sistema.com / user123
        </div>
        <div style="margin-bottom: 5px;">
            <strong>👤 Juan:</strong> juan@correo.com / 123456
        </div>
        <div style="font-style: italic; margin-top: 10px; font-size: 10px;">
            Click para ocultar
        </div>
    `;
    
    infoPanel.addEventListener('click', () => {
        infoPanel.remove();
    });
    
    document.body.appendChild(infoPanel);
    
    // Auto-ocultar después de 10 segundos
    setTimeout(() => {
        if (infoPanel.parentNode) {
            infoPanel.remove();
        }
    }, 10000);
}

function showNotification(message, type = "info") {
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3';
    
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: linear-gradient(135deg, ${bgColor} 0%, ${adjustBrightness(bgColor, -20)} 100%);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 1001;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;
    
    const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle';
    notification.innerHTML = `<i class="fas fa-${icon}"></i> ${message}`;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

function adjustBrightness(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

// Funciones globales para navegación
window.goToHome = function() {
    window.location.href = "../../index.html";
};

window.goToForm = function() {
    window.location.href = "form.html";
};

// Agregar estilos para animaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
