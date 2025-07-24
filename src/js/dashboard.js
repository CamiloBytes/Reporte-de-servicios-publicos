import { authData } from './auth-data.js';
import { alertError } from './alert.js';

// Variable global para almacenar los reportes
let allReports = [];
let currentUser = null;

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
            setupEventListeners();
        }
    } catch (error) {
        console.error("Error inicializando dashboard:", error);
        authData.handleAuthError(error);
    }
});

function setupEventListeners() {
    // Event listener para el filtro de estado
    const statusFilter = document.getElementById('status-filter');
    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            filterReports(this.value);
        });
    }
    
    // Event listener para el botón de actualizar
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async function() {
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Actualizando...';
            this.disabled = true;
            
            try {
                await loadDashboardData();
                showSuccessMessage('Datos actualizados correctamente');
            } catch (error) {
                alertError('Error al actualizar los datos');
            } finally {
                this.innerHTML = '<i class="fas fa-sync-alt"></i> Actualizar';
                this.disabled = false;
            }
        });
    }
}

async function initializeDashboard() {
    try {
        // Obtener datos del usuario actual
        currentUser = authData.auth.getUserLocal();
        console.log("Usuario actual:", currentUser);
        
        // Mostrar información del usuario en la interfaz
        displayUserInfo(currentUser);
        
        // Cargar datos del dashboard
        await loadDashboardData();
        
        // Mostrar mensaje de bienvenida
        showWelcomeMessage();
        
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
    
    if (userNameElement) userNameElement.textContent = user.name || user.email || "Usuario";
    if (userEmailElement) userEmailElement.textContent = user.email || "";
    if (userRoleElement) userRoleElement.textContent = user.role || "visitor";
}

function showWelcomeMessage() {
    const welcomeElement = document.getElementById("user-welcome");
    if (welcomeElement && currentUser) {
        const userName = currentUser.name || currentUser.email || "Usuario";
        welcomeElement.innerHTML = `Bienvenido, <span id="user-name">${userName}</span>`;
    }
}

function showSuccessMessage(message) {
    // Crear notificación temporal de éxito
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 1001;
        animation: slideIn 0.3s ease;
    `;
    notification.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

async function loadDashboardData() {
    try {
        // Usar el sistema integrado para obtener datos con autenticación
        const users = await authData.secureGet("/users", true);
        const reports = await authData.secureGet("/reports", true);
        
        console.log("Usuarios:", users);
        console.log("Reportes:", reports);
        
        // Almacenar reportes globalmente para filtrado
        allReports = reports || [];
        
        // Crear la tabla con los datos
        await createTable(allReports);
        
        // Actualizar estadísticas
        updateStats(allReports);
        
    } catch (error) {
        console.error("Error cargando datos:", error);
        
        // Si no hay datos del servidor, usar datos de ejemplo
        const exampleReports = generateExampleData();
        allReports = exampleReports;
        await createTable(exampleReports);
        updateStats(exampleReports);
        
        console.log("Usando datos de ejemplo");
    }
}

function generateExampleData() {
    return [
        {
            id: '1',
            cedula: '12345678',
            direccion: 'Calle 123 #45-67, Barrio Centro',
            hora: '2025-01-14 08:30',
            descripcion: 'Fuga de agua en la tubería principal',
            estado: 'pendiente'
        },
        {
            id: '2',
            cedula: '87654321',
            direccion: 'Carrera 15 #32-10, Barrio Norte',
            hora: '2025-01-14 10:15',
            descripcion: 'Poste de luz averiado',
            estado: 'en_proceso'
        },
        {
            id: '3',
            cedula: '11223344',
            direccion: 'Avenida 20 #15-30, Barrio Sur',
            hora: '2025-01-13 16:45',
            descripcion: 'Hueco en la vía principal',
            estado: 'completado'
        },
        {
            id: '4',
            cedula: '55667788',
            direccion: 'Calle 8 #12-25, Barrio Este',
            hora: '2025-01-13 14:20',
            descripcion: 'Alcantarilla obstruida',
            estado: 'pendiente'
        },
        {
            id: '5',
            cedula: '99887766',
            direccion: 'Carrera 25 #8-15, Barrio Oeste',
            hora: '2025-01-12 11:30',
            descripcion: 'Semáforo dañado en intersección',
            estado: 'completado'
        }
    ];
}

function filterReports(status) {
    let filteredReports = allReports;
    
    if (status && status !== '') {
        filteredReports = allReports.filter(report => 
            report.estado && report.estado.toLowerCase() === status.toLowerCase()
        );
    }
    
    createTable(filteredReports);
    updateStats(allReports); // Siempre mostrar estadísticas completas
}

async function createTable(reports) {
    const tableContainer = document.getElementById("createTable");
    if (!tableContainer) return;
    
    if (!reports || reports.length === 0) {
        tableContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 20px;"></i>
                <h3>No hay reportes disponibles</h3>
                <p>No se encontraron reportes con los filtros seleccionados</p>
            </div>
        `;
        return;
    }
    
    let tableHTML = `
        <table class="table table-striped">
            <thead>
                <tr>
                    <th><i class="fas fa-id-card"></i> CÉDULA</th>
                    <th><i class="fas fa-map-marker-alt"></i> DIRECCIÓN</th>
                    <th><i class="fas fa-clock"></i> FECHA/HORA</th>
                    <th><i class="fas fa-file-alt"></i> DESCRIPCIÓN</th>
                    <th><i class="fas fa-info-circle"></i> ESTADO</th>
                    <th><i class="fas fa-cogs"></i> ACCIONES</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    for (let report of reports) {
        tableHTML += `
            <tr>
                <td>${report.cedula || 'N/A'}</td>
                <td title="${report.direccion || 'N/A'}">${truncateText(report.direccion || 'N/A', 40)}</td>
                <td>${formatDateTime(report.hora) || 'N/A'}</td>
                <td title="${report.descripcion || 'N/A'}">${truncateText(report.descripcion || 'N/A', 50)}</td>
                <td>
                    <span class="badge ${getStatusBadgeClass(report.estado)}">
                        ${getStatusDisplayText(report.estado)}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="viewReport('${report.id}')">
                        <i class="fas fa-eye"></i> Ver
                    </button>
                    ${authData.canAccess('admin') ? 
                        `<button class="btn btn-sm btn-success ms-1" onclick="updateReportStatus('${report.id}', 'completado')">
                            <i class="fas fa-check"></i> Completar
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

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function formatDateTime(dateTime) {
    if (!dateTime) return 'N/A';
    try {
        const date = new Date(dateTime);
        return date.toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return dateTime;
    }
}

function getStatusDisplayText(status) {
    const statusMap = {
        'pendiente': 'Pendiente',
        'en_proceso': 'En Proceso',
        'completado': 'Completado',
        'cancelado': 'Cancelado'
    };
    return statusMap[status?.toLowerCase()] || 'Pendiente';
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
    const inProcessReports = reports.filter(r => r.estado === 'en_proceso').length;
    
    // Actualizar elementos de estadísticas
    const totalElement = document.getElementById("total-reports");
    const completedElement = document.getElementById("completed-reports");
    const pendingElement = document.getElementById("pending-reports");
    
    if (totalElement) {
        totalElement.textContent = totalReports;
        animateNumber(totalElement);
    }
    if (completedElement) {
        completedElement.textContent = completedReports;
        animateNumber(completedElement);
    }
    if (pendingElement) {
        pendingElement.textContent = pendingReports;
        animateNumber(pendingElement);
    }
}

function animateNumber(element) {
    element.style.transform = 'scale(1.2)';
    setTimeout(() => {
        element.style.transform = 'scale(1)';
    }, 200);
}

// Funciones globales para acciones
window.viewReport = async function(reportId) {
    try {
        const report = allReports.find(r => r.id === reportId);
        if (report) {
            showReportModal(report);
        } else {
            // Intentar obtener del servidor
            const serverReport = await authData.secureGet(`/reports/${reportId}`, true);
            showReportModal(serverReport);
        }
    } catch (error) {
        console.error("Error obteniendo reporte:", error);
        alertError("Error cargando el reporte");
    }
};

function showReportModal(report) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1002;
    `;
    
    modal.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 15px; max-width: 500px; width: 90%; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #e0e0e0; padding-bottom: 15px;">
                <h2 style="color: #d32f2f; margin: 0;"><i class="fas fa-file-alt"></i> Detalle del Reporte</h2>
                <button onclick="this.closest('div').parentElement.remove()" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #666;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div style="margin-bottom: 15px;">
                <strong style="color: #d32f2f;">Cédula:</strong> ${report.cedula || 'N/A'}
            </div>
            <div style="margin-bottom: 15px;">
                <strong style="color: #d32f2f;">Dirección:</strong> ${report.direccion || 'N/A'}
            </div>
            <div style="margin-bottom: 15px;">
                <strong style="color: #d32f2f;">Fecha y Hora:</strong> ${formatDateTime(report.hora) || 'N/A'}
            </div>
            <div style="margin-bottom: 15px;">
                <strong style="color: #d32f2f;">Estado:</strong> 
                <span class="badge ${getStatusBadgeClass(report.estado)}" style="margin-left: 10px;">
                    ${getStatusDisplayText(report.estado)}
                </span>
            </div>
            <div style="margin-bottom: 20px;">
                <strong style="color: #d32f2f;">Descripción:</strong>
                <p style="margin-top: 10px; padding: 15px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #d32f2f;">
                    ${report.descripcion || 'N/A'}
                </p>
            </div>
            <div style="text-align: center;">
                <button onclick="this.closest('div').parentElement.remove()" class="btn btn-primary">
                    <i class="fas fa-check"></i> Cerrar
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

window.updateReportStatus = async function(reportId, newStatus) {
    try {
        if (!authData.canAccess('admin')) {
            alertError("No tienes permisos para realizar esta acción");
            return;
        }
        
        // Actualizar en el array local primero
        const reportIndex = allReports.findIndex(r => r.id === reportId);
        if (reportIndex !== -1) {
            allReports[reportIndex].estado = newStatus;
            allReports[reportIndex].updatedAt = new Date().toISOString();
        }
        
        try {
            // Intentar actualizar en el servidor
            await authData.securePut(`/reports/${reportId}`, { 
                estado: newStatus,
                updatedAt: new Date().toISOString()
            }, true);
        } catch (serverError) {
            console.log("Error del servidor, usando actualización local:", serverError);
        }
        
        // Recargar la vista
        const currentFilter = document.getElementById('status-filter')?.value || '';
        filterReports(currentFilter);
        
        showSuccessMessage("Estado del reporte actualizado correctamente");
        
    } catch (error) {
        console.error("Error actualizando reporte:", error);
        alertError("Error actualizando el reporte");
    }
};

// Función principal de cerrar sesión
window.logout = function() {
    // Mostrar confirmación antes de cerrar sesión
    const confirmLogout = confirm('¿Está seguro que desea cerrar sesión?');
    
    if (confirmLogout) {
        try {
            // Limpiar datos locales
            localStorage.clear();
            sessionStorage.clear();
            
            // Usar el método de logout del sistema de autenticación
            if (authData && authData.auth && typeof authData.auth.logout === 'function') {
                authData.auth.logout();
            } else {
                // Fallback: redirigir manualmente
                window.location.href = '../views/login.html';
            }
            
            console.log("Sesión cerrada correctamente");
            
        } catch (error) {
            console.error("Error cerrando sesión:", error);
            // Forzar redirección en caso de error
            window.location.href = '../views/login.html';
        }
    }
};

// Refrescar datos cada 2 minutos (opcional)
setInterval(async () => {
    if (authData.auth.isAuthenticated()) {
        try {
            await authData.auth.validateSession();
            await loadDashboardData();
            console.log("Datos actualizados automáticamente");
        } catch (error) {
            console.log("Error en actualización automática:", error);
        }
    }
}, 120000); // 2 minutos

// Agregar estilos CSS para animaciones
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
    
    .stat-number {
        transition: all 0.3s ease;
    }
`;
document.head.appendChild(style);