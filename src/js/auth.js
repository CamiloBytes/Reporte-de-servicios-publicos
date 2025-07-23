export function authGuard(path) {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user && path === "/dashboard") {
        return "/login"; // si no hay usuario, lo redirige al login
    }

    return path; // si todo bien, sigue la ruta
}

