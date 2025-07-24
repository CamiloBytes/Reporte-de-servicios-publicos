import Swal from "sweetalert2"

// Esta función la hacemos global para que el HTML pueda usarla con onclick=""
window.goToLogin = function () {
    // Redirige a la vista de login
    const currentPath = window.location.pathname;
    if (currentPath.includes('/views/')) {
        window.location.href = "login.html";
    } else {
        window.location.href = "./src/views/login.html";
    }
}

// Esta función la hacemos global para que el HTML pueda usarla con onclick=""
window.goToHome = function () {
    // Redirige a la vista de home
    const currentPath = window.location.pathname;
    if (currentPath.includes('/views/')) {
        window.location.href = "../../index.html";
    } else {
        window.location.href = "./index.html";
    }
}

const $btnCreate = document.getElementById("btn-create")

const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
    }
});

// Cargar barrios al iniciar
getBarrios()

$btnCreate.addEventListener("click", function (e) {
    e.preventDefault()
    exportarPDF()
})

async function exportarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Obtener todos los campos del formulario
    const $fullName = document.getElementById("fullName").value.trim();
    const $idNumber = document.getElementById("idNumber").value.trim();
    const $address = document.getElementById("address").value.trim();
    const $description = document.getElementById("description").value.trim();
    const $barrio = document.getElementById("barrio").value.trim();
    const $damageType = document.getElementById("damageType").value.trim();
    const $priority = document.getElementById("priority").value.trim();
    const $contactPhone = document.getElementById("contactPhone").value.trim();

    // Validar campos requeridos
    if ($fullName === "" || $idNumber === "" || $address === "" || $description === "" || $barrio === "" || $damageType === "" || $priority === "") {
        Toast.fire({
            icon: "error",
            title: "Todos los campos marcados con (*) son requeridos."
        });
        return;
    }

    // Crear tabla para el PDF con todos los datos
    const headers = [["CAMPO", "INFORMACIÓN"]];
    const data = [
        ["Nombre completo", $fullName],
        ["Número de identificación", $idNumber],
        ["Barrio", $barrio],
        ["Dirección", $address],
        ["Tipo de daño", getDisplayText($damageType, 'damageType')],
        ["Nivel de prioridad", getDisplayText($priority, 'priority')],
        ["Descripción", $description]
    ];

    // Agregar teléfono solo si se proporcionó
    if ($contactPhone) {
        data.push(["Teléfono de contacto", $contactPhone]);
    }

    doc.text("REPORTE DE DAÑO - COMPROBANTE", 50, 15);
    doc.text(`Estimado/a ${$fullName.toUpperCase()}`, 15, 28);
    doc.text(`Gracias por reportar el daño. Este es su comprobante.`, 15, 34);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 15, 40);

    doc.autoTable({
        head: headers,
        body: data,
        startY: 50,
        theme: 'grid',
        headStyles: { fillColor: [211, 47, 47] },
        styles: { fontSize: 10 },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 60 },
            1: { cellWidth: 120 }
        }
    });

    // Verificar si ya existe un reporte pendiente
    const response = await fetch("http://localhost:3000/reports");
    const datos = await response.json();

    const reportExists = datos.some(report =>
        report.ccUser === $idNumber &&
        report.status !== "resuelto"
    );

    if (reportExists) {
        Toast.fire({
            icon: "info",
            title: "Ya tienes un reporte pendiente. Espera a que sea resuelto."
        });
        return;
    }

    // Crear usuario y reporte
    await newUser();
    await postReport();
    
    // Descargar PDF y limpiar formulario
    doc.save(`REPORTE_${$fullName.toUpperCase()}_${new Date().toISOString().split('T')[0]}.pdf`);
    clearInputs();
    
    Toast.fire({
        icon: "success",
        title: "¡Reporte enviado exitosamente!"
    });
}

async function newUser() {
    const $fullName = document.getElementById("fullName").value.trim();
    const $idNumber = document.getElementById("idNumber").value.trim();
    const $contactPhone = document.getElementById("contactPhone").value.trim();

    const newUser = {
        name: $fullName,
        CC: $idNumber,
        phone: $contactPhone || null,
        registeredAt: new Date().toISOString()
    };

    try {
        let response = await fetch("http://localhost:3000/clientes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newUser)
        })
        
        if (!response.ok) {
            console.warn("Error al registrar usuario, pero continuando con el reporte");
        }
    } catch (error) {
        console.error("Error al registrar usuario:", error);
    }
}

async function postReport() {
    // Obtener todos los campos del formulario
    const $fullName = document.getElementById("fullName").value.trim();
    const $idNumber = document.getElementById("idNumber").value.trim();
    const $address = document.getElementById("address").value.trim();
    const $description = document.getElementById("description").value.trim();
    const $barrio = document.getElementById("barrio").value.trim();
    const $damageType = document.getElementById("damageType").value.trim();
    const $priority = document.getElementById("priority").value.trim();
    const $contactPhone = document.getElementById("contactPhone").value.trim();

    const fecha = new Date();
    const hora = fecha.toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    const commonId = crypto.randomUUID();
    const direccionCompleta = `${$address}, ${$barrio}, Barranquilla, Colombia`;
    
    let lat = null;
    let lon = null;

    // Obtener coordenadas geográficas
    try {
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direccionCompleta)}`, {
            headers: {
                'User-Agent': 'sistema-reportes/1.0'
            }
        });

        const geoData = await geoRes.json();
        if (geoData.length > 0) {
            lat = parseFloat(geoData[0].lat);
            lon = parseFloat(geoData[0].lon);
            console.log("Coordenadas obtenidas:", { lat, lon });
        } else {
            // Coordenadas por defecto en Barranquilla si no se encuentra la dirección
            lat = 10.9685;
            lon = -74.7813;
            console.warn("No se encontraron coordenadas exactas, usando coordenadas de Barranquilla");
        }
    } catch (geoError) {
        console.error("Error al obtener coordenadas:", geoError);
        // Coordenadas por defecto en Barranquilla
        lat = 10.9685;
        lon = -74.7813;
    }

    // Crear reporte completo
    const newReport = {
        id: commonId,
        ccUser: $idNumber,
        userName: $fullName,
        address: $address,
        fullAddress: direccionCompleta,
        description: $description,
        barrio: $barrio,
        damageType: $damageType,
        priority: $priority,
        contactPhone: $contactPhone || null,
        dataTime: {
            timeCreateReport: hora,
            timeProcessReport: null,
            timeFinishReport: null
        },
        status: "recibido"
    };

    // Crear daño para el mapa
    const newDamage = {
        id: commonId,
        ccUser: $idNumber,
        address: direccionCompleta,
        lat: lat,
        lon: lon,
        status: "recibido",
        damageType: $damageType,
        priority: $priority,
        description: $description
    };

    try {
        // Guardar reporte
        let reportResponse = await fetch("http://localhost:3000/reports", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newReport)
        });

        // Guardar daño para el mapa
        let damageResponse = await fetch("http://localhost:3000/damage", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newDamage)
        });

        if (!reportResponse.ok || !damageResponse.ok) {
            throw new Error("Error al guardar el reporte en el servidor");
        }

        console.log("Reporte guardado exitosamente:", commonId);
        
    } catch (error) {
        console.error("Error al guardar el reporte:", error);
        Toast.fire({
            icon: "error",
            title: "Error al guardar el reporte. Inténtalo nuevamente."
        });
        throw error;
    }
}

function getBarrios() {
    fetch("http://localhost:3000/barrios")
        .then(response => {
            if (!response.ok) throw new Error("No se pudo cargar la lista de barrios");
            return response.json();
        })
        .then((barrios) => {
            const select = document.getElementById("barrio");
            select.innerHTML = "";

            const defaultOption = document.createElement("option");
            defaultOption.value = "";
            defaultOption.textContent = "Selecciona tu barrio";
            defaultOption.disabled = true;
            defaultOption.selected = true;
            select.appendChild(defaultOption);

            if (!Array.isArray(barrios)) throw new Error("Formato de datos inválido");

            // Ordenar barrios por nombre
            barrios.sort((a, b) => a.name.localeCompare(b.name));

            barrios.forEach((barrio) => {
                const option = document.createElement("option");
                option.value = barrio.name; // Usar el nombre como valor
                option.textContent = barrio.name; // Mostrar el nombre
                select.appendChild(option);
            });
        })
        .catch(error => {
            console.error("Error al cargar barrios:", error);
            Toast.fire({
                icon: "error",
                title: "Error al cargar la lista de barrios"
            });
        });
}

function clearInputs() {
    document.getElementById("fullName").value = "";
    document.getElementById("idNumber").value = "";
    document.getElementById("address").value = "";
    document.getElementById("description").value = "";
    document.getElementById("barrio").value = "";
    document.getElementById("damageType").value = "";
    document.getElementById("priority").value = "";
    document.getElementById("contactPhone").value = "";
}

// Función para obtener el texto mostrable de los selects
function getDisplayText(value, type) {
    const options = {
        damageType: {
            "agua": "💧 Problemas de Agua (Fugas, tuberías)",
            "luz": "💡 Problemas Eléctricos (Postes, semáforos)",
            "vias": "🛣️ Daños en Vías (Huecos, grietas)",
            "alcantarilla": "🕳️ Alcantarillas (Obstrucciones, roturas)",
            "parques": "🌳 Espacios Públicos (Parques, mobiliario)",
            "otros": "⚠️ Otros daños"
        },
        priority: {
            "baja": "🟢 Baja - No es urgente",
            "media": "🟡 Media - Requiere atención",
            "alta": "🟠 Alta - Urgente",
            "critica": "🔴 Crítica - Emergencia"
        }
    };
    
    return options[type][value] || value;
}