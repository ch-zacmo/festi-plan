  async function checkUserStatus() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        alert("Connecté vous !")
      // Si aucun token n'est trouvé, rediriger vers la page de connexion
      window.location.href = '/login.html';
      return;
    }

    try {
      // Faire une requête à /profile avec le token JWT dans l'en-tête Authorization
      const response = await fetch('/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`  // Ajout du token dans l'en-tête
        }
      });

      if (response.ok) {
        const data = await response.json();
        document.getElementById('connected-user').textContent = data.username;
      } else {
        // Rediriger vers la page de connexion si non authentifié
          alert("Nom d'utilisateur ou mot de passe incorrect")
        window.location.href = '/login.html';
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      window.location.href = '/login.html';  // Rediriger en cas d'erreur
    }
  }

  // Appeler la fonction lors du chargement de la page
  window.onload = checkUserStatus;