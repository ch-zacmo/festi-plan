const Manifestation = require('../models/manifestation'); // Chemin vers ton modèle Manifestation
const mongoose = require('mongoose');

/**
 * CRUD de base pour les manifestations
 */

// Créer une manifestation
const createManifestation = async (manifestationData) => {
  try {
    const newManifestation = new Manifestation(manifestationData);
    await newManifestation.save();
    return newManifestation;
  } catch (error) {
    throw new Error(`Erreur lors de la création de la manifestation: ${error.message}`);
  }
};

// Récupérer une manifestation par ID
const getManifestationById = async (manifestationId) => {
  try {
    const manifestation = await Manifestation.findById(manifestationId).populate('owner').populate('stands.manager').populate('stands.shifts.user');
    if (!manifestation) throw new Error('Manifestation non trouvée');
    return manifestation;
  } catch (error) {
    throw new Error(`Erreur lors de la récupération de la manifestation: ${error.message}`);
  }
};

// Mettre à jour une manifestation
const updateManifestation = async (manifestationId, updatedData) => {
  try {
    const manifestation = await Manifestation.findByIdAndUpdate(manifestationId, updatedData, {
      new: true
    });
    if (!manifestation) throw new Error('Manifestation non trouvée');
    return manifestation;
  } catch (error) {
    throw new Error(`Erreur lors de la mise à jour de la manifestation: ${error.message}`);
  }
};

// Supprimer une manifestation
const deleteManifestation = async (manifestationId) => {
  try {
    const manifestation = await Manifestation.findByIdAndDelete(manifestationId);
    if (!manifestation) throw new Error('Manifestation non trouvée');
    return manifestation;
  } catch (error) {
    throw new Error(`Erreur lors de la suppression de la manifestation: ${error.message}`);
  }
};

// Récupérer toutes les manifestations
const getAllManifestations = async () => {
  try {
    const manifestations = await Manifestation.find().populate('owner').populate('stands.manager').populate('stands.shifts.user');
    return manifestations;
  } catch (error) {
    throw new Error(`Erreur lors de la récupération des manifestations: ${error.message}`);
  }
};

/**
 * CRUD pour les stands
 */

// Ajouter un stand à une manifestation
const addStand = async (manifestationId, standData) => {
  try {
    const manifestation = await Manifestation.findById(manifestationId);
    if (!manifestation) throw new Error('Manifestation non trouvée');

    manifestation.stands.push(standData);
    await manifestation.save();
    return manifestation;
  } catch (error) {
    throw new Error(`Erreur lors de l'ajout du stand: ${error.message}`);
  }
};

// Récupérer un stand d'une manifestation
const getStandById = async (manifestationId, standId) => {
  try {
    const manifestation = await Manifestation.findById(manifestationId).populate('stands.manager').populate('stands.shifts.user');
    if (!manifestation) throw new Error('Manifestation non trouvée');

    const stand = manifestation.stands.id(standId);
    if (!stand) throw new Error('Stand non trouvé');
    return stand;
  } catch (error) {
    throw new Error(`Erreur lors de la récupération du stand: ${error.message}`);
  }
};

// Mettre à jour un stand
const updateStand = async (manifestationId, standId, updatedData) => {
  try {
    const manifestation = await Manifestation.findById(manifestationId);
    if (!manifestation) throw new Error('Manifestation non trouvée');

    const stand = manifestation.stands.id(standId);
    if (!stand) throw new Error('Stand non trouvé');

    stand.set(updatedData);
    await manifestation.save();
    return manifestation;
  } catch (error) {
    throw new Error(`Erreur lors de la mise à jour du stand: ${error.message}`);
  }
};

// Supprimer un stand
const deleteStand = async (manifestationId, standId) => {
  try {
    const manifestation = await Manifestation.findById(manifestationId);
    if (!manifestation) throw new Error('Manifestation non trouvée');

    manifestation.stands.id(standId).remove();
    await manifestation.save();
    return manifestation;
  } catch (error) {
    throw new Error(`Erreur lors de la suppression du stand: ${error.message}`);
  }
};

// Récupérer tous les stands d'une manifestation
const getAllStands = async (manifestationId) => {
  try {
    const manifestation = await Manifestation.findById(manifestationId).populate('stands.manager').populate('stands.shifts.user');
    if (!manifestation) throw new Error('Manifestation non trouvée');

    return manifestation.stands;
  } catch (error) {
    throw new Error(`Erreur lors de la récupération des stands: ${error.message}`);
  }
};

/**
 * CRUD pour les shifts
 */

// Ajouter un shift à un stand
const addShift = async (manifestationId, standId, shiftData) => {
  try {
    const manifestation = await Manifestation.findById(manifestationId);
    if (!manifestation) throw new Error('Manifestation non trouvée');

    const stand = manifestation.stands.id(standId);
    if (!stand) throw new Error('Stand non trouvé');

    stand.shifts.push(shiftData);
    await manifestation.save();
    return manifestation;
  } catch (error) {
    throw new Error(`Erreur lors de l'ajout du shift: ${error.message}`);
  }
};

// Récupérer un shift d'un stand
const getShiftById = async (manifestationId, standId, shiftId) => {
  try {
    const manifestation = await Manifestation.findById(manifestationId).populate('stands.shifts.user');
    if (!manifestation) throw new Error('Manifestation non trouvée');

    const stand = manifestation.stands.id(standId);
    if (!stand) throw new Error('Stand non trouvé');

    const shift = stand.shifts.id(shiftId);
    if (!shift) throw new Error('Shift non trouvé');
    return shift;
  } catch (error) {
    throw new Error(`Erreur lors de la récupération du shift: ${error.message}`);
  }
};

// Mettre à jour un shift
const updateShift = async (manifestationId, standId, shiftId, updatedData) => {
  try {
    const manifestation = await Manifestation.findById(manifestationId);
    if (!manifestation) throw new Error('Manifestation non trouvée');

    const stand = manifestation.stands.id(standId);
    if (!stand) throw new Error('Stand non trouvé');

    const shift = stand.shifts.id(shiftId);
    if (!shift) throw new Error('Shift non trouvé');

    // Vérifier que l'heure de début est bien avant l'heure de fin
    if (updatedData.start > updatedData.end) throw new Error('L\'heure de début doit être avant l\'heure de fin');

    shift.set(updatedData);
    await manifestation.save();
    return manifestation;
  } catch (error) {
    throw new Error(`Erreur lors de la mise à jour du shift: ${error.message}`);
  }
};

// Supprimer un shift
const deleteShift = async (manifestationId, standId, shiftId) => {
  try {
    const manifestation = await Manifestation.findById(manifestationId);
    if (!manifestation) throw new Error('Manifestation non trouvée');

    const stand = manifestation.stands.id(standId);
    if (!stand) throw new Error('Stand non trouvé');

    stand.shifts = stand.shifts.filter(shift => shift._id.toString() !== shiftId);

    await manifestation.save();
    return manifestation;
  } catch (error) {
    throw new Error(`Erreur lors de la suppression du shift: ${error.message}`);
  }
};

// Récupérer tous les shifts d'un stand
const getAllShiftsOfStand = async (manifestationId, standId) => {
  try {
    const manifestation = await Manifestation.findById(manifestationId).populate('stands.shifts.user');
    if (!manifestation) throw new Error('Manifestation non trouvée');

    const stand = manifestation.stands.id(standId);
    if (!stand) throw new Error('Stand non trouvé');


    return stand.shifts;
  } catch (error) {
    throw new Error(`Erreur lors de la récupération des shifts du stand: ${error.message}`);
  }
};

// Récupérer tous les shifts d'une manifestation
const getAllShiftsOfManifestation = async (manifestationId) => {
  try {
    const manifestation = await Manifestation.findById(manifestationId).populate('stands.shifts.user');
    if (!manifestation) throw new Error('Manifestation non trouvée');

    // Utilisation de map pour un style plus fonctionnel
    const allShifts = manifestation.stands.flatMap(stand =>
      stand.shifts.map(shift => ({
        ...shift.toObject(), // on convertit le document Mongoose en objet JS si nécessaire
        standName: stand.name,
        color: stand.color
      }))
    );

    return allShifts;
  } catch (error) {
    throw new Error(`Erreur lors de la récupération des shifts de la manifestation: ${error.message}`);
  }
};

module.exports = {
  createManifestation,
  getManifestationById,
  updateManifestation,
  deleteManifestation,
  getAllManifestations,
  addStand,
  getStandById,
  updateStand,
  deleteStand,
  getAllStands,
  addShift,
  getShiftById,
  updateShift,
  deleteShift,
  getAllShiftsOfStand,
  getAllShiftsOfManifestation
};