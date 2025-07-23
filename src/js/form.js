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

getBarrios()

$btnCreate.addEventListener("click", function (e) {
    e.preventDefault()
    exportarPDF()
})


async function exportarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const $fullName = document.getElementById("fullName").value.trim();
    const $idNumber = document.getElementById("idNumber").value.trim();
    const $address = document.getElementById("address").value.trim();

    const $description = document.getElementById("description").value.trim();
    const $barrio = document.getElementById("barrio").value.trim()

    if ($fullName === "" || $idNumber === "" || $address === "" || $description === "" || $barrio === "") {
        Toast.fire({
            icon: "error",
            title: "Todos los valores son requeridos."
        });
        return;
    }

    const headers = [["DATOS REQUERIDOS", "DATOS USUARIOS"]];
    const data = [
        ["Nombre completo", $fullName],
        ["Número de identificación", $idNumber],
        ["Dirección", $address],
        ["Descripción", $description],
        ["Barrio", $barrio]
    ];

    doc.text("VOLANTE DEL REPORTE", 65, 15);
    doc.text(`Bienvenido apreciado cliente ${$fullName.toUpperCase()}`, 15, 28);
    doc.text(`este es el volante de su reporte enviado.`, 15, 34);

    doc.autoTable({
        head: headers,
        body: data,
        startY: 40,
        theme: 'grid',
        headStyles: { fillColor: [198, 185, 244] },
        styles: { fontSize: 11 },
    });


    const response = await fetch("http://localhost:3000/reports");
    const datos = await response.json();

    const reportExists = datos.some(report =>
        report.ccUser === $idNumber &&
        report.status != "resuelto"
        // report.status?.finalized === false
    );

    if (reportExists) {
        Toast.fire({
            icon: "info",
            title: "Ya tienes un reporte pendiente espera a que sea resuelto."
        });
        return;
    }
    await newUser();
    doc.save(`REPORTE DE ${$fullName.toUpperCase()}`)
    postReport()
    clearInputs()
}

async function newUser() {
    const $fullName = document.getElementById("fullName").value;
    const $idNumber = document.getElementById("idNumber").value;

    const newUer = {
        name: $fullName,
        CC: $idNumber,
    };

    try {
        let response = await fetch("http://localhost:3000/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newUer)

        })
        if (!response.ok) {
            throw new Error("Error en la petición POST")
        }
    } catch (error) {
        console.error("Error en el sistema:", error)
    }

}

async function postReport() {
    const $address = document.getElementById("address").value.trim();
    const $description = document.getElementById("description").value.trim();
    const $barrio = document.getElementById("barrio").value.trim()
    const $idNumber = document.getElementById("idNumber").value.trim();
    const fecha = new Date();
    const hora = fecha.toLocaleString()
    const commonId = crypto.randomUUID();
    const direccionCompleta = `${$address}, ${$barrio}, Colombia`;
    let lat = null;
    let lon = null;
    try {
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direccionCompleta)}`, {
            headers: {
                'User-Agent': 'tu-app/1.0' // obligatorio para Nominatim
            }
        });

        const geoData = await geoRes.json();
        if (geoData.length > 0) {
            lat = parseFloat(geoData[0].lat);
            lon = parseFloat(geoData[0].lon);
        } else {
            alert("No se pudo encontrar la ubicación. Verifica la dirección.");
            return;
        }
    } catch (geoError) {
        console.error("Error al obtener coordenadas:", geoError);
        return;
    }
    const newReport = {
        id: commonId,
        ccUser: $idNumber,
        address: $address,
        description: $description,
        barrio: $barrio,
        dataTime: {
            timeCreateReport: hora,
        },
        status: "recibido"
    };

    
    const newDamage = {
        id: commonId,
        ccUser: $idNumber,
        address: $address,
        lat: lat,
        lon: lon,
        status: "recibido"
    }
    try {
        let response = await fetch("http://localhost:3000/reports", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newReport)

        })
        let response2 = await fetch("http://localhost:3000/damage", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newDamage)
        })
        if (!response.ok || !response2.ok) {
            throw new Error("Error en la petición POST")
        }
    } catch (error) {
        console.error("Error en el sistema:", error)
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
            defaultOption.textContent = "Seleccione un barrio";
            defaultOption.disabled = true;
            defaultOption.selected = true;
            select.appendChild(defaultOption);

            if (!Array.isArray(barrios)) throw new Error("Formato de datos inválido");

            barrios.sort((a, b) => a.localeCompare(b));

            barrios.forEach((barrio) => {
                const option = document.createElement("option");
                option.value = barrio; // Podés usar .nombre si querés
                option.textContent = barrio;
                select.appendChild(option);
            });
        })
        .catch(error => {
            console.error("Error al cargar barrios:", error);
        });
}

getBarrios()

function clearInputs() {
    document.getElementById("fullName").value = "";
    document.getElementById("idNumber").value = "";
    document.getElementById("address").value = "";
    document.getElementById("description").value = "";
    document.getElementById("barrio").value = "";

}