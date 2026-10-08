const express = require("express");
const mongoose = require("mongoose");

const Discussion = require("../models/Discussion");
const Group = require("../models/Group");
const Event = require("../models/Event");
const User = require("../models/user");

const router = express.Router();

// Créer une discussion
router.post("/", async (req, res) => {
  try {
    const { titre, groupe, evenement } = req.body;

    if (!titre || Boolean(groupe) === Boolean(evenement)) {
      return res.status(400).json({
        message: "Titre requis et groupe OU événement obligatoire"
      });
    }

    const id = groupe || evenement;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Identifiant invalide"
      });
    }

    const parent = groupe
      ? await Group.findById(groupe)
      : await Event.findById(evenement);

    if (!parent) {
      return res.status(404).json({
        message: "Groupe ou événement introuvable"
      });
    }

    const discussion = await Discussion.create({
      titre,
      groupe,
      evenement,
      messages: []
    });

    res.status(201).json(discussion);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Afficher toutes les discussions
router.get("/", async (req, res) => {
  try {
    const discussions = await Discussion.find()
      .populate("groupe", "nom")
      .populate("evenement", "nom");

    res.status(200).json(discussions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Ajouter un message
router.post("/:id/messages", async (req, res) => {
  try {
    const { auteur, contenu, reponseA } = req.body;

    if (!mongoose.isValidObjectId(req.params.id) ||
        !mongoose.isValidObjectId(auteur) ||
        (reponseA && !mongoose.isValidObjectId(reponseA))) {
      return res.status(400).json({
        message: "Identifiant invalide"
      });
    }

    if (!contenu || !contenu.trim()) {
      return res.status(400).json({
        message: "Le contenu est obligatoire"
      });
    }

    const utilisateur = await User.findById(auteur);

    if (!utilisateur) {
      return res.status(404).json({
        message: "Utilisateur introuvable"
      });
    }

    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({
        message: "Discussion introuvable"
      });
    }

    if (
      reponseA &&
      !discussion.messages.some(
        message => message._id.toString() === reponseA
      )
    ) {
      return res.status(400).json({
        message: "Message auquel répondre introuvable"
      });
    }

    discussion.messages.push({
      auteur,
      contenu,
      reponseA: reponseA || undefined
    });

    await discussion.save();

    res.status(201).json(discussion);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Afficher une discussion et ses messages
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Identifiant invalide"
      });
    }

    const discussion = await Discussion.findById(req.params.id)
      .populate("messages.auteur", "nom prenom");

    if (!discussion) {
      return res.status(404).json({
        message: "Discussion introuvable"
      });
    }

    res.status(200).json(discussion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;