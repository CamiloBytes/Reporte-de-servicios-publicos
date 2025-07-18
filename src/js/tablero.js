const api = 'http://localhost:3000/solicitudes'
let solicitudes = document.getElementById("sol")
let recibidas = document.getElementById("rec")
let proceso = document.getElementById("pro")
let resueltas = document.getElementById("res")
async function get(){
    let response = await fetch(api)
    let data = await response.json()
    return data
}
let datos = await get()
function sol(){
    let contador = Object.keys(datos).length
    solicitudes.innerHTML = contador
}
function rec(){
    let contadorRec = 0
    let contadorPro = 0
    let contadorRes = 0
        for (const element of datos) {
            if(element.estado.recibido===true){
                contadorRec+=1
            }
            if(element.estado.proceso===true){
                contadorPro+=1
            }
            if(element.estado.finalizado===true){
                contadorRes+=1
            }
        }
    recibidas.innerHTML = contadorRec
    proceso.innerHTML = contadorPro
    resueltas.innerHTML = contadorRes
}
sol()
rec()

function estadistica() {
    let cedula = document.getElementById("cedula")
    let fecha1 = document.getElementById("fecha1")
    let fecha2 = document.getElementById("fecha2")
    let fecha3 = document.getElementById("fecha3")
    for (const element of datos) {
        cedula.innerHTML = element.cedula
        fecha1.innerHTML = element.fecha.recibido
        fecha2.innerHTML = element.fecha.proceso
        fecha3.innerHTML = element.fecha.finalizado
    }
}
estadistica()

//hola