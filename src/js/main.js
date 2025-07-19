// Esta función la hacemos global para que el HTML pueda usarla con onclick=""
window.goToLogin = function () {
    // Redirige a la vista de login
    window.location.href = "/src/views/login.html";
}
// Esta función la hacemos global para que el HTML pueda usarla con onclick=""
window.goToHome = function () {
    // Redirige a la vista de home
    window.location.href = "../../index.html";
}
// Esta función la hacemos global para que el HTML pueda usarla con onclick=""
window.goToForm = function () {
    // Redirige a la vista del formulario
    window.location.href = "/src/views/form.html";
}