const topics = {
  "que-es-npm": {
    title: "¿Qué es npm?",
    body: [
      "npm (Node Package Manager) es el gestor de paquetes de Node.js: un",
      "repositorio público gigante de código reutilizable, más el programa",
      "de línea de comandos que usas para instalarlo (`npm install`).",
      "",
      "Un 'paquete' es simplemente código escrito por otra persona (una",
      "librería o herramienta) que instalas en tu proyecto en vez de",
      "escribirlo tú desde cero. Ejemplos: react, express, lodash.",
      "",
      "El archivo package.json describe tu proyecto: su nombre, versión,",
      "y sobre todo, qué paquetes necesita para funcionar (dependencies).",
      "",
      "Por qué importa para seguridad: cada paquete que instalas es código",
      "de un tercero corriendo en tu máquina. Confías en quien lo escribió",
      "sin haberlo revisado línea por línea — de ahí nace todo este curso.",
    ],
  },
  "arbol-de-dependencias": {
    title: "Árbol de dependencias",
    body: [
      "Cuando instalas un paquete, no solo obtienes su código: también",
      "obtienes TODO lo que ese paquete necesita para funcionar, y lo que",
      "esas dependencias necesitan, y así sucesivamente. Eso es el árbol",
      "de dependencias.",
      "",
      "Ejemplo: instalas express, pero express depende de otros ~30",
      "paquetes, y esos dependen de más. Tu proyecto puede terminar con",
      "cientos de paquetes de terceros sin que tú hayas elegido la",
      "mayoría directamente.",
      "",
      "Por qué importa: mientras más grande el árbol, más grande la",
      "superficie de ataque. Basta con que UNA dependencia, en cualquier",
      "nivel del árbol (no solo las que tú instalaste a mano), sea",
      "maliciosa o vulnerable para comprometer tu proyecto completo.",
      "",
      "Cómo te proteges: revisa no solo tus dependencias directas, sino",
      "también cuántas dependencias transitivas trae cada una — un",
      "paquete con muy pocas dependencias reduce tu superficie de riesgo.",
    ],
  },
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
