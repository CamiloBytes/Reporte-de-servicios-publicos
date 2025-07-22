import { alertError, alertInfo } from "./alert.js"
import { API_URL, ESTADOS } from "./config.js"
import { formatearDireccion, validarTextoCapitalizado } from "./utils.js"

const marcadores = {}

const map = L.map("map", {
    center: [10.9685, -74.7813],
    zoom: 11.5,
    zoomControl: true,
    scrollWheelZoom: true,
})
const limitesBarranquilla = L.latLngBounds(
    L.latLng(10.89, -74.88),
    L.latLng(11.05, -74.72)
)
map.setMaxBounds(limitesBarranquilla)
map.on("drag", () => map.panInsideBounds(limitesBarranquilla, { animate: false }))

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "Datos © OpenStreetMap",
}).addTo(map)

// Cargar daños al iniciar
document.addEventListener("DOMContentLoaded", async () => {
    try {
        const res = await fetch(API_URL)
        const data = await res.json()
        for (const danio of data) agregarMarcador(danio)
    } catch (error) {
        alertError("Error al cargar daños")
        console.error("Error al cargar daños:", error)
    }
})

// Reportar nuevo daño
window.reportarDanio = async function () {
    const $barrio = document.getElementById("barrio")
    const $direccion = document.getElementById("direccion")

    const barrio = validarTextoCapitalizado($barrio.value.trim())
    const direccion = validarTextoCapitalizado($direccion.value.trim())

    if (!barrio || !direccion) {
        alertError("Por favor completa todos los campos.")
        return
    }

    const direccionCompleta = formatearDireccion(barrio, direccion)

    try {
        const resGeo = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direccionCompleta)}`)
        const data = await resGeo.json()

        if (!data.length) {
            alertError("No se encontró esa dirección.")
            return
        }

        const lat = parseFloat(data[0].lat)
        const lon = parseFloat(data[0].lon)

        const resDanios = await fetch(API_URL)
        const danios = await resDanios.json()

        const existe = danios.find(d => Math.abs(d.lat - lat) < 0.0001 && Math.abs(d.lon - lon) < 0.0001)
        if (existe) {
            alertInfo("Ya existe un daño reportado en esta dirección.")
            return
        }

        const nuevoDanio = {
            address: direccionCompleta,
            lat,
            lon,
            status: "pendiente"
        }

        const resGuardar = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nuevoDanio)
        })

        const danioGuardado = await resGuardar.json()
        agregarMarcador(danioGuardado)

    } catch (err) {
        console.error("Error al reportar daño:", err)
    }
}

//  Agregar marcador
function agregarMarcador(danio) {
    const { lat, lon, direccion, estado, id } = danio
    const color = ESTADOS[estado]

    const circulo = L.circle([lat, lon], {
        color,
        fillColor: color,
        fillOpacity: 0.6,
        radius: 60
    }).addTo(map)

    circulo.bindPopup(`
    <b>${direccion}</b><br>
    Estado: <strong>${estado}</strong><br>
    <button onclick="cambiarEstado('${id}', '${lat}', '${lon}', 'reparacion')">En reparación</button>
    <button onclick="cambiarEstado('${id}', '${lat}', '${lon}', 'solucionado')">Solucionado</button>
  `)

    marcadores[id] = circulo
}

//  Cambiar estado del marcador
window.cambiarEstado = async function (id, lat, lon, nuevoEstado) {
    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ estado: nuevoEstado })
        })

        if (!res.ok){
            console.error("error")
        }

        const actualizado = await res.json()
        if (marcadores[id]) map.removeLayer(marcadores[id])
        agregarMarcador(actualizado)
    } catch (err) {
        console.error("Error al cambiar estado:", err)
    }
}