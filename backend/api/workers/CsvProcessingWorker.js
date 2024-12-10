const fs = require('fs');
const fastcsv = require('fast-csv');
const path = require('path');
const os = require('os'); // Importation du module os
const { cleanData, removeDuplicates } = require('../utils/JoinUtils'); // Importation de cleanData

class CsvProcessingWorker {
  constructor(namefile, filePath = null) {
    const tmpDir = path.join(os.tmpdir(), 'uploads'); // Définir un dossier temporaire pour les fichiers

    // Assurez-vous que le répertoire temporaire existe
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    this.filePath = filePath || path.join(tmpDir, `${namefile}.csv`); // Chemin par défaut si non fourni
    this.namefile = namefile;
  }

  async process() {
    return new Promise((resolve, reject) => {
      const data = [];
      const outputDir = path.join(os.tmpdir(), 'output'); // Dossier temporaire pour le fichier nettoyé

      console.log('Chemin du fichier:', this.filePath);

      if (!this.filePath) {
        return reject(new Error('Chemin du fichier non défini.'));
      }

      // Créer le dossier de sortie s'il n'existe pas
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Créer un flux de lecture pour analyser le CSV
      fs.createReadStream(this.filePath)
        // Enlever les caractères BOM (Byte Order Mark) invisibles au début du fichier
        .pipe(
          new require('stream').Transform({
            transform(chunk, encoding, callback) {
              this.push(chunk.toString().replace(/^\uFEFF/, '')); // Enlever le BOM
              callback();
            },
          })
        )
        .pipe(
          fastcsv.parse({
            headers: true,
            skipEmpty: true,
            delimiter: ';', // Délimiteur ici, ajustez à ';' selon votre format
          })
        )
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
          csvStream
            .pipe(writeStream)
            .on('finish', () => {
              resolve({
                data: deduplicatedData,
                csvPath: finalOutputPath,
              });
            })
            .on('error', (err) => reject(err));

          deduplicatedData.forEach((row) => csvStream.write(row));
          csvStream.end();
        })
        .on('error', (err) => reject(err)); // Gestion des erreurs
    });
  }

  
}

module.exports = CsvProcessingWorker;

// // Exemple d'utilisation
// const filePath = path.join(os.tmpdir(), 'uploads', 'example.csv');
// fs.writeFileSync(filePath, 'id;name\n1;Alice\n2;Bob\n'); // Création d'un exemple de fichier CSV temporaire

// const worker = new CsvProcessingWorker('example');
// worker
//   .process()
//   .then(({ data, csvPath }) => {
//     console.log('Données traitées :', data);
//     console.log('Chemin du fichier CSV nettoyé :', csvPath);
//   })
//   .catch((err) => console.error('Erreur lors du traitement du CSV :', err));
