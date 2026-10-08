const express = require("express");
const mongoose = require("mongoose");

const Event = require("../models/Event");
const User = require("../models/user");

const router = express.Router();

// ====================================
// POST : Créer un événement
// ====================================

router.post("/", async (req, res) => {
  try {
    const {
      nom,
      description,
      dateDebut,
      dateFin,
      lieu,
      photoCouverture,
      prive,
      organisateurs,
      participants
    } = req.body;

    // Vérifier les champs obligatoires
    if (
      !nom ||
      !description ||
      !dateDebut ||
      !dateFin ||
      !lieu
    ) {
      return res.status(400).json({
        message: "Tous les champs obligatoires doivent être renseignés"
      });
    }

    // Vérifier les organisateurs
    if (
      !Array.isArray(organisateurs) ||
      organisateurs.length === 0
    ) {
      return res.status(400).json({
        message: "Un événement doit avoir au moins un organisateur"
      });
    }

    // Vérifier les participants
    if (
      participants !== undefined &&
      !Array.isArray(participants)
    ) {
      return res.status(400).json({
        message: "Les participants doivent être une liste"
      });
    }

    // Vérifier les dates
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);

    if (
      isNaN(debut.getTime()) ||
      isNaN(fin.getTime()) ||
      fin <= debut
    ) {
      return res.status(400).json({
        message: "Les dates de l'événement sont invalides"
      });
    }

    // Vérifier les identifiants des utilisateurs
    const tousLesIds = [
      ...organisateurs,
      ...(participants || [])
    ];

    if (
      tousLesIds.some(
        id => !mongoose.isValidObjectId(id)
      )
    ) {
      return res.status(400).json({
        message: "Un identifiant utilisateur est invalide"
      });
    }

    // Vérifier que les utilisateurs existent
    const idsUniques = [
      ...new Set(tousLesIds.map(id => id.toString()))
    ];

    const utilisateursExistants = await User.countDocuments({
      _id: { $in: idsUniques }
    });

    if (utilisateursExistants !== idsUniques.length) {
      return res.status(400).json({
        message: "Un ou plusieurs utilisateurs n'existent pas"
      });
    }

    // Créer l'événement
    const event = new Event({
      nom,
      description,
      dateDebut: debut,
      dateFin: fin,
      lieu,
      photoCouverture,
      prive,
      organisateurs: [...new Set(organisateurs)],
      participants: [...new Set(participants || [])]
    });

    // Enregistrer dans MongoDB
    await event.save();

    res.status(201).json({
      message: "Événement créé avec succès",
      event
    });

  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Données invalides",
        erreurs: Object.values(error.errors).map(
          erreur => erreur.message
        )
      });
    }

    console.error(error);

    res.status(500).json({
      message: "Erreur lors de la création de l'événement"
    });
  }
});

// ====================================
// GET : Afficher tous les événements
// ====================================

router.get("/", async (req, res) => {
  try {
    const events = await Event.find()
      .populate("organisateurs", "nom prenom email")
      .populate("participants", "nom prenom email");

    res.status(200).json(events);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Erreur lors de la récupération des événements"
    });
  }
});

// ====================================
// GET : Afficher un événement par son ID
// ====================================

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que l'identifiant est valide
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Identifiant invalide"
      });
    }

    // Rechercher l'événement dans MongoDB
    const event = await Event.findById(id)
      .populate("organisateurs", "nom prenom email")
      .populate("participants", "nom prenom email");

    // Vérifier si l'événement existe
    if (!event) {
      return res.status(404).json({
        message: "Événement introuvable"
      });
    }

    // Retourner l'événement
    res.status(200).json(event);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Erreur lors de la récupération de l'événement"
    });
  }
});

// ====================================
// PUT : Modifier un événement
// ====================================

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier l'identifiant
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Identifiant invalide"
      });
    }

    // Rechercher l'événement
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        message: "Événement introuvable"
      });
    }

    // Champs autorisés à être modifiés
    const champsAutorises = [
      "nom",
      "description",
      "dateDebut",
      "dateFin",
      "lieu",
      "photoCouverture",
      "prive",
      "organisateurs",
      "participants"
    ];

    // Refuser les champs inconnus
    const champsInconnus = Object.keys(req.body).filter(
      champ => !champsAutorises.includes(champ)
    );

    if (champsInconnus.length > 0) {
      return res.status(400).json({
        message: "Champs non autorisés",
        champs: champsInconnus
      });
    }

    // Vérifier les listes d'utilisateurs
    for (const champ of ["organisateurs", "participants"]) {
      if (req.body[champ] !== undefined) {
        if (!Array.isArray(req.body[champ])) {
          return res.status(400).json({
            message: `${champ} doit être une liste`
          });
        }

        if (
          champ === "organisateurs" &&
          req.body[champ].length === 0
        ) {
          return res.status(400).json({
            message: "Un événement doit avoir au moins un organisateur"
          });
        }

        const ids = [...new Set(req.body[champ])];

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
            message: "Un ou plusieurs utilisateurs n'existent pas"
          });
        }

        req.body[champ] = ids;
      }
    }

    // Modifier les champs
    for (const champ of champsAutorises) {
      if (req.body[champ] !== undefined) {
        event[champ] = req.body[champ];
      }
    }

    // Vérifier et enregistrer les modifications
    await event.save();

    res.status(200).json({
      message: "Événement modifié avec succès",
      event
    });

  } catch (error) {
    if (error.name === "ValidationError" ||
        error.name === "CastError") {
      return res.status(400).json({
        message: "Données invalides",
        erreur: error.message
      });
    }

    console.error(error);

    res.status(500).json({
      message: "Erreur lors de la modification"
    });
  }
});

// ====================================
// DELETE : Supprimer un événement
// ====================================

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que l'identifiant est valide
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Identifiant invalide"
      });
    }

    // Rechercher et supprimer l'événement
    const event = await Event.findByIdAndDelete(id);

    // Vérifier si l'événement existait
    if (!event) {
      return res.status(404).json({
        message: "Événement introuvable"
      });
    }

    res.status(200).json({
      message: "Événement supprimé avec succès",
      event
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Erreur lors de la suppression de l'événement"
    });
  }
});

module.exports = router;