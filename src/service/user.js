const User = require('../models/user'); // Chemin vers ton modèle User
const mongoose = require('mongoose');

/**
 * CRUD de base
 */

// Créer un utilisateur
const createUser = async (userData) => {
  try {
    const newUser = new User(userData);
    await newUser.save();
    return newUser;
  } catch (error) {
    throw new Error(`Erreur lors de la création de l'utilisateur: ${error.message}`);
  }
};

// Récupérer un utilisateur par ID
const getUserById = async (userId) => {
  try {
    const user = await User.findById(userId).populate('manifestations.manifestation');
    if (!user) throw new Error('Utilisateur non trouvé');

    // enlever le mot de passe
    user.password = undefined;


    return user;
  } catch (error) {
    throw new Error(`Erreur lors de la récupération de l'utilisateur: ${error.message}`);
  }
};

// Mettre à jour un utilisateur
const updateUser = async (userId, updatedData) => {
  try {
    const user = await User.findByIdAndUpdate(userId, updatedData, {
      new: true
    });
    if (!user) throw new Error('Utilisateur non trouvé');
    return user;
  } catch (error) {
    throw new Error(`Erreur lors de la mise à jour de l'utilisateur: ${error.message}`);
  }
};

// Supprimer un utilisateur
const deleteUser = async (userId) => {
  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) throw new Error('Utilisateur non trouvé');
    return user;
  } catch (error) {
    throw new Error(`Erreur lors de la suppression de l'utilisateur: ${error.message}`);
  }
};

/**
 * Fonction de gestion
 */

// Vérifier si un utilisateur existe
const userExists = async (userId) => {
  try {
    const user = await User.findById(userId).lean();
    return !!user;
  } catch (error) {
    throw new Error(`Erreur lors de la vérification de l'utilisateur: ${error.message}`);
  }
};

/**
 * Gestion des manifestations
 */

// Ajouter une manifestation à un utilisateur
const addManifestation = async (userId, manifestationId, availability = []) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error('Utilisateur non trouvé');

    // Vérifier si la manifestation est déjà ajoutée
    const existingManifestation = user.manifestations.find(m => m.manifestation.toString() === manifestationId);

    if (existingManifestation) throw new Error('Manifestation déjà ajoutée');

    user.manifestations.push({
      manifestation: manifestationId,
      availability
    });

    await user.save();
    return user;
  } catch (error) {
    throw new Error(`Erreur lors de l'ajout de la manifestation: ${error.message}`);
  }
};

// Supprimer une manifestation d'un utilisateur
const removeManifestation = async (userId, manifestationId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error('Utilisateur non trouvé');

    user.manifestations = user.manifestations.filter(
      (m) => m.manifestation.toString() !== manifestationId
    );

    await user.save();
    return user;
  } catch (error) {
    throw new Error(`Erreur lors de la suppression de la manifestation: ${error.message}`);
  }
};

// Modifier une manifestation pour un utilisateur
const updateManifestation = async (userId, manifestationId, updatedData) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error('Utilisateur non trouvé');

    const manifestation = user.manifestations.find(
      (m) => m.manifestation.toString() === manifestationId
    );

    if (!manifestation) throw new Error('Manifestation non trouvée pour cet utilisateur');

    if (updatedData.availability) {
      manifestation.availability = updatedData.availability;
    }

    await user.save();
    return user;
  } catch (error) {
    throw new Error(`Erreur lors de la modification de la manifestation: ${error.message}`);
  }
};

/**
 * Gestion des disponibilités
 */

const getManifestationAvailabilities = async (userId, manifestationId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error('Utilisateur non trouvé');
    console.log(user);
    const manifestation = user.manifestations.find(
      (m) => m.manifestation.toString() === manifestationId
    );

    if (!manifestation) throw new Error('Manifestation non trouvée pour cet utilisateur');

    return manifestation.availability;
  } catch (error) {
    throw new Error(`Erreur lors de la récupération des disponibilités: ${error.message}`);
  }
};

// Ajouter une disponibilité à une manifestation d'un utilisateur
const addAvailability = async (userId, manifestationId, availability) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error('Utilisateur non trouvé');

    const manifestation = user.manifestations.find(
      (m) => m.manifestation.toString() === manifestationId
    );

    if (!manifestation) throw new Error('Manifestation non trouvée pour cet utilisateur');
    console.log(availability);
    manifestation.availability.push(availability);

    await user.save();
    return user;
  } catch (error) {
    throw new Error(`Erreur lors de l'ajout de la disponibilité: ${error.message}`);
  }
};

// Supprimer une disponibilité d'une manifestation
const removeAvailability = async (userId, manifestationId, availabilityId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error('Utilisateur non trouvé');

    const manifestation = user.manifestations.find(
      (m) => m.manifestation.toString() === manifestationId
    );

    if (!manifestation) throw new Error('Manifestation non trouvée pour cet utilisateur');

    manifestation.availability = manifestation.availability.filter(
      (a) => a._id.toString() !== availabilityId
    );

    await user.save();
    return user;
  } catch (error) {
    throw new Error(`Erreur lors de la suppression de la disponibilité: ${error.message}`);
  }
};

// Modifier une disponibilité d'une manifestation
const updateAvailability = async (userId, manifestationId, availabilityId, updatedAvailability) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error('Utilisateur non trouvé');

    const manifestation = user.manifestations.find(
      (m) => m.manifestation.toString() === manifestationId
    );

    if (!manifestation) throw new Error('Manifestation non trouvée pour cet utilisateur');

    const availability = manifestation.availability.find(
      (a) => a._id.toString() === availabilityId
    );

    if (!availability) throw new Error('Disponibilité non trouvée');



    availability.start = updatedAvailability.start || availability.start;
    availability.end = updatedAvailability.end || availability.end;

    // Vérifier que la date de fin est postérieure à la date de début
    if (availability.end < availability.start) {
      throw new Error('La date de fin doit être postérieure à la date de début');
    }

    availability.type = updatedAvailability.type || availability.type;

    await user.save();
    return user;
  } catch (error) {
    throw new Error(`Erreur lors de la modification de la disponibilité: ${error.message}`);
  }
};


// Récupérer tous les utilisateurs
const getAllUsers = async () => {
  try {
    const users = await User.find().populate('manifestations.manifestation').sort({ username: 1 });
    return users;
  } catch (error) {
    throw new Error(`Erreur lors de la récupération des utilisateurs: ${error.message}`);
  }
};

// Récupérer la liste des manifestations d'un utilisateur
const getUserManifestations = async (userId) => {
  try {
    const user = await User.findById(userId).populate('manifestations.manifestation');
    if (!user) throw new Error('Utilisateur non trouvé');
    return user.manifestations;
  } catch (error) {
    throw new Error(`Erreur lors de la récupération des manifestations de l'utilisateur: ${error.message}`);
  }
};

// Récupérer les utilisateurs d'une manifestation
const getAllUsersOfManifestation = async (manifestationId) => {
  try {
    const users = await User.find({
      'manifestations.manifestation': mongoose.Types.ObjectId.createFromHexString(manifestationId)
    }).sort({ username: 1 });
    return users;
  } catch (error) {
    throw new Error(`Erreur lors de la récupération des utilisateurs de la manifestation: ${error.message}`);
  }
};

module.exports = {
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  addManifestation,
  removeManifestation,
  updateManifestation,
  getManifestationAvailabilities,
  addAvailability,
  removeAvailability,
  updateAvailability,
  getAllUsers,
  getUserManifestations,
  getAllUsersOfManifestation
};