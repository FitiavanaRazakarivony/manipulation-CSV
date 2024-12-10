  const fs = require('fs');
  const fastcsv = require('fast-csv');
  const path = require('path');
  const os = require('os');
  const { cleanData, removeDuplicates } = require('../utils/JoinUtils'); // Importation de cleanData

  class CsvProcessingWorker {
    constructor(namefile, filePath = null) {
      const tmpDir = path.join(os.tmpdir(), 'uploads'); // Définir un dossier temporaire pour les fichiers

      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }

      this.filePath = filePath || path.join(os.tmpdir(), `${namefile}.csv`);
      this.namefile = namefile;
    }

    async process() {
      return new Promise((resolve, reject) => {
        const data = [];
        const outputDir = path.join(os.tmpdir(), 'output'); // Utilisation du répertoire temporaire

        console.log('Chemin du fichier fourni :', this.filePath);

        if (!this.filePath || !fs.existsSync(this.filePath)) {
          return reject(new Error(`Fichier introuvable : ${this.filePath}`));
        }

        // Vérifier et créer le dossier de sortie si nécessaire
        try {
          if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
          }
        } catch (err) {
          console.error(`Erreur lors de la création du répertoire ${outputDir}:`, err);
          return reject(new Error(`Impossible de créer le répertoire de sortie: ${err.message}`));
        }

        const readStream = fs.createReadStream(this.filePath);

        readStream.on('error', (err) => {
          return reject(new Error(`Erreur lors de la lecture du fichier : ${err.message}`));
        });

        readStream
          .pipe(
            fastcsv.parse({
              headers: true,
              skipEmpty: true,
              delimiter: ';',
            })
          )
          .on('data', (row) => {
            data.push(row);
          })
          .on('end', () => {
            try {
              const cleanedData = cleanData(data);
              const deduplicatedData = removeDuplicates(cleanedData);

              const finalOutputPath = path.join(outputDir, `${this.namefile}-cleaned.csv`);
              const writeStream = fs.createWriteStream(finalOutputPath);
              const csvStream = fastcsv.format({ headers: true });

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
            } catch (error) {
              reject(error);
            }
          })
          .on('error', (err) => reject(err));
      });
    }
  }

  module.exports = CsvProcessingWorker;
