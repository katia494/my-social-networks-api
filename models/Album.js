const mongoose = require("mongoose");

const commentaireSchema = new mongoose.Schema({
  auteur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  contenu: {
    type: String,
    required: true
  }
}, { timestamps: true });

const photoSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ""
  },
  commentaires: [commentaireSchema]
}, { timestamps: true });

const albumSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: true
  },
  evenement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true
  },
  photos: [photoSchema]
}, { timestamps: true });

module.exports = mongoose.model("Album", albumSchema);