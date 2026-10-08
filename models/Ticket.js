const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
  evenement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true
  },

  typesBillets: [{
    nom: {
      type: String,
      required: true
    },
    prix: {
      type: Number,
      required: true,
      min: 0
    },
    quantite: {
      type: Number,
      required: true,
      min: 1
    },
    vendus: {
      type: Number,
      default: 0
    }
  }],

  reservations: [{
    nom: {
      type: String,
      required: true
    },
    adresse: {
      type: String,
      required: true
    },
    dateReservation: {
      type: Date,
      default: Date.now
    },
    typeBillet: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    utilisateur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model("Ticket", ticketSchema);