const express = require("express");
const mongoose = require("mongoose");

// Importation des routes
const userRoutes = require("./routes/userRoutes");
const eventRoutes = require("./routes/eventRoutes");
const groupRoutes = require("./routes/groupRoutes");
const discussionRoutes = require("./routes/discussionRoutes");
const albumRoutes = require("./routes/albumRoutes");
const pollRoutes = require("./routes/pollRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
// Création de l'application Express
const app = express();

// Middleware JSON
app.use(express.json());
app.use("/polls", pollRoutes);
app.use("/albums", albumRoutes);
app.use("/groups", groupRoutes);
app.use("/tickets", ticketRoutes);
// Route principale
app.get("/", (req, res) => {
    res.json({
        message: "Bienvenue sur My Social Networks API"
    });
});

// Routes des utilisateurs
app.use("/users", userRoutes);

// Routes des événements
app.use("/events", eventRoutes);

app.use("/discussions", discussionRoutes);

// Connexion MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/my_social_networks")
    .then(() => {
        console.log("Connexion à MongoDB réussie !");
    })
    .catch((error) => {
        console.error("Erreur MongoDB :", error);
    });

// Démarrage du serveur
const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});