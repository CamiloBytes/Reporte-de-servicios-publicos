const apiUsers = "http://localhost:3000/users"
const apiReports = "http://localhost:3000/reports"
const estado = document.getElementById("status")


async function Users() {
    let response = await fetch(apiUsers)
    let data = await response.json()
    return data
}
async function Reports() {
    let response = await fetch(apiReports)
    let data = await response.json()
    return data
}
const api1 = await Users()
const api2 = await Reports()
async function table() {
    let tablets = document.getElementById("createTable")
    for (let datos of api2) {
        let tab = `
        <thead>
            <tr>
                <th>CEDULA</th>
                <th>DIRECCIÓN</th>
                <th>HORA</th>
                <th>DESCRIPCIÓN</th>
                <th>ESTADO</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>${datos.ccUser}</td>
                <td>${datos.address}</td>
                <td>${datos.dataTime.timeCreateReport}</td>
                <td>${datos.description}</td>
                ${datos.statu==="resuelto" ? `<td><button class="badge resuelto" disabled id="stt" data-id=${datos.id}>${datos.statu}</button></td>`: datos.statu==="proceso" ? `
                    <td><button class="badge proceso" id="stt" data-id=${datos.id}>${datos.statu}</button></td>` : 
                    `<td><button class="badge pendiente"  id="stt" data-id=${datos.id}>${datos.statu}</button></td>`}
                
            </tr>
        </tbody>
    `;
        tablets.innerHTML += tab
    }

    btn()
}
table()
async function btn() {
    // Selecciona todos los botones con clase "badge"
    let botones = document.querySelectorAll(".badge");

    botones.forEach((btn1) => {
        btn1.addEventListener("click", async () => {
            let dataId = btn1.getAttribute('data-id');
            let reporte = api2.find(rep => rep.id == dataId);

            if (!reporte) return; // no encontró el reporte correspondiente

            if (btn1.classList.contains("pendiente")) {
                btn1.classList.remove("pendiente");
                btn1.classList.add("proceso");
                btn1.innerHTML = "Proceso";

                let stat = {
                    ...reporte,           // conservar otros datos
                    statu: "proceso"     // actualizar solo el estado
                };

                await fetch(`${apiReports}/${reporte.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(stat)
                });

            } else if (btn1.classList.contains("proceso")) {
                btn1.classList.remove("proceso");
                btn1.classList.add("resuelto");
                btn1.innerHTML = "Resuelto";

                let stat = {
                    ...reporte,
                    statu: "resuelto"
                };

                await fetch(`${apiReports}/${reporte.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(stat)
                });
            }
        });
    });
}