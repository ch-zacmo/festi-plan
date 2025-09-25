  async function logoutUser() {
    try {
      // Appeler la route /logout
      const response = await fetch('/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Supprimer le token du localStorage
        localStorage.removeItem('token');
        
        // Rediriger l'utilisateur vers la page de connexion
        window.location.href = '/login.html';
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }

  // Appeler la fonction logoutUser lorsqu'on est sur la page de déconnexion
  window.onload = logoutUser;