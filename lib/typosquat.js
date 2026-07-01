const topPackages = require("./top-packages");

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }

      // Transposición de 2 caracteres adyacentes cuenta como 1 solo cambio
      // (ej: "loadsh" vs "lodash"), no 2 como en Levenshtein estándar.
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        dp[i][j] = Math.min(dp[i][j], dp[i - 2][j - 2] + 1);
      }
    }
  }
  return dp[m][n];
}

function checkTyposquatting(packageName) {
  // Un paquete ya popular no puede ser "perpetrador" de typosquatting —
  // solo paquetes poco conocidos son sospechosos de suplantar a uno popular
  // (Taylor et al., SpellBound, 2020).
  if (topPackages.includes(packageName)) return [];

  const matches = [];

  for (const legit of topPackages) {
    if (legit === packageName) continue;

    const distance = levenshtein(packageName, legit);

    if (distance === 1) {
      matches.push({ legitPackage: legit });
    }
  }

  return matches;
}

module.exports = { checkTyposquatting };
