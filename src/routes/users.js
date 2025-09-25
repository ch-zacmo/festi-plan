const express = require('express');
const router = express.Router();
const userService = require('../service/user');
const checkRole = require('../middleware/checkRole');
const authenticateToken = require('../middleware/authenticateToken');

router.get('*', checkRole(['admin', 'gestionnaire', 'gestionnaire_read_only']));

// Utilisation du middleware pour toutes les requêtes POST sur ce routeur
router.post('*', authenticateToken);

// Utilisation du middleware pour toutes les requêtes PUT sur ce routeur
router.put('*', authenticateToken);

// Utilisation du middleware pour toutes les requêtes DELETE sur ce routeur
router.delete('*', authenticateToken);

/**
 * CRUD de base pour les utilisateurs
 */

// Récupérer tous les utilisateurs
router.get('/', async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Récupérer un utilisateur par ID
router.get('/:userId', async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.userId);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Créer un utilisateur
router.post('/', async (req, res) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mettre à jour un utilisateur
router.put('/:userId', async (req, res) => {
  try {
    const updatedUser = await userService.updateUser(req.params.userId, req.body);
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Supprimer un utilisateur
router.delete('/:userId', async (req, res) => {
  try {
    await userService.deleteUser(req.params.userId);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Gestion des manifestations d'un utilisateur
 */

// Ajouter une manifestation à un utilisateur
router.post('/:userId/manifestations', async (req, res) => {
  try {
    const user = await userService.addManifestation(req.params.userId, req.body.manifestationId, req.body.availability);
    res.status(201).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// Supprimer une manifestation d'un utilisateur
router.delete('/:userId/manifestations/:manifestationId', async (req, res) => {
  try {
    const user = await userService.removeManifestation(req.params.userId, req.params.manifestationId);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Modifier une manifestation pour un utilisateur
router.put('/:userId/manifestations/:manifestationId', async (req, res) => {
  try {
    const user = await userService.updateManifestation(req.params.userId, req.params.manifestationId, req.body);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Récupérer les manifestations d'un utilisateur
router.get('/:userId/manifestations', async (req, res) => {
  try {
    const manifestations = await userService.getUserManifestations(req.params.userId);
    res.status(200).json(manifestations);
  } catch (error) {

    res.status(500).json({ message: error.message });
  }
});

/**
 * Gestion des disponibilités pour les manifestations
 */

// Récupérer les disponibilités d'une manifestation
router.get('/:userId/manifestations/:manifestationId/availability', async (req, res) => {
  try {
    console.log(req.params.userId);
    const availabilities = await userService.getManifestationAvailabilities(req.params.userId, req.params.manifestationId);
    console.log(availabilities);
    res.status(200).json(availabilities);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// Ajouter une disponibilité à une manifestation
router.post('/:userId/manifestations/:manifestationId/availability', async (req, res) => {
  try {
    const user = await userService.addAvailability(req.params.userId, req.params.manifestationId, req.body);
    res.status(201).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// Supprimer une disponibilité d'une manifestation
router.delete('/:userId/manifestations/:manifestationId/availability/:availabilityId', async (req, res) => {
  try {
    const user = await userService.removeAvailability(req.params.userId, req.params.manifestationId, req.params.availabilityId);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Modifier une disponibilité d'une manifestation
router.put('/:userId/manifestations/:manifestationId/availability/:availabilityId', async (req, res) => {
  try {
    const user = await userService.updateAvailability(req.params.userId, req.params.manifestationId, req.params.availabilityId, req.body);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
