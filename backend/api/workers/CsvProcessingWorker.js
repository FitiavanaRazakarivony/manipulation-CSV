// CsvProcessingWorker.js

const fs = require('fs');
const fastcsv = require('fast-csv');
const path = require('path');
const os = require('os');
const { cleanData, removeDuplicates } = require('../utils/JoinUtils'); // Importation de cleanData

class CsvProcessingWorker {
  constructor(filePath) {
    this.filePath = filePath;
  }

  async getHeaders() {
    return new Promise((resolve, reject) => {
      const readStream = fs.createReadStream(this.filePath);
      let firstLine = '';

      readStream.on('data', (chunk) => {
        firstLine += chunk.toString();
        if (firstLine.includes('\n')) {
          readStream.destroy();
          const delimiter = firstLine.includes(';') ? ';' : ',';
          const headers = firstLine.split('\n')[0].split(delimiter).map((header) => header.trim());
          resolve(headers);
        }
      });

      readStream.on('error', (err) => {
        return reject(new Error(`Erreur lors de la lecture du fichier : ${err.message}`));
      });
    });
  }

  async process() {
    return new Promise((resolve, reject) => {
      const data = [];
      const outputDir = path.join(os.tmpdir(), 'output');

      if (!this.filePath || !fs.existsSync(this.filePath)) {
        return reject(new Error(`Fichier introuvable : ${this.filePath}`));
      }

      // Vérifier et créer le dossier de sortie si nécessaire
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const readStream = fs.createReadStream(this.filePath);
      let firstLine = '';

      readStream.on('data', (chunk) => {
        firstLine += chunk.toString();
        if (firstLine.includes('\n')) {
          const delimiter = firstLine.includes(';') ? ';' : ',';
          readStream.destroy();
          this._processFile(delimiter, resolve, reject, data, outputDir);
        }
      });

      readStream.on('error', (err) => {
        return reject(new Error(`Erreur lors de la lecture du fichier : ${err.message}`));
      });
    });
  }

  async _processFile(delimiter, resolve, reject, data, outputDir) {
    const readStream = fs.createReadStream(this.filePath);
    readStream
      .pipe(
        fastcsv.parse({
          headers: true,
          skipEmpty: true,
          delimiter: delimiter,
        })
      )
      .on('data', (row) => {
        data.push(row);
      })
      .on('end', () => {
        try {
          const cleanedData = cleanData(data);
          const deduplicatedData = removeDuplicates(cleanedData);

          resolve({ data: deduplicatedData });
        } catch (error) {
          reject(error);
        }
      })
      .on('error', (err) => reject(err));
  }
}

module.exports = CsvProcessingWorker;
