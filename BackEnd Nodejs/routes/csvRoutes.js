const express = require('express');
const router = express.Router();
const FileUploadMiddleware = require('../middlewares/FileUploadMiddleware');
const CsvController = require('../controller/CsvController');

const fileUploadMiddleware = new FileUploadMiddleware();

// Route pour l'upload de fichiers CSV
router.post('/upload', fileUploadMiddleware.getMiddleware().array('file', 10), CsvController.handleCsvUpload);

// Route pour récupérer la liste des fichiers uploadés
router.get('/getFile', CsvController.getUploadedFiles);
router.get('/url', CsvController.url);

// Route pour télécharger un fichier
router.get('/download/:type/:fileName', CsvController.downloadFile);

// Nouvelle route pour supprimer un fichier
router.delete('/delete/:type/:fileName', CsvController.deleteFile);

module.exports = router;