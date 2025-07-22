export function formatearDireccion(barrio, direccion) {
    return `${direccion}, ${barrio}, Barranquilla, Colombia`;
}

export function validarTextoCapitalizado(texto) {
    return texto
        .split(" ")
        .map(palabra =>
            palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase()
        )
        .join(" ");
}