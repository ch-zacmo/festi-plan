const urlParams = new URLSearchParams(window.location.search);
const manifestationId = urlParams.get('id');  

async function loadManifestationData() {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        window.location.href = '/login.html';  // Redirection si l'utilisateur n'est pas connecté
          
        return;
      }

      // Requête pour obtenir la liste des manifestations
      const response = await fetch(`/api/manifestations/${manifestationId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const manifestation = await response.json();

      // Vérifier si la requête a réussi
      if (response.ok) {
        // mettre le nom de la manifestation dans le titre
        document.title = `${manifestation.name}`;
        // et dans le heading #manifestation-name
        document.querySelector('#manifestation-name').textContent = manifestation.name;

        // mettre le lien du planning dans le bouton #planning-link
        document.querySelector('#public-planning-link').href = `planning.html?id=${manifestationId}`;

        const tableBody = document.querySelector('#data-table tbody');
        tableBody.innerHTML = ''; // Vider la table avant de la remplir

        const stands = manifestation.stands;

        // Boucler sur les manifestations et ajouter une ligne pour chacune
        stands.forEach(stand => {
          const row = document.createElement('tr');

          // Colonne Nom
          const nameCell = document.createElement('td');
          nameCell.textContent = stand.name;
          row.appendChild(nameCell);

          // Colonne Date de début
          const startDateCell = document.createElement('td');
          startDateCell.textContent = new Date(stand.start).toLocaleString();
          row.appendChild(startDateCell);

          // Colonne Date de fin
          const endDateCell = document.createElement('td');
          endDateCell.textContent = new Date(stand.end).toLocaleString();
          row.appendChild(endDateCell);

          // Colonne Responsable
          const ownerCell = document.createElement('td');
          ownerCell.textContent = stand.manager[0]?.username || 'Inconnu';
          row.appendChild(ownerCell);

          // Colonne Bouton de détail
          const buttonCell = document.createElement('td');
          const detailButton = document.createElement('button');
          detailButton.textContent = 'Voir les détails';
          detailButton.onclick = function () {
            // Redirection vers stand.html avec query param id
            window.location.href = `stand.html?standId=${stand._id}&manifestationId=${manifestationId}`;
          };
          buttonCell.appendChild(detailButton);
          row.appendChild(buttonCell);

          // Ajouter la ligne au corps de la table
          tableBody.appendChild(row);
        });
      } else {
        console.error('Failed to load manifestations:', manifestations.message);
      }
    } catch (error) {
      console.error('Error loading table data:', error);
    }
  }

// Charger les données lors du chargement de la page
window.onload = loadManifestationData;

document.getElementById('new-stand-form').addEventListener('submit', async function (event) {
    event.preventDefault();

    const name = document.getElementById('stand-name').value;


    await createStand(name);
});


async function createStand(name) {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/manifestations/${manifestationId}/stands`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            name,
            shifts : []
        })
    });

    const data = await response.json();
    if (response.ok) {
        console.log('Ajout ok');
        window.location.reload();
        
    } else {
        console.error('Erreur lors de la création:', data.message);
    }
}