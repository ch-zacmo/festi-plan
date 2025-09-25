const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AvailabilitySchema = new Schema({
  start: Date,
  end: Date,
  type: {
    type: String,
    enum: ['available', 'unavailable'],
    default: 'available'
  }
});

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: false,  // Non requis pour les utilisateurs sans compte
    select: false     // Ne pas renvoyer le mot de passe par défaut
  },
  hasUserSpace: {
    type: Boolean,
    default: false
  },
  email : {
    type: String,
    required: false,
    unique: false
  },
  role: {
    type: String,
    enum: ['admin', 'gestionnaire', 'employee', 'gestionnaire_read_only'],
    default: 'employee'
  },
  manifestations: [{
    manifestation: {
      type: Schema.Types.ObjectId,
      ref: 'Manifestation'
    },
    availability: [AvailabilitySchema], // Plages de disponibilités pour cette manifestation
  }]
});



module.exports = mongoose.model('User', UserSchema);