const removeDuplicates = (arr) => {
  const seen = new Set();
  return arr.filter(item => {
    const serializedItem = JSON.stringify(item);
    if (seen.has(serializedItem)) return false;
    seen.add(serializedItem);
    return true;
  });
};

const joinTables = (tablesData, joinType) => {
  if (tablesData.length < 2) {
    throw new Error("Au moins deux tables sont nécessaires pour effectuer une jointure.");
  }

  const getJoinKey = (table) => Object.keys(table[0])[0];

  const performJoin = (baseTable, joinTable, baseKey, joinKey) => {
    switch (joinType.toUpperCase()) {
      case 'LEFT':
        return removeDuplicates(
          baseTable.map(row => {
            const match = joinTable.find(jRow => jRow[joinKey] === row[baseKey]);
            return { ...row, ...match };
          })
        );
      case 'INNER':
        return removeDuplicates(
          baseTable
            .map(row => {
              const match = joinTable.find(jRow => jRow[joinKey] === row[baseKey]);
              return match ? { ...row, ...match } : null;
            })
            .filter(row => row !== null)
        );
      case 'RIGHT':
        return removeDuplicates(
          joinTable.map(jRow => {
            const match = baseTable.find(row => row[baseKey] === jRow[joinKey]);
            return { ...match, ...jRow };
          })
        );
      case 'FULL':
        const leftJoin = baseTable.map(row => {
          const match = joinTable.find(jRow => jRow[joinKey] === row[baseKey]);
          return { ...row, ...match };
        });
        const rightJoin = joinTable
          .filter(jRow => !baseTable.some(row => row[baseKey] === jRow[joinKey]))
          .map(jRow => ({ ...jRow }));
        return removeDuplicates([...leftJoin, ...rightJoin]);
      case 'CROSS':
        return removeDuplicates(
          baseTable.flatMap(row =>
            joinTable.map(jRow => ({ ...row, ...jRow }))
          )
        );
      default:
        throw new Error(`Type de jointure '${joinType}' non supporté.`);
    }
  };

  let result = tablesData[0];
  const baseKey = getJoinKey(result);

  for (let i = 1; i < tablesData.length; i++) {
    const joinKey = getJoinKey(tablesData[i]);
    result = performJoin(result, tablesData[i], baseKey, joinKey);
  }

  return result;
};

// Nettoyage des données (Ex : suppression des valeurs nulles, normalisation)
function cleanData(data) {
  return data.map((row) => {
    const cleanedRow = {};
    for (const key in row) {
      cleanedRow[key] = row[key]?.trim() || 'N/A';
    }
    return cleanedRow;
  });
}

// Filtrage des données
function filterData(data, criteria) {
  return data.filter((row) =>
    Object.keys(criteria).every((key) => String(row[key]).includes(criteria[key]))
  );
}

// Trier les données
function sortData(data, key, order = 'asc') {
  return _.orderBy(data, [key], [order]);
}

// Extraire des colonnes spécifiques
function extractColumns(data, columns) {
  return data.map((row) => _.pick(row, columns));
}

// Calcul des statistiques (Ex : moyenne, somme)
function calculateStats(data, key) {
  const values = data.map((row) => parseFloat(row[key]) || 0);
  const sum = _.sum(values);
  const avg = sum / values.length;
  return { sum, avg };
}

module.exports = {
  cleanData,
  filterData,
  sortData,
  extractColumns,
  calculateStats,
  joinTables,
  removeDuplicates
};



