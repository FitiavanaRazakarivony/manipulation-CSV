// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');
// const { validateFileType } = require('../utils/FileUtils');
// const config = require('../../config/appConfig');
// const { cleanData } = require('../utils/JoinUtils');  // Importation de cleanData
// const fastcsv = require('fast-csv');

// class FileUploadMiddleware {

//   constructor(uploadDir = config.uploadDir) {
//     this.uploadDir = path.join(__dirname, '../', uploadDir);  // Dossier où les fichiers seront stockés

//     this.ensureUploadDirExists();

//     this.upload = multer({
//       storage: this.storage(),
//       fileFilter: this.fileFilter,  // Garder la vérification de type de fichier
//     });
//   }

//   ensureUploadDirExists() {
//     if (!fs.existsSync(this.uploadDir)) {
//       fs.mkdirSync(this.uploadDir, { recursive: true });  // Crée le répertoire de téléchargement s'il n'existe pas
//     }
//   }

//   storage() {
//     return multer.diskStorage({
//       destination: (req, file, cb) => cb(null, this.uploadDir),
//       filename: (req, file, cb) => {
//         const customName = `${req.body.uploadFile || 'default'}-${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}-${file.originalname}`;
//         cb(null, customName);
//       },
//     });
//   }

//   fileFilter(req, file, cb) {
//     validateFileType(file, cb);  // Validation du type de fichier
//   }

//   getMiddleware() {
//     return this.upload;
//   }

// }

// module.exports = FileUploadMiddleware;

const multer = require('multer');
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');
const { validateFileType } = require('../utils/FileUtils');
const config = require('../../config/appConfig');

// Configurer AWS S3
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

class FileUploadMiddleware {

  constructor() {
    // Configurez le stockage pour utiliser S3
    this.upload = multer({
      storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_BUCKET_NAME, // Nom de votre bucket S3
        acl: 'public-read', // L'accès au fichier dans le bucket
        metadata: (req, file, cb) => {
          cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
          const customName = `${req.body.uploadFile || 'default'}-${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}-${file.originalname}`;
          cb(null, customName); // Nom personnalisé pour le fichier
        },
      }),
      fileFilter: this.fileFilter, // Validation du type de fichier
    });
  }

  // Fonction pour filtrer les types de fichiers autorisés
  fileFilter(req, file, cb) {
    validateFileType(file, cb);
  }

  // Récupérer le middleware de multer
  getMiddleware() {
    return this.upload;
  }
}

module.exports = FileUploadMiddleware;

