const topics = {
  typosquatting: {
    title: "Typosquatting",
    body: [
      "Un atacante publica un paquete con un nombre casi idéntico a uno",
      "popular, esperando que alguien lo instale por error de tipeo o",
      "por no fijarse bien al copiar un nombre.",
      "",
      'Ejemplo real: "reactt" en vez de "react" — una sola letra de más.',
      "",
      "Por qué funciona: nadie revisa letra por letra un nombre que",
      "reconoce a simple vista. El cerebro completa el patrón esperado.",
      "",
      "Cómo te proteges: copia el nombre desde la página oficial de npm,",
      "nunca lo escribas de memoria. Y usa una herramienta como esta antes",
      "de instalar.",
    ],
  },
  "dependency-confusion": {
    title: "Dependency Confusion",
    body: [
      'Tu empresa tiene un paquete privado interno, ej: "acme-utils".',
      "Un atacante publica un paquete PÚBLICO con ese mismo nombre.",
      "",
      "Si tu configuración de npm no prioriza correctamente el registro",
      "privado, instalas la versión pública del atacante sin darte cuenta",
      "— el nombre es idéntico, no hay typo que detectar.",
      "",
      "Por qué es distinto del typosquatting: aquí el nombre es EXACTO,",
      "el problema es de configuración de registros, no de ortografía.",
      "",
      "Cómo te proteges: usa scopes (@tu-empresa/paquete) y configura",
      "explícitamente qué registro usar para cada scope en .npmrc.",
    ],
  },
  cve: {
    title: "CVE / Vulnerabilidades conocidas",
    body: [
      "CVE = Common Vulnerabilities and Exposures. Es un identificador",
      'público para una falla de seguridad ya documentada, ej: "CVE-2021-23337".',
      "",
      "Cuando un paquete tiene un CVE conocido sin parchear, significa que",
      "la falla es pública — cualquiera puede buscarla y explotarla.",
      "",
      "GHSA es el equivalente de GitHub (GitHub Security Advisory), y",
      "OSV.dev agrega ambos en una sola base de datos consultable.",
      "",
      "Cómo te proteges: revisa la versión instalada contra la versión",
      "donde se corrigió el CVE, y actualiza.",
    ],
  },
  "supply-chain": {
    title: "Supply Chain Attack (panorama general)",
    body: [
      "Un ataque a la cadena de suministro no ataca tu código directamente:",
      "ataca una dependencia que tu código usa, para llegar a ti indirectamente.",
      "",
      "npm-learn cubre 2 de los vectores más comunes de este tipo de ataque:",
      "  - typosquatting        → ejecuta: npm-learn learn typosquatting",
      "  - CVEs conocidos       → ejecuta: npm-learn learn cve",
      "",
      "Y documenta (sin cubrir aún) otros 2:",
      "  - dependency confusion → ejecuta: npm-learn learn dependency-confusion",
      "  - señales sociotécnicas (quién mantiene el paquete, hace cuánto)",
    ],
  },
};

function listTopics() {
  return Object.keys(topics);
}

function getTopic(key) {
  return topics[key] || null;
}

module.exports = { listTopics, getTopic };
