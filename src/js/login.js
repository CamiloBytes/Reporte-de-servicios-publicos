const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginButton = document.getElementById('login-button');


if (loginButton) {
  loginButton.addEventListener('click', (event) => {
    event.preventDefault();
    
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (email === '' || password === '') {
      alert('Please fill in both fields.');
      return;
    }

    // Simulate a login process
    console.log('Logging in with:', { email, password });
    
    // Here you would typically send the credentials to the server
    // For demonstration, we will just log them
  });
}