const multer = require('multer');
const path = require('path');
const { validateFileType } = require('../utils/FileUtils');
const config = require('../../config/appConfig');
const { cleanData } = require('../utils/JoinUtils');
const fastcsv = require('fast-csv');
const fs = require('fs');

// Vous pouvez supprimer l'utilisation de "fs" car les fichiers persistants ne fonctionneront pas sur Vercel.

class FileUploadMiddleware {
  constructor() {
    this.upload = multer({
      storage: this.diskStorage(), // Utilisation de la mémoire pour stocker temporairement les fichiers
      fileFilter: this.fileFilter,
    });
  }

  diskStorage() {
    return multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadDir = '../uploads';
  
        // Vérifier si le dossier 'uploads' existe, sinon le créer
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true }); // Créer le dossier si nécessaire
        }
  
        // Définir le dossier de destination
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
      }
    });
  }
  fileFilter(req, file, cb) {
    validateFileType(file, cb); // Validation du type de fichier
  }

  getMiddleware() {
    return this.upload;
  }
}

module.exports = FileUploadMiddleware;
