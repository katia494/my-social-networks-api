const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      default: ""
    },

    visibilite: {
      type: String,
      enum: ["public", "prive", "secret"],
      default: "public"
    },

    administrateurs: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }],

    membres: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],

    permissions: {
      publier: {
        type: String,
        enum: ["tous", "administrateurs"],
        default: "tous"
      },

      creerEvenement: {
        type: String,
        enum: ["tous", "administrateurs"],
        default: "administrateurs"
      }
    }
  },
  { timestamps: true }
);

groupSchema.path("administrateurs").validate(
  value => value.length > 0,
  "Un groupe doit avoir au moins un administrateur"
);

module.exports = mongoose.model("Group", groupSchema);