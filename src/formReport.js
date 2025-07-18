import Swal from "sweetalert2"
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

$btnCreate.addEventListener("click", function (e) {
  e.preventDefault()
  exportarPDF()
})

async function getApi() {
  let resp = await fetch("http://localhost:3000/users")
  let dat = await resp.json()
  return dat
}

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

  const reportExiste = datos.some(element =>
    element.ccUser === $idNumber &&
    element.status?.received === true &&
    element.status?.finalized === false
  );

  if (reportExiste) {
    Toast.fire({
      icon: "info",
      title: "Ya tienes un reporte pendiente."
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

  const newReport = {
    ccUser: $idNumber,
    address: $address,
    description: $description,
    barrio: $barrio,
    dataTime: {
      timeCreateReport: hora,
    },
    status: {
      received: true,
      process: false,
      finalized: false
    }
  };

  try {
    let response = await fetch("http://localhost:3000/reports", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newReport)

    })
    if (!response.ok) {
      throw new Error("Error en la petición POST")
    }
  } catch (error) {
    console.error("Error en el sistema:", error)
  }
}


function crateTable() {

}
function clearInputs() {
  document.getElementById("fullName").value = "";
  document.getElementById("idNumber").value = "";
  document.getElementById("address").value = "";

  document.getElementById("description").value = "";
  document.getElementById("barrio").value = "";

}