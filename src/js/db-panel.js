const apiUsers = "http://localhost:3000/users"
const apiReports = "http://localhost:3000/reports"
const apiDamage = "http://localhost:3000/damage"
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
async function Damage() {
    let response = await fetch(apiDamage)
    let data = await response.json()
    return data
}
const api1 = await Users()
const api2 = await Reports()
const api3 = await Damage()
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
                ${datos.status==="resuelto" ? `<td><button class="badge resuelto" disabled id="stt" data-id=${datos.id}>${datos.status}</button></td>`: datos.status==="proceso" ? `
                    <td><button class="badge proceso" id="stt" data-id=${datos.id}>${datos.status}</button></td>` : 
                    `<td><button class="badge pendiente"  id="stt" data-id=${datos.id}>${datos.status}</button></td>`}
                
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
            let reporte2 = api3.find(repo => repo.id == dataId)
            if (!reporte) return; // no encontró el reporte correspondiente

            if (btn1.classList.contains("pendiente")) {
                btn1.classList.remove("pendiente");
                btn1.classList.add("proceso");
                btn1.innerHTML = "proceso";
                const fecha = new Date();
                const hora = fecha.toLocaleString()
                let stat = {
                    ...reporte,
                    dataTime: {
                        ...reporte.dataTime,
                        timeProcessReport: hora
                    },           // conservar otros datos
                    status: "proceso"     // actualizar solo el estado
                };
                let stat2 = {
                    ...reporte2,
                    status: "proceso"
                }
                await fetch(`${apiDamage}/${reporte2.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(stat2)
                })
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
                btn1.innerHTML = "resuelto";
                const fecha = new Date();
                const hora = fecha.toLocaleString()
                let stat = {
                    ...reporte,
                    dataTime: {
                        ...reporte.dataTime,
                        timeFinishReport: hora
                    },   
                    status: "resuelto"
                };
                let stat2 = {
                    ...reporte2,
                    status: "proceso"
                }
                await fetch(`${apiDamage}/${reporte2.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(stat2)
                })
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