const express = require('express');
const path = require('path');
const uploadRoutes = require('./routes/csvRoutes');
const cors = require('cors');

const app = express();

// Configuration de CORS
app.use(cors({
  origin: '*', // Autorise uniquement les requêtes venant de ce domaine
  methods: 'GET,POST,PUT,DELETE', // Méthodes autorisées
  allowedHeaders: 'Content-Type', // En-têtes autorisés
}));

// Middleware pour gérer les données JSON et les formulaires
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route d'upload
app.use('/api', uploadRoutes);

// Démarrer le serveur
const PORT = process.env.PORT || 9002;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


