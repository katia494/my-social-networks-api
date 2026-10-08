const mongoose = require("mongoose");

// Création du schéma des événements
const eventSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true,
      trim: true
    },

    dateDebut: {
      type: Date,
      required: true
    },

    dateFin: {
      type: Date,
      required: true
    },

    lieu: {
      type: String,
      required: true
    },

    photoCouverture: {
      type: String,
      default: ""
    },

    prive: {
      type: Boolean,
      default: false
    },

    organisateurs: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        }
      ],
      validate: {
        validator: function (value) {
          return value.length >= 1;
        },
        message: "Un événement doit avoir au moins un organisateur"
      }
    },

    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ]
  },
  {
    timestamps: true
  }
);

// Vérification des dates
eventSchema.pre("validate", function () {
  if (this.dateDebut && this.dateFin) {
    if (this.dateFin <= this.dateDebut) {
      this.invalidate(
        "dateFin",
        "La date de fin doit être après la date de début"
      );
    }
  }
});

// Exportation du modèle
module.exports = mongoose.model("Event", eventSchema);