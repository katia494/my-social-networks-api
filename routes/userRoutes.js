const express = require("express");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const User = require("../models/user");

const router = express.Router();

// ====================================
// POST : Créer un utilisateur
// ====================================

router.post("/", async (req, res) => {
  try {
    const { nom, prenom, email, password } = req.body;

    if (!nom || !prenom || !email || !password) {
      return res.status(400).json({
        message: "Tous les champs sont obligatoires"
      });
    }

    const existingUser = await User.findOne({
      email: email.trim().toLowerCase()
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Cet email est déjà utilisé"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      nom,
      prenom,
      email,
      password: hashedPassword
    });

    await user.save();

    res.status(201).json({
      message: "Utilisateur créé avec succès",
      user: {
        id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email
      }
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Cet email est déjà utilisé"
      });
    }

    res.status(500).json({
      message: "Erreur serveur"
    });
  }
});


// ====================================
// GET : Récupérer tous les utilisateurs
// ====================================

router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json(users);

  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des utilisateurs"
    });
  }
});


// ====================================
// GET : Récupérer un utilisateur par ID
// ====================================

router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Identifiant invalide"
      });
    }

    const user = await User.findById(req.params.id)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        message: "Utilisateur introuvable"
      });
    }

    res.status(200).json(user);

  } catch (error) {
    res.status(500).json({
      message: "Erreur serveur"
    });
  }
});


// ====================================
// PUT : Modifier un utilisateur
// ====================================

router.put("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Identifiant invalide"
      });
    }

    const { nom, prenom, email } = req.body;

    const modifications = {};

    if (nom !== undefined) modifications.nom = nom;
    if (prenom !== undefined) modifications.prenom = prenom;
    if (email !== undefined) modifications.email = email;

    if (Object.keys(modifications).length === 0) {
      return res.status(400).json({
        message: "Aucune modification valide fournie"
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      modifications,
      {
        new: true,
        runValidators: true
      }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "Utilisateur introuvable"
      });
    }

    res.status(200).json({
      message: "Utilisateur modifié avec succès",
      user
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Cet email est déjà utilisé"
      });
    }

    if (error.name === "ValidationError" ||
        error.name === "CastError") {
      return res.status(400).json({
        message: "Données invalides"
      });
    }

    res.status(500).json({
      message: "Erreur serveur"
    });
  }
});


// ====================================
// DELETE : Supprimer un utilisateur
// ====================================

router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Identifiant invalide"
      });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "Utilisateur introuvable"
      });
    }

    res.status(200).json({
      message: "Utilisateur supprimé avec succès"
    });

  } catch (error) {
    res.status(500).json({
      message: "Erreur serveur"
    });
  }
});

module.exports = router;