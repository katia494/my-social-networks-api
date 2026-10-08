const express = require("express");
const mongoose = require("mongoose");

const Ticket = require("../models/Ticket");
const Event = require("../models/Event");

const router = express.Router();

// Créer une billetterie pour un événement public
router.post("/", async (req, res) => {
  try {
    const { evenement, typesBillets } = req.body;

    if (!mongoose.isValidObjectId(evenement)) {
      return res.status(400).json({ message: "ID invalide" });
    }

    const event = await Event.findById(evenement);

    if (!event) {
      return res.status(404).json({ message: "Événement introuvable" });
    }

    if (event.prive) {
      return res.status(403).json({
        message: "Billetterie réservée aux événements publics"
      });
    }

    if (!Array.isArray(typesBillets) || !typesBillets.length) {
      return res.status(400).json({
        message: "Au moins un type de billet est obligatoire"
      });
    }

    const existe = await Ticket.findOne({ evenement });

    if (existe) {
      return res.status(409).json({
        message: "Une billetterie existe déjà"
      });
    }

    const ticket = await Ticket.create({
      evenement,
      typesBillets,
      reservations: []
    });

    res.status(201).json(ticket);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Consulter les billetteries
router.get("/", async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate("evenement", "nom lieu dateDebut");

    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Réserver un billet
router.post("/:id/reservations", async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, adresse, typeBillet, utilisateur } = req.body;

    if (!mongoose.isValidObjectId(id) ||
        !mongoose.isValidObjectId(typeBillet) ||
        (utilisateur && !mongoose.isValidObjectId(utilisateur))) {
      return res.status(400).json({ message: "ID invalide" });
    }

    if (!nom || !adresse) {
      return res.status(400).json({
        message: "Nom et adresse obligatoires"
      });
    }

    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return res.status(404).json({
        message: "Billetterie introuvable"
      });
    }

    const type = ticket.typesBillets.id(typeBillet);

    if (!type) {
      return res.status(404).json({
        message: "Type de billet introuvable"
      });
    }

    if (type.vendus >= type.quantite) {
      return res.status(409).json({
        message: "Billets épuisés"
      });
    }

    if (utilisateur && ticket.reservations.some(
      reservation => reservation.utilisateur?.toString() === utilisateur
    )) {
      return res.status(409).json({
        message: "Cet utilisateur possède déjà un billet"
      });
    }

    type.vendus += 1;

    ticket.reservations.push({
      nom,
      adresse,
      typeBillet,
      utilisateur
    });

    await ticket.save();

    res.status(201).json({
      message: "Billet réservé avec succès",
      ticket
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;