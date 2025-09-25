document.getElementById('login-form').addEventListener('submit', async function (event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').value;

    await login(username, password, remember);
});


async function login(username, password, remember) {
    const response = await fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username,
            password,
            remember
        })
    });

    const data = await response.json();
    if (response.ok) {
        localStorage.setItem('token', data.token); // Stocke le JWT dans le localStorage
        window.location.href = '/index.html'; // Redirige l'utilisateur vers la page des manifestations
        console.log('Login successful');
    } else {
        console.error('Login failed:', data.message);
    }
}