const CsvProcessingWorker = require('../../api/workers/CsvProcessingWorker');
const { joinTables, removeDuplicates , cleanData, filterData} = require('../utils/JoinUtils');
const path = require('path');
const fs = require('fs');
const os = require('os'); // Importation du module os
// const appConfig = require('../../config/appConfig'); // Nous n'avons plus besoin de cela

// Fonction pour traiter les fichiers
async function processFiles(files, namefile, nameOutPut, typeJoin, filterCriteria) {
  try {
    // Si `files` et `namefile` ne sont pas des tableaux, les convertir en tableaux
    if (!Array.isArray(files)) {
      files = [files];
    }
    if (!Array.isArray(namefile)) {
      namefile = [namefile];
    }

    // Validation des données d'entrée
    if (namefile.length !== files.length) {
      throw new Error(
        'Le nombre de fichiers ne correspond pas au nombre de noms fournis.'
      );
    }

    const fileNameMapping = files.map((file, index) => ({
      filePath: file.path,
      name: namefile[index],
    }));

    const results = await Promise.all(
      fileNameMapping.map(({ filePath, name }) =>
        new CsvProcessingWorker( name, filePath).process()
      )
    );

    // Fusionner les données des fichiers traités
    const mergedData = results.flatMap((result) => {
      if (result.data && result.data.length > 0) {
        return result.data;
      }
      console.warn(`Aucun résultat trouvé pour le fichier: ${result.name}`);
      return [];
    });

    // Nettoyer les données fusionnées
    const cleanedMergedData = cleanData(mergedData);

    // Supprimer les doublons des données nettoyées
    const deduplicatedData = removeDuplicates(cleanedMergedData);

    // Vérifier filterCriteria avant de l'utiliser
    const filteredData = filterCriteria && Object.keys(filterCriteria).length
      ? filterData(deduplicatedData, filterCriteria)
      : deduplicatedData;

    // Appliquer une jointure si plusieurs fichiers sont fournis
    const finalData =
      results.length > 1
        ? joinTables(results.map(() => filteredData), typeJoin)
        : filteredData;

    // Utiliser os.tmpdir() pour définir le répertoire de sortie
    const outputDir = path.join(os.machine(), 'output'); // Utilisation du répertoire temporaire

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const finalOutputPath = path.join(
      outputDir,
      `${nameOutPut}-${finalData.length > 1 ? 'joined-cleaned' : 'cleaned'}.csv`
    );

    // Générer le contenu CSV
    const csvHeaders = Object.keys(finalData[0] || {}).join(';');
    const csvRows = finalData
      .map((row) => Object.values(row).join(';'))
      .join('\n');
    const csvContent = `${csvHeaders}\n${csvRows}`;

    // Sauvegarder le fichier CSV final
    fs.writeFileSync(finalOutputPath, csvContent, 'utf-8');

    return {
      message:
        results.length > 1
          ? 'Les fichiers ont été fusionnés, nettoyés et traités avec succès.'
          : 'Le fichier a été nettoyé et traité avec succès.',
      finalCsvPath: finalOutputPath,
      data: finalData,
    };
  } catch (error) {
    console.error('Erreur de traitement des fichiers CSV :', error);
    throw new Error('Erreur lors du traitement des fichiers CSV');
  }
}

// Fonction pour supprimer un fichier
async function deleteFile(directory, fileName) {
  const filePath = path.join(directory, fileName);

  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filePath)) {
      reject(new Error('Le fichier n\'existe pas.'));
      return;
    }

    fs.unlink(filePath, (err) => {
      if (err) {
        reject(new Error('Erreur lors de la suppression du fichier.'));
      } else {
        resolve('Fichier supprimé avec succès.');
      }
    });
  });
}

module.exports = {
  processFiles,
  deleteFile,
};
