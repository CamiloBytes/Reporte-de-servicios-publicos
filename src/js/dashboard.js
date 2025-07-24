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
        
        // Cargar datos del dashboard
        await loadDashboardData();
        
    } catch (error) {
        console.error("Error cargando dashboard:", error);
        alertError("Error cargando los datos del dashboard");
    }
}

function displayUserInfo(user) {
    // Mostrar información del usuario en el dashboard
    const userNameElement = document.getElementById("user-name");
    const userEmailElement = document.getElementById("user-email");
    const userRoleElement = document.getElementById("user-role");
    
    if (userNameElement) userNameElement.textContent = user.name || "Usuario";
    if (userEmailElement) userEmailElement.textContent = user.email || "";
    if (userRoleElement) userRoleElement.textContent = user.role || "visitor";
}

async function loadDashboardData() {
    try {
        // Usar el sistema integrado para obtener datos con autenticación
        const users = await authData.secureGet("/users", true);
        const reports = await authData.secureGet("/reports", true);
        
        console.log("Usuarios:", users);
        console.log("Reportes:", reports);
        
        // Crear la tabla con los datos
        await createTable(reports);
        
        // Actualizar estadísticas si existen elementos en el DOM
        updateStats(reports);
        
    } catch (error) {
        console.error("Error cargando datos:", error);
        authData.handleAuthError(error);
    }
}

async function createTable(reports) {
    const tableContainer = document.getElementById("createTable");
    if (!tableContainer) return;
    
    if (!reports || reports.length === 0) {
        tableContainer.innerHTML = "<p>No hay reportes disponibles</p>";
        return;
    }
    
    let tableHTML = `
        <table class="table table-striped">
            <thead>
                <tr>
                    <th>CÉDULA</th>
                    <th>DIRECCIÓN</th>
                    <th>HORA</th>
                    <th>DESCRIPCIÓN</th>
                    <th>ESTADO</th>
                    <th>ACCIONES</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    for (let report of reports) {
        tableHTML += `
            <tr>
                <td>${report.cedula || 'N/A'}</td>
                <td>${report.direccion || 'N/A'}</td>
                <td>${report.hora || 'N/A'}</td>
                <td>${report.descripcion || 'N/A'}</td>
                <td>
                    <span class="badge ${getStatusBadgeClass(report.estado)}">
                        ${report.estado || 'Pendiente'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="viewReport('${report.id}')">
                        Ver
                    </button>
                    ${authData.canAccess('admin') ? 
                        `<button class="btn btn-sm btn-success ms-1" onclick="updateReportStatus('${report.id}', 'completado')">
                            Completar
                        </button>` : ''
                    }
                </td>
            </tr>
        `;
    }
    
    tableHTML += `
            </tbody>
        </table>
    `;
    
    tableContainer.innerHTML = tableHTML;
}

function getStatusBadgeClass(status) {
    switch(status?.toLowerCase()) {
        case 'completado': return 'bg-success';
        case 'en_proceso': return 'bg-warning';
        case 'pendiente': return 'bg-secondary';
        case 'cancelado': return 'bg-danger';
        default: return 'bg-secondary';
    }
}

function updateStats(reports) {
    const totalReports = reports.length;
    const completedReports = reports.filter(r => r.estado === 'completado').length;
    const pendingReports = reports.filter(r => r.estado === 'pendiente').length;
    
    // Actualizar elementos de estadísticas si existen
    const totalElement = document.getElementById("total-reports");
    const completedElement = document.getElementById("completed-reports");
    const pendingElement = document.getElementById("pending-reports");
    
    if (totalElement) totalElement.textContent = totalReports;
    if (completedElement) completedElement.textContent = completedReports;
    if (pendingElement) pendingElement.textContent = pendingReports;
}

// Funciones globales para acciones
window.viewReport = async function(reportId) {
    try {
        const report = await authData.secureGet(`/reports/${reportId}`, true);
        console.log("Reporte:", report);
        // Aquí puedes abrir un modal o redirigir a una página de detalles
        alert(`Reporte: ${report.descripcion}`);
    } catch (error) {
        console.error("Error obteniendo reporte:", error);
        alertError("Error cargando el reporte");
    }
};

window.updateReportStatus = async function(reportId, newStatus) {
    try {
        if (!authData.canAccess('admin')) {
            alertError("No tienes permisos para realizar esta acción");
            return;
        }
        
        await authData.securePut(`/reports/${reportId}`, { 
            estado: newStatus,
            updatedAt: new Date().toISOString()
        }, true);
        
        // Recargar los datos del dashboard
        await loadDashboardData();
        
        console.log("Estado del reporte actualizado");
    } catch (error) {
        console.error("Error actualizando reporte:", error);
        alertError("Error actualizando el reporte");
    }
};

window.logout = function() {
    authData.auth.logout();
};

// Refrescar datos cada 30 segundos (opcional)
setInterval(async () => {
    if (authData.auth.isAuthenticated()) {
        try {
            await authData.auth.validateSession();
            await loadDashboardData();
        } catch (error) {
            console.log("Error en actualización automática:", error);
        }
    }
}, 30000);