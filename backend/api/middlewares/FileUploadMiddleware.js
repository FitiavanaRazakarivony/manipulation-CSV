const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os'); // Importation de os pour les répertoires temporaires
const { validateFileType } = require('../utils/FileUtils');
const { cleanData } = require('../utils/JoinUtils');  // Importation de cleanData

class FileUploadMiddleware {

  constructor(uploadDir = path.join(os.tmpDir(), 'uploads')) {
    this.uploadDir = uploadDir; // Utilisation du répertoire temporaire par défaut

    this.ensureUploadDirExists();

    this.upload = multer({
      storage: this.storage(),
      fileFilter: this.fileFilter, // Vérification de type de fichier
    });
  }

  ensureUploadDirExists() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true }); // Crée le répertoire temporaire si nécessaire
    }
  }

  storage() {
    return multer.diskStorage({
      destination: (req, file, cb) => cb(null, this.uploadDir),
      filename: (req, file, cb) => {
        const customName = `${req.body.uploadFile || 'default'}-${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}-${file.originalname}`;
        cb(null, customName);
      },
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
