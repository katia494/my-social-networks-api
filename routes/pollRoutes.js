const express = require("express");
const mongoose = require("mongoose");

const Poll = require("../models/Poll");
const Event = require("../models/Event");

const router = express.Router();

// Créer un sondage
router.post("/", async (req, res) => {
  try {
    const { titre, evenement, organisateur, questions } = req.body;

    if (!mongoose.isValidObjectId(evenement) ||
        !mongoose.isValidObjectId(organisateur)) {
      return res.status(400).json({ message: "ID invalide" });
    }

    const event = await Event.findById(evenement);

    if (!event) {
      return res.status(404).json({ message: "Événement introuvable" });
    }

    if (!event.organisateurs.some(
      id => id.toString() === organisateur
    )) {
      return res.status(403).json({
        message: "Seul un organisateur peut créer un sondage"
      });
    }

    const poll = await Poll.create({
      titre, evenement, organisateur, questions
    });

    res.status(201).json(poll);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Afficher les sondages
router.get("/", async (req, res) => {
  try {
    const polls = await Poll.find().populate("evenement", "nom");
    res.json(polls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Voter à une question
router.post("/:id/questions/:questionId/votes", async (req, res) => {
  try {
    const { id, questionId } = req.params;
    const { utilisateur, choixIndex } = req.body;

    if (![id, questionId, utilisateur].every(
      valeur => mongoose.isValidObjectId(valeur)
    )) {
      return res.status(400).json({ message: "ID invalide" });
    }

    const poll = await Poll.findById(id);

    if (!poll) {
      return res.status(404).json({ message: "Sondage introuvable" });
    }

    const event = await Event.findById(poll.evenement);

    if (!event || !event.participants.some(
      participant => participant.toString() === utilisateur
    )) {
      return res.status(403).json({
        message: "Seuls les participants peuvent voter"
      });
    }

    const question = poll.questions.id(questionId);

    if (!question) {
      return res.status(404).json({ message: "Question introuvable" });
    }

    if (!Number.isInteger(choixIndex) ||
        choixIndex < 0 ||
        choixIndex >= question.choix.length) {
      return res.status(400).json({ message: "Choix invalide" });
    }

    if (question.votes.some(
      vote => vote.utilisateur.toString() === utilisateur
    )) {
      return res.status(409).json({
        message: "Vous avez déjà voté à cette question"
      });
    }

    question.votes.push({ utilisateur, choixIndex });
    await poll.save();

    res.status(201).json({ message: "Vote enregistré", poll });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;