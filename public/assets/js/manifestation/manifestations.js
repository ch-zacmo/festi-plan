  async function loadTableData() {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        window.location.href = '/login.html';  // Redirection si l'utilisateur n'est pas connecté
          
        return;
      }
      // Requête pour obtenir la liste des manifestations
      const response = await fetch('/api/manifestations', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const manifestations = await response.json();

      // Vérifier si la requête a réussi
      if (response.ok) {
        const tableBody = document.querySelector('#data-table tbody');
        tableBody.innerHTML = ''; // Vider la table avant de la remplir

        // Boucler sur les manifestations et ajouter une ligne pour chacune
        manifestations.forEach(manifestation => {
          const row = document.createElement('tr');

          // Colonne Nom
          const nameCell = document.createElement('td');
          nameCell.textContent = manifestation.name;
          row.appendChild(nameCell);

          // Colonne Date de début
          const startDateCell = document.createElement('td');
          startDateCell.textContent = new Date(manifestation.start_date).toLocaleDateString('fr-CH', { timeZone: 'Europe/Zurich' });
          row.appendChild(startDateCell);

          // Colonne Date de fin
          const endDateCell = document.createElement('td');
          endDateCell.textContent = new Date(manifestation.end_date).toLocaleDateString('fr-CH', { timeZone: 'Europe/Zurich' });
          row.appendChild(endDateCell);

          // Colonne Propriétaire
          const ownerCell = document.createElement('td');
          ownerCell.textContent = manifestation.owner?.username || 'Inconnu';
          row.appendChild(ownerCell);

          // Colonne Bouton de détail
          const buttonCell = document.createElement('td');
          const detailButton = document.createElement('button');
          detailButton.textContent = 'Voir les détails';
          detailButton.classList.add('btn', 'btn-primary');
          detailButton.onclick = function () {
            // Redirection vers manifestation.html avec query param id
            window.location.href = `manifestation.html?id=${manifestation._id}`;
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
  window.onload = loadTableData;