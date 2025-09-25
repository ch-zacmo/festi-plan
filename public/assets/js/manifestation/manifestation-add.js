document.getElementById('new-manifestation-form').addEventListener('submit', async function (event) {
    event.preventDefault();

    const name = document.getElementById('manifestation-name').value;
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;

    await createManifestation(name, startDate, endDate);
});


async function createManifestation(name, startDate, endDate) {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/manifestations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            name,
            startDate,
            endDate
        })
    });

    const data = await response.json();
    if (response.ok) {
        console.log('Login successful');
        window.location.href = '/manifestations.html'; // Redirige l'utilisateur vers la page des manifestations
        
    } else {
        console.error('Erreur lors de la création:', data.message);
    }
}