const path = require('path');

// Fonction pour valider le type de fichier
const validateFileType = (file, cb) => {
  const allowedTypes = ['.csv'];
  const extname = path.extname(file.originalname).toLowerCase();

  if (allowedTypes.indexOf(extname) === -1) {
    return cb(new Error('Seulement les fichiers CSV sont autorisés'));
  }

  cb(null, true);
};

module.exports = { validateFileType };
