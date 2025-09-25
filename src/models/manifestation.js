const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ShiftSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User', // L'utilisateur affecté à ce shift
    required: false
  },
  start: {
    type: Date,
    required: true
  },
  end: {
    type: Date,
    required: true
  }
});

const StandSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  color: {
    type: String,
    required: false,
    default: '#fc4103'
  },
  start: {
    type: Date,
    required: false,
    default: Date.now
  },
  end: {
    type: Date,
    required: false,
    default: Date.now
  },
  manager : [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  shifts: [ShiftSchema] // Tableau de shifts associés à ce stand
});

const ManifestationSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  start_date: {
    type: Date,
    required: true
  },
  end_date: {
    type: Date,
    required: true
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Le propriétaire est une référence à un utilisateur
    required: true
  },
  managers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  stands: [StandSchema] // Les stands de la manifestation
});

module.exports = mongoose.model('Manifestation', ManifestationSchema);