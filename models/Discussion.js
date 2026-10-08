const mongoose = require("mongoose");

const discussionSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: true
  },

  groupe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group"
  },

  evenement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event"
  },

  messages: [{
    auteur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    contenu: {
      type: String,
      required: true
    },

    reponseA: {
      type: mongoose.Schema.Types.ObjectId
    },

    date: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

// Une discussion appartient à un groupe OU un événement
discussionSchema.pre("validate", function () {
  if (Boolean(this.groupe) === Boolean(this.evenement)) {
    this.invalidate(
      "groupe",
      "Une discussion doit appartenir à un groupe OU un événement"
    );
  }
});

module.exports = mongoose.model("Discussion", discussionSchema);