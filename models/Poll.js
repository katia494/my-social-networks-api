const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  texte: { type: String, required: true },
  choix: {
    type: [String],
    validate: {
      validator: v => v.length >= 2,
      message: "Au moins deux choix sont nécessaires"
    }
  },
  votes: [{
    utilisateur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    choixIndex: { type: Number, required: true }
  }]
});

const pollSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  evenement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true
  },
  organisateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  questions: {
    type: [questionSchema],
    validate: {
      validator: v => v.length > 0,
      message: "Au moins une question est nécessaire"
    }
  }
}, { timestamps: true });

module.exports = mongoose.model("Poll", pollSchema);