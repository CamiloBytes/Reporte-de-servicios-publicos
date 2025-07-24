import { authData } from './auth-data.js';
import { alertError } from './alert.js';

// Variable global para almacenar los reportes
let allReports = [];
let currentUser = null;
let isLoadingData = false; // Prevenir cargas múltiples
let initializationCompleted = false; // Prevenir inicializaciones múltiples

// Inicializar página con protección de autenticación
document.addEventListener('DOMContentLoaded', async () => {
    // Prevenir múltiples inicializaciones
    if (initializationCompleted) {
        console.log("Dashboard ya inicializado, saltando...");
        return;
    }

    try {
        // Verificación básica de autenticación sin redirecciones automáticas
        const user = authData.auth.getUserLocal();
        const token = authData.auth.getAuthToken();
        
        if (!user || !token) {
            console.log("No hay sesión válida, redirigiendo al login...");
            window.location.href = '../views/login.html';
            return;
        }

        // Si llegamos aquí, el usuario está logueado
        console.log("Usuario autenticado:", user);
        await initializeDashboard();
        setupEventListeners();
        initializationCompleted = true;
        
    } catch (error) {
        console.error("Error inicializando dashboard:", error);
        showErrorMessage("Error inicializando el dashboard");
        
        // Solo redirigir en caso de error real de autenticación
        setTimeout(() => {
            window.location.href = '../views/login.html';
        }, 2000);
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
            if (isLoadingData) return; // Prevenir clicks múltiples
            
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Actualizando...';
            this.disabled = true;
            
            try {
                await loadDashboardData();
                showSuccessMessage('Datos actualizados correctamente');
            } catch (error) {
                showErrorMessage('Error al actualizar los datos');
            } finally {
                this.innerHTML = '<i class="fas fa-sync-alt"></i> Actualizar';
                this.disabled = false;
            }
        });
    }
}

function showErrorMessage(message) {
    // Crear notificación temporal de error sin usar alertError que puede causar recargas
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 1001;
        animation: slideIn 0.3s ease;
    `;
    notification.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

async function initializeDashboard() {
    if (isLoadingData) return;
    
    try {
        isLoadingData = true;
        
        // Obtener datos del usuario desde localStorage
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
        showErrorMessage("Error cargando los datos del dashboard");
    } finally {
        isLoadingData = false;
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
    if (isLoadingData) return;
    
    try {
        isLoadingData = true;
        
        // Intentar cargar desde json-server
        console.log("Cargando reportes desde json-server...");
        
        try {
            const reports = await authData.secureGet("/reports", false);
            
            if (reports && Array.isArray(reports) && reports.length > 0) {
                console.log("Reportes cargados desde json-server:", reports);
                allReports = transformReportsData(reports);
            } else {
                console.log("No hay reportes en json-server, usando datos de ejemplo");
                allReports = generateExampleData();
            }
        } catch (serverError) {
            console.log("Error conectando con json-server, usando datos de ejemplo:", serverError);
            allReports = generateExampleData();
        }
        
        // Crear la tabla con los datos
        await createTable(allReports);
        
        // Actualizar estadísticas
        updateStats(allReports);
        
    } catch (error) {
        console.error("Error cargando datos:", error);
        showErrorMessage("Error cargando los datos");
        
        // Como último recurso, usar datos de ejemplo vacíos
        allReports = [];
        await createTable(allReports);
        updateStats(allReports);
    } finally {
        isLoadingData = false;
    }
}

// Transformar datos del json-server al formato esperado
function transformReportsData(serverReports) {
    return serverReports.map(report => ({
        id: report.id,
        cedula: report.ccUser,
        direccion: report.address,
        hora: report.dataTime?.timeCreateReport || new Date().toISOString(),
        descripcion: report.description,
        estado: mapServerStatus(report.status),
        barrio: report.barrio,
        dataTime: report.dataTime
    }));
}

// Mapear estados del servidor a nuestros estados
function mapServerStatus(serverStatus) {
    const statusMap = {
        'recibido': 'pendiente',
        'proceso': 'en_proceso', 
        'resuelto': 'completado'
    };
    return statusMap[serverStatus] || 'pendiente';
}

// Mapear nuestros estados a estados del servidor
function mapToServerStatus(ourStatus) {
    const statusMap = {
        'pendiente': 'recibido',
        'en_proceso': 'proceso',
        'completado': 'resuelto'
    };
    return statusMap[ourStatus] || 'recibido';
}

function generateExampleData() {
    return [
        {
            id: '1',
            cedula: '12345678',
            direccion: 'Calle 123 #45-67, Barrio Centro',
            hora: '2025-01-14T08:30:00',
            descripcion: 'Fuga de agua en la tubería principal',
            estado: 'pendiente'
        },
        {
            id: '2',
            cedula: '87654321',
            direccion: 'Carrera 15 #32-10, Barrio Norte',
            hora: '2025-01-14T10:15:00',
            descripcion: 'Poste de luz averiado',
            estado: 'en_proceso'
        },
        {
            id: '3',
            cedula: '11223344',
            direccion: 'Avenida 20 #15-30, Barrio Sur',
            hora: '2025-01-13T16:45:00',
            descripcion: 'Hueco en la vía principal',
            estado: 'completado'
        },
        {
            id: '4',
            cedula: '55667788',
            direccion: 'Calle 8 #12-25, Barrio Este',
            hora: '2025-01-13T14:20:00',
            descripcion: 'Alcantarilla obstruida',
            estado: 'pendiente'
        },
        {
            id: '5',
            cedula: '99887766',
            direccion: 'Carrera 25 #8-15, Barrio Oeste',
            hora: '2025-01-12T11:30:00',
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
                <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 20px; color: #d32f2f;"></i>
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
        // Verificar permisos de admin de forma segura
        const isAdmin = currentUser && currentUser.role === 'admin';
        
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
                    ${isAdmin ? getStatusButtons(report.id, report.estado) : ''}
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

// Generar botones de estado con colores rojo, amarillo, verde
function getStatusButtons(reportId, currentStatus) {
    let buttons = '';
    
    // Botón Recibido (Rojo) - solo si no está en este estado
    if (currentStatus !== 'pendiente') {
        buttons += `
            <button class="btn btn-sm status-btn status-received ms-1" onclick="updateReportStatus('${reportId}', 'pendiente')" title="Marcar como Recibido">
                <i class="fas fa-inbox"></i> Recibido
            </button>
        `;
    }
    
    // Botón En Proceso (Amarillo) - solo si no está en este estado
    if (currentStatus !== 'en_proceso') {
        buttons += `
            <button class="btn btn-sm status-btn status-process ms-1" onclick="updateReportStatus('${reportId}', 'en_proceso')" title="Marcar como En Proceso">
                <i class="fas fa-cog"></i> En Proceso
            </button>
        `;
    }
    
    // Botón Resuelto (Verde) - solo si no está en este estado
    if (currentStatus !== 'completado') {
        buttons += `
            <button class="btn btn-sm status-btn status-resolved ms-1" onclick="updateReportStatus('${reportId}', 'completado')" title="Marcar como Resuelto">
                <i class="fas fa-check"></i> Resuelto
            </button>
        `;
    }
    
    return buttons;
}

function truncateText(text, maxLength) {
    if (!text) return 'N/A';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function formatDateTime(dateTime) {
    if (!dateTime) return 'N/A';
    try {
        // Manejar formato del json-server
        if (typeof dateTime === 'string' && dateTime.includes('/')) {
            return dateTime; // Ya está formateado
        }
        
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
        'pendiente': 'Recibido',
        'en_proceso': 'En Proceso',
        'completado': 'Resuelto',
        'cancelado': 'Cancelado'
    };
    return statusMap[status?.toLowerCase()] || 'Recibido';
}

function getStatusBadgeClass(status) {
    switch(status?.toLowerCase()) {
        case 'completado': return 'status-badge-resolved';
        case 'en_proceso': return 'status-badge-process';
        case 'pendiente': return 'status-badge-received';
        case 'cancelado': return 'bg-danger';
        default: return 'status-badge-received';
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
            showErrorMessage("Reporte no encontrado");
        }
    } catch (error) {
        console.error("Error obteniendo reporte:", error);
        showErrorMessage("Error cargando el reporte");
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
        // Verificar permisos de admin de forma segura
        const isAdmin = currentUser && currentUser.role === 'admin';
        if (!isAdmin) {
            showErrorMessage("No tienes permisos para realizar esta acción");
            return;
        }
        
        // Actualizar en el array local
        const reportIndex = allReports.findIndex(r => r.id === reportId);
        if (reportIndex !== -1) {
            allReports[reportIndex].estado = newStatus;
            allReports[reportIndex].updatedAt = new Date().toISOString();
        }
        
        // Intentar actualizar en json-server
        try {
            const serverStatus = mapToServerStatus(newStatus);
            await authData.securePut(`/reports/${reportId}`, { 
                status: serverStatus,
                updatedAt: new Date().toISOString()
            }, false);
            console.log("Estado actualizado en json-server");
        } catch (serverError) {
            console.log("Error actualizando en servidor, solo local:", serverError);
        }
        
        // Recargar la vista
        const currentFilter = document.getElementById('status-filter')?.value || '';
        filterReports(currentFilter);
        
        const statusText = getStatusDisplayText(newStatus);
        showSuccessMessage(`Reporte marcado como "${statusText}" correctamente`);
        
    } catch (error) {
        console.error("Error actualizando reporte:", error);
        showErrorMessage("Error actualizando el reporte");
    }
};

// Función principal de cerrar sesión (MEJORADA para evitar bucles)
window.logout = function() {
    // Mostrar confirmación antes de cerrar sesión
    const confirmLogout = confirm('¿Está seguro que desea cerrar sesión?');
    
    if (confirmLogout) {
        try {
            // Limpiar datos locales MANUALMENTE (no usar auth.logout que puede causar bucles)
            localStorage.removeItem("user");
            localStorage.removeItem("authToken");
            sessionStorage.clear();
            
            console.log("Sesión cerrada correctamente");
            
            // Redirección manual y controlada
            window.location.href = '../views/login.html';
            
        } catch (error) {
            console.error("Error cerrando sesión:", error);
            // Forzar redirección en caso de error
            window.location.href = '../views/login.html';
        }
    }
};

// Agregar estilos CSS para animaciones y botones de estado
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
    
    /* Botones de estado con colores específicos */
    .status-btn {
        font-size: 11px;
        padding: 4px 8px;
        border: none;
        border-radius: 4px;
        color: white;
        font-weight: 500;
        transition: all 0.2s ease;
        cursor: pointer;
    }
    
    .status-received {
        background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); /* Rojo */
    }
    
    .status-received:hover {
        background: linear-gradient(135deg, #c82333 0%, #a71e2a 100%);
        transform: translateY(-1px);
    }
    
    .status-process {
        background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%); /* Amarillo */
        color: #000;
    }
    
    .status-process:hover {
        background: linear-gradient(135deg, #e0a800 0%, #d39e00 100%);
        transform: translateY(-1px);
    }
    
    .status-resolved {
        background: linear-gradient(135deg, #28a745 0%, #218838 100%); /* Verde */
    }
    
    .status-resolved:hover {
        background: linear-gradient(135deg, #218838 0%, #1e7e34 100%);
        transform: translateY(-1px);
    }
    
    /* Badges de estado */
    .status-badge-received {
        background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
        color: white;
        padding: 6px 12px;
        border-radius: 20px;
        font-weight: 600;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    .status-badge-process {
        background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);
        color: #000;
        padding: 6px 12px;
        border-radius: 20px;
        font-weight: 600;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    .status-badge-resolved {
        background: linear-gradient(135deg, #28a745 0%, #218838 100%);
        color: white;
        padding: 6px 12px;
        border-radius: 20px;
        font-weight: 600;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
`;
document.head.appendChild(style);