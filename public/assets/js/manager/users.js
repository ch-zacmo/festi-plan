// URL de base pour l'API
const apiBaseUrl = '/api';
const token = localStorage.getItem('token');

// Fonction pour récupérer et afficher la liste des utilisateurs
async function fetchUsers() {
    try {
        const response = await fetch(`${apiBaseUrl}/users`,{
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const users = await response.json();

        const tbody = document.querySelector('#users-table tbody');
        tbody.innerHTML = ''; // Vider le tableau avant de le remplir

        users.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${user.username}</td>
                <td>${user.role}</td>
                <td><button onclick="viewUserDetails('${user._id}')">Voir Détails</button></td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
    }
}

// Fonction pour ajouter un nouvel utilisateur
document.getElementById('add-user-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const role = document.getElementById('role').value;

    try {
        const response = await fetch(`${apiBaseUrl}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ username, role })
        });

        if (!response.ok) {
            throw new Error(`Erreur: ${response.statusText}`);
        }

        // Réinitialiser le formulaire après l'ajout
        document.getElementById('add-user-form').reset();
        await fetchUsers(); // Recharger la liste des utilisateurs
    } catch (error) {
        console.error('Erreur lors de l\'ajout de l\'utilisateur:', error);
    }
});

// Fonction pour rediriger vers la page de détails de l'utilisateur
function viewUserDetails(userId) {
    window.location.href = `user-details.html?userId=${userId}`;
}

// Charger la liste des utilisateurs lors du chargement de la page
document.addEventListener('DOMContentLoaded', fetchUsers);