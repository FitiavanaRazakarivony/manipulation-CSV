const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { validateFileType } = require('../utils/FileUtils');
const config = require('../../config/appConfig');
const { cleanData } = require('../utils/JoinUtils');  // Importation de cleanData
const fastcsv = require('fast-csv');

class FileUploadMiddleware {

  constructor(uploadDir = config.uploadDir) {
    this.uploadDir = path.join(__dirname, '../../', uploadDir);  // Dossier où les fichiers seront stockés

    this.ensureUploadDirExists();

    this.upload = multer({
      storage: this.storage(),
      fileFilter: this.fileFilter,  // Garder la vérification de type de fichier
    });
  }

  ensureUploadDirExists() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });  // Crée le répertoire de téléchargement s'il n'existe pas
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
    validateFileType(file, cb);  // Validation du type de fichier
  }

  getMiddleware() {
    return this.upload;
  }

}

module.exports = FileUploadMiddleware;