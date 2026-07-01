const questions = [
  {
    question: "¿Qué es el typosquatting?",
    options: [
      { name: "Un paquete con un nombre casi idéntico a uno popular", correct: true },
      { name: "Un ataque que roba contraseñas por phishing", correct: false },
      { name: "Una vulnerabilidad de red conocida (CVE)", correct: false },
    ],
  },
  {
    question: "¿Qué es un CVE?",
    options: [
      { name: "Un identificador público de una vulnerabilidad documentada", correct: true },
      { name: "Un paquete de npm certificado como seguro", correct: false },
      { name: "Una herramienta de sandboxing", correct: false },
    ],
  },
  {
    question: "¿Qué diferencia al dependency confusion del typosquatting?",
    options: [
      { name: "El nombre es exactamente igual; el problema es de configuración de registro", correct: true },
      { name: "En dependency confusion el nombre siempre tiene un error de tipeo", correct: false },
      { name: "No hay diferencia, son sinónimos", correct: false },
    ],
  },
  {
    question: "¿Cuál es una señal de que un paquete podría ser malicioso?",
    options: [
      { name: "Ejecuta scripts automáticos (postinstall) al instalarse", correct: true },
      { name: "Tiene muchas descargas semanales", correct: false },
      { name: "Está escrito en TypeScript", correct: false },
    ],
  },
  {
    question: "¿Para qué sirve un sandbox al evaluar un paquete?",
    options: [
      { name: "Para observar su comportamiento en un entorno aislado antes de confiar en él", correct: true },
      { name: "Para acelerar la instalación del paquete", correct: false },
      { name: "Para publicar el paquete en el registro de npm", correct: false },
    ],
  },
];

module.exports = { questions };
