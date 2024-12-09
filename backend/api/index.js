const express = require('express');
const path = require('path');
const uploadRoutes = require('./routes/csvRoutes');
const cors = require('cors');
const app = express();
require('dotenv').config();

// Configuration de CORS
app.use(cors({
  origin: '*', 
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type',
}));

app.get('/api', (req, res) => {
  res.send('Hello, world!');
});

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

console.log("again");
console.log("saer");