const fs = require('fs');
const fastcsv = require('fast-csv');
const path = require('path');
const { cleanData, removeDuplicates } = require('../utils/JoinUtils'); // Importation de cleanData

class CsvProcessingWorker {
  constructor(filePath, namefile) {
    this.filePath = filePath;
    this.namefile = namefile;
  }

  async process() {
    return new Promise((resolve, reject) => {
      const data = [];
      const outputDir = path.join(__dirname, '../../', 'output'); // Dossier où sauvegarder le fichier CSV généré

      console.log('Chemin du fichier:', this.filePath);

      if (!this.filePath) {
        return reject(new Error('Chemin du fichier non défini.'));
    }

      // Créer le dossier de sortie si il n'existe pas
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true }); // Crée le répertoire et les sous-répertoires nécessaires
      }

      // Créer un flux de lecture pour analyser le CSV
      fs.createReadStream(this.filePath)
        // Enlever les caractères BOM (Byte Order Mark) invisibles au début du fichier
        .pipe(new require('stream').Transform({
          transform(chunk, encoding, callback) {
            this.push(chunk.toString().replace(/^\uFEFF/, '')); // Enlever le BOM
            callback();
          }
        }))
        .pipe(fastcsv.parse({
          headers: true,
          skipEmpty: true,
          delimiter: ';', // Délimiteur ici, ajustez à ';' selon votre format
        }))
        .on('data', (row) => {
          data.push(row); // Ajouter chaque ligne traitée dans 'data'
        })
        .on('end', () => {
          // Étape 1 : Nettoyer les données avec cleanData
          const cleanedData = cleanData(data);

          // Étape 2 : Supprimer les doublons des données nettoyées
          const deduplicatedData = removeDuplicates(cleanedData);

          // Générer le chemin du fichier CSV nettoyé
          const finalOutputPath = path.join(outputDir, `${this.namefile}-cleaned.csv`);
          const writeStream = fs.createWriteStream(finalOutputPath);
          const csvStream = fastcsv.format({ headers: true });
          

          // Écrire les données nettoyées et dédupliquées dans le fichier CSV
          csvStream.pipe(writeStream)
            .on('finish', () => {
              resolve({
                data: deduplicatedData,
                csvPath: finalOutputPath,
              });
            })
            .on('error', (err) => reject(err));

          deduplicatedData.forEach(row => csvStream.write(row));
          csvStream.end();
        })
        .on('error', (err) => reject(err)); // Gestion des erreurs
    });
  }
}

module.exports = CsvProcessingWorker;
