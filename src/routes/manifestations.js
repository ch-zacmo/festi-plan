const express = require('express');
const router = express.Router();
const manifestationService = require('../service/manifestation');
const userService = require('../service/user');
const authenticateToken = require('../middleware/authenticateToken');
const checkRole = require('../middleware/checkRole');


// Utilisation du middleware pour toutes les requêtes POST sur ce routeur
router.post('*', authenticateToken);

// Utilisation du middleware pour toutes les requêtes PUT sur ce routeur
router.put('*', authenticateToken);

// Utilisation du middleware pour toutes les requêtes DELETE sur ce routeur
router.delete('*', authenticateToken);





/**
 * CRUD de base pour les manifestations
 */

// Récupérer toutes les manifestations
router.get('/', checkRole(['admin', 'gestionnaire', 'gestionnaire_read_only']), async (req, res) => {
  try {
    const manifestations = await manifestationService.getAllManifestations();
    res.status(200).json(manifestations);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// Récupérer une manifestation par ID
router.get('/:manifestationId', async (req, res) => {
  try {
    const manifestation = await manifestationService.getManifestationById(req.params.manifestationId);
    res.status(200).json(manifestation);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// Créer une nouvelle manifestation
router.post('/', async (req, res) => {
  try {
    const owner = req.user.id; // Récupérer l'ID de l'utilisateur authentifié
    const data = {
      owner,
      start_date: req.body.startDate,
      end_date: req.body.endDate,
      name: req.body.name
    }
    const manifestation = await manifestationService.createManifestation(data);
    res.status(201).json(manifestation);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// Mettre à jour une manifestation
router.put('/:manifestationId', async (req, res) => {
  try {
    const updatedManifestation = await manifestationService.updateManifestation(req.params.manifestationId, req.body);
    res.status(200).json(updatedManifestation);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// Supprimer une manifestation
router.delete('/:manifestationId', async (req, res) => {
  try {
    await manifestationService.deleteManifestation(req.params.manifestationId);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

/**
 * Gestion des stands pour une manifestation
 */

// Récupérer tous les stands d'une manifestation
router.get('/:manifestationId/stands', async (req, res) => {
  try {
    const stands = await manifestationService.getAllStands(req.params.manifestationId);
    res.status(200).json(stands);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// Ajouter un stand à une manifestation
router.post('/:manifestationId/stands', async (req, res) => {
  try {
    const manifestation = await manifestationService.addStand(req.params.manifestationId, req.body);
    res.status(201).json(manifestation);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// Récupérer un stand par ID
router.get('/:manifestationId/stands/:standId', async (req, res) => {
  try {
    const stand = await manifestationService.getStandById(req.params.manifestationId, req.params.standId);
    res.status(200).json(stand);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// Mettre à jour un stand
router.put('/:manifestationId/stands/:standId', async (req, res) => {
  try {
    const updatedStand = await manifestationService.updateStand(req.params.manifestationId, req.params.standId, req.body);
    res.status(200).json(updatedStand);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message
    });
  }
});

// Supprimer un stand
router.delete('/:manifestationId/stands/:standId', async (req, res) => {
  try {
    const manifestation = await manifestationService.deleteStand(req.params.manifestationId, req.params.standId);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

/**
 * Gestion des shifts pour un stand
 */

// Récupérer tous les shifts d'un stand
router.get('/:manifestationId/stands/:standId/shifts', async (req, res) => {
  try {
    const shifts = await manifestationService.getAllShiftsOfStand(req.params.manifestationId, req.params.standId);
    res.status(200).json(shifts);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// Ajouter un shift à un stand
router.post('/:manifestationId/stands/:standId/shifts', async (req, res) => {
  try {
    const manifestation = await manifestationService.addShift(req.params.manifestationId, req.params.standId, req.body);
    res.status(201).json(manifestation);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// Récupérer un shift par ID
router.get('/:manifestationId/stands/:standId/shifts/:shiftId', async (req, res) => {
  try {
    const shift = await manifestationService.getShiftById(req.params.manifestationId, req.params.standId, req.params.shiftId);
    res.status(200).json(shift);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// Mettre à jour un shift
router.put('/:manifestationId/stands/:standId/shifts/:shiftId', async (req, res) => {
  try {
    const updatedShift = await manifestationService.updateShift(req.params.manifestationId, req.params.standId, req.params.shiftId, req.body);
    res.status(200).json(updatedShift);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// Supprimer un shift
router.delete('/:manifestationId/stands/:standId/shifts/:shiftId', async (req, res) => {
  try {
    const manifestation = await manifestationService.deleteShift(req.params.manifestationId, req.params.standId, req.params.shiftId);
    res.status(204).send();
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message
    });
  }
});

/**
 * Récupérer tous les shifts d'une manifestation
 */
router.get('/:manifestationId/shifts', async (req, res) => {
  try {
    const shifts = await manifestationService.getAllShiftsOfManifestation(req.params.manifestationId);
    res.status(200).json(shifts);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message
    });
  }
});

/**
 * Récupérer tous les utilisateur attribués à une manifestation
 */
router.get('/:manifestationId/users', async (req, res) => {
  try {
    const users = await userService.getAllUsersOfManifestation(req.params.manifestationId);
    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message
    });
  }
});

/**
 * Planning d'une manifestation
 */
router.get('/:manifestationId/planning', async (req, res) => {
  try {
    const manifestation = await manifestationService.getManifestationById(req.params.manifestationId);
    const users = await userService.getAllUsersOfManifestation(req.params.manifestationId);

    const planning = {
      manifestation,
      users
    };

    res.status(200).json(planning);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message
    });
  }
});

module.exports = router;