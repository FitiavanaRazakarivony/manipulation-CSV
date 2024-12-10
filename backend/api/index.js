const express = require('express');
const path = require('path');
const uploadRoutes = require('./routes/csvRoutes');
const cors = require('cors');
const app = express();
const os = require('os');
const fs = require('fs');
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

// Exemple de fichier temporaire
const tmpDir = path.join(os.tmpdir(), 'uploads');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

const tmpDirOutput = path.join(os.tmpdir(), 'output');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDirOutput, { recursive: true });
}

const PORT = process.env.PORT || 9002;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

console.log("again");
console.log("saer");