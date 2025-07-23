export function authGuard(path) {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user && path === "/dashboard") {
        return "/login"; // redirect to login if no user found
    }

    return path; // proceed to the requested path
}
