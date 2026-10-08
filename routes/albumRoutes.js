const express = require("express");
const mongoose = require("mongoose");

const Album = require("../models/Album");
const Event = require("../models/Event");
const User = require("../models/user");

const router = express.Router();

// Créer un album pour un événement
router.post("/", async (req, res) => {
  try {
    const { titre, evenement } = req.body;

    if (!titre || !mongoose.isValidObjectId(evenement)) {
      return res.status(400).json({
        message: "Titre ou identifiant d'événement invalide"
      });
    }

    const event = await Event.findById(evenement);

    if (!event) {
      return res.status(404).json({
        message: "Événement introuvable"
      });
    }

    const album = await Album.create({
      titre,
      evenement,
      photos: []
    });

    res.status(201).json(album);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Afficher les albums
router.get("/", async (req, res) => {
  try {
    const albums = await Album.find().populate("evenement", "nom");
    res.status(200).json(albums);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Ajouter une photo à un album
router.post("/:id/photos", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "ID invalide" });
    }

    const album = await Album.findById(req.params.id);

    if (!album) {
      return res.status(404).json({ message: "Album introuvable" });
    }

    const { url, description } = req.body;

    if (!url) {
      return res.status(400).json({
        message: "L'URL de la photo est obligatoire"
      });
    }

    album.photos.push({ url, description });
    await album.save();

    res.status(201).json(album);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Commenter une photo
router.post("/:albumId/photos/:photoId/commentaires", async (req, res) => {
  try {
    const { albumId, photoId } = req.params;
    const { auteur, contenu } = req.body;

    if (
      !mongoose.isValidObjectId(albumId) ||
      !mongoose.isValidObjectId(photoId) ||
      !mongoose.isValidObjectId(auteur)
    ) {
      return res.status(400).json({ message: "ID invalide" });
    }

    const album = await Album.findById(albumId);

    if (!album) {
      return res.status(404).json({ message: "Album introuvable" });
    }

    const photo = album.photos.id(photoId);

    if (!photo) {
      return res.status(404).json({ message: "Photo introuvable" });
    }

    const user = await User.findById(auteur);

    if (!user) {
      return res.status(404).json({ message: "Auteur introuvable" });
    }

    if (!contenu || !contenu.trim()) {
      return res.status(400).json({
        message: "Le commentaire ne peut pas être vide"
      });
    }

    photo.commentaires.push({ auteur, contenu });

    await album.save();

    res.status(201).json(album);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Consulter un album
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "ID invalide" });
    }

    const album = await Album.findById(req.params.id)
      .populate("photos.commentaires.auteur", "nom prenom");

    if (!album) {
      return res.status(404).json({ message: "Album introuvable" });
    }

    res.status(200).json(album);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;