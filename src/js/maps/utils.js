// 📍 Formatea una dirección completa con barrio y ciudad
export function formatearDireccion(barrio, direccion) {
    const dir = direccion?.trim();
    const bar = barrio?.trim();

    if (!dir || !bar) return "Dirección no válida";

    return `${dir}, ${bar}, Barranquilla, Colombia`;
}

// ✅ Capitaliza cada palabra (con control de espacios extra)
export function validarTextoCapitalizado(texto) {
    if (!texto || typeof texto !== "string") return "";

    return texto
        .trim()
        .split(/\s+/) // elimina espacios múltiples
        .map(palabra =>
            palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase()
        )
        .join(" ");
}
