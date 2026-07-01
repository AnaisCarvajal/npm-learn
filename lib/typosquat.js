const topPackages = require("./top-packages");

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  let prevRow = Array.from({ length: n + 1 }, (_, j) => j);

  for (let i = 1; i <= m; i++) {
    const currRow = [i];
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      currRow[j] = Math.min(currRow[j - 1] + 1, prevRow[j] + 1, prevRow[j - 1] + cost);
    }
    prevRow = currRow;
  }
  return prevRow[n];
}

function checkTyposquatting(packageName) {
  if (topPackages.includes(packageName)) return [];

  return topPackages
    .filter((legit) => legit !== packageName && levenshtein(packageName, legit) === 1)
    .map((legit) => ({ legitPackage: legit }));
}

module.exports = { checkTyposquatting };
