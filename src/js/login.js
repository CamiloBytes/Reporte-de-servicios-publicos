document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      alert('Por favor completa todos los campos');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/user'); // Cambia si usas un archivo local
      const usuarios = await response.json();

      const usuarioEncontrado = usuarios.find(
        (user) => user.email === email && user.password === password
      );

      if (usuarioEncontrado) {
        alert('Inicio de sesión exitoso');
        localStorage.setItem('user', JSON.stringify(usuarioEncontrado));
        // Redirigir a otra página o mostrar contenido
      } else {
        alert('Correo o contraseña incorrectos');
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      alert('Hubo un problema al intentar iniciar sesión');
    }
  });
});