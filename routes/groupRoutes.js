const express = require("express");
const mongoose = require("mongoose");
const Group = require("../models/Group");
const User = require("../models/user");

const router = express.Router();

// CREATE
router.post("/", async (req, res) => {
  try {
    const { administrateurs, membres = [] } = req.body;

    if (!Array.isArray(administrateurs) || !administrateurs.length ||
        !Array.isArray(membres)) {
      return res.status(400).json({
        message: "Administrateurs ou membres invalides"
      });
    }

    const ids = [...new Set([...administrateurs, ...membres])];

    if (ids.some(id => !mongoose.isValidObjectId(id))) {
      return res.status(400).json({
        message: "Identifiant utilisateur invalide"
      });
    }

    const nombre = await User.countDocuments({
      _id: { $in: ids }
    });

    if (nombre !== ids.length) {
      return res.status(400).json({
        message: "Utilisateur introuvable"
      });
    }

    const group = await Group.create({
      ...req.body,
      administrateurs: [...new Set(administrateurs)],
      membres: ids
    });

    res.status(201).json(group);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// READ ALL
router.get("/", async (req, res) => {
  try {
    const groups = await Group.find()
      .populate("administrateurs", "nom prenom email")
      .populate("membres", "nom prenom email");

    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// READ ONE
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "ID invalide" });
    }

    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: "Groupe introuvable" });
    }

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "ID invalide" });
    }

    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: "Groupe introuvable" });
    }

    const champs = ["nom", "description", "visibilite", "permissions"];

    for (const champ of champs) {
      if (req.body[champ] !== undefined) {
        group[champ] = req.body[champ];
      }
    }

    await group.save();
    res.json(group);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "ID invalide" });
    }

    const group = await Group.findByIdAndDelete(req.params.id);

    if (!group) {
      return res.status(404).json({ message: "Groupe introuvable" });
    }

    res.json({ message: "Groupe supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// AJOUTER UN MEMBRE AU GROUPE
router.post("/:id/membres", async (req, res) => {
  try {
    const { administrateur, utilisateur } = req.body;

    if (
      !mongoose.isValidObjectId(req.params.id) ||
      !mongoose.isValidObjectId(administrateur) ||
      !mongoose.isValidObjectId(utilisateur)
    ) {
      return res.status(400).json({ message: "ID invalide" });
    }

    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: "Groupe introuvable" });
    }

    const estAdmin = group.administrateurs.some(
      id => id.toString() === administrateur
    );

    if (!estAdmin) {
      return res.status(403).json({
        message: "Seul un administrateur peut ajouter un membre"
      });
    }

    const user = await User.findById(utilisateur);

    if (!user) {
      return res.status(404).json({
        message: "Utilisateur introuvable"
      });
    }

    const dejaMembre = group.membres.some(
      id => id.toString() === utilisateur
    );

    if (dejaMembre) {
      return res.status(409).json({
        message: "Cet utilisateur est déjà membre du groupe"
      });
    }

    group.membres.push(utilisateur);

    await group.save();

    res.status(201).json({
      message: "Membre ajouté avec succès",
      group
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;