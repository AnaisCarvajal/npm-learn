#!/usr/bin/env node
"use strict";

const chalk = require("chalk");
const inquirer = require("inquirer");
inquirer.registerPrompt("list", require("../lib/green-list"));
const { checkTyposquatting } = require("../lib/typosquat");
const { fetchPackageMetadata, checkKnownVulnerabilities } = require("../lib/registry-client");
const { listTopics, getTopic } = require("../lib/learn-content");
const { questions } = require("../lib/quiz");

process.on("SIGINT", () => process.exit(0));

const ASCII_ART = `
 ⠀⠀⠀⠀⠀⠀⠀⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⣠⣆⡐⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢌⣀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⢆⣹⣐⢯⠀⠀⠀⠀⠀⠀⠀⢀⡀⠀⠀⠀⠀⠀⠰⢀⣼⣿⣶⣶⣤⣄⡀⠀⠀
⠀⢀⠀⠀⣼⣿⣞⣫⠀⠀⠀⠀⠀⠀⠀⠀⠠⢗⡶⣦⣀⡀⣠⣿⣯⡷⣟⣾⣯⡿⣿⡇⠀
⠴⣱⢾⣼⣽⣿⢛⠅⣀⠀⠀⣀⠀⠀⠀⠀⠀⠀⢈⡛⣽⣟⣿⣰⣯⣷⡿⢉⢱⢻⠜⠁⠀
⠀⠀⢨⣟⣿⣽⣿⡛⠖⠟⡜⠁⠀⠀⠀⠀⠀⢀⡎⡟⠗⢟⣞⡳⣽⢲⡣⢛⠉⢇⠀⠀⠀
⠀⠀⠀⣬⣿⡷⣯⢿⣻⣶⣄⡀⠀⠀⠀⠀⠈⠈⠀⠐⠀⢺⠩⠸⢳⠙⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠙⠻⢿⣽⣿⢯⣷⣻⢿⡄⠀⠀⠀⠀⠀⠀⠀⠃⠙⠈⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠳⠴⠏⡙⠛⠿⡝⠛⠁⠀⠀npm-learn ⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠠⢀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢒⣼⣿⣷⣶⣶⣤⣌⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠸⠶⣶⢦⣤⣀⣤⣠⢯⣿⢿⡿⣿⢯⡿⣿⣿⣧⡄⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠄⠀⢻⣺⣽⢿⣯⣟⣯⢯⡙⠏⡙⢡⣭⣹⡚⢣⠀⠀⠀⠀⠀⠀⠀⡀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⣔⣾⡟⣿⡞⣱⡏⡶⠙⡷⠊⠉⠀⠈⠀⠀⠀⠀⠀⠀⠀⠀⢰⡇
⠀⠀⠀⠀⠀⠀⠀⠀⡠⠞⣵⠋⡋⠀⠑⠉⠐⠐⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⡇
⠀⠀⠀⠀⠀⠀⠂⠁⠈⠆⠀⠁⠁⠀⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠸⠇
`
;

function header() {
  console.clear();
  console.log(chalk.green(ASCII_ART));
}

async function menu(message, choices) {
  const { value } = await inquirer.prompt([{
    type: "list", name: "value", message, choices, loop: false, pageSize: 20,
  }]);
  return value;
}

async function promptPackageName(message) {
  const { packageName } = await inquirer.prompt([{
    type: "input",
    name: "packageName",
    message,
    validate: (v) => v.trim().length > 0 || "Escribe el nombre de un paquete.",
  }]);
  return packageName.trim();
}

async function runScan(rawInput) {
  // Reportes de seguridad (OSV.dev, Socket.dev, etc.) listan paquetes como
  // "npm/nombre-paquete" — ese prefijo de ecosistema no es parte del nombre real.
  const packageName = rawInput.replace(/^npm\//i, "");

  const [name, version] =
    packageName.includes("@") && !packageName.startsWith("@")
      ? packageName.split("@")
      : [packageName, null];

  const typoMatches = checkTyposquatting(name);

  let resolvedVersion = version;
  let vulns = [];
  let packageExists = true;
  let wasTakenDown = false;

  try {
    if (!resolvedVersion) {
      const meta = await fetchPackageMetadata(name);
      packageExists = !!meta;
      if (meta) {
        resolvedVersion = meta["dist-tags"]?.latest;
        // Un paquete con metadata pero sin dist-tags fue retirado (unpublished) —
        // a menudo porque el equipo de seguridad de npm lo bajó por malicioso.
        wasTakenDown = !resolvedVersion && !!(meta.time && meta.time.unpublished);
      }
    }
    if (resolvedVersion) vulns = await checkKnownVulnerabilities(name, resolvedVersion);
  } catch (err) {
    console.log(chalk.dim(`No se pudo completar la consulta en línea: ${err.message}`));
  }

  console.log();
  console.log(chalk.green.bold("Typosquatting:"));
  if (typoMatches.length === 0) {
    console.log(chalk.green("  Sin coincidencias sospechosas."));
  } else {
    for (const m of typoMatches) {
      console.log(chalk.red(`  Se parece a "${m.legitPackage}" — posible typosquatting.`));
    }
  }

  console.log();
  console.log(chalk.green.bold("CVE / Vulnerabilidades conocidas:"));
  if (wasTakenDown) {
    console.log(chalk.red("  ⚠ Este paquete fue retirado de npm (unpublished)."));
    console.log(chalk.red("    Suele ser señal de que el equipo de seguridad de npm lo bajó por malicioso."));
  } else if (!packageExists) {
    console.log(chalk.yellow("  El paquete no existe en npm."));
  } else if (vulns.length === 0) {
    console.log(chalk.green("  Sin vulnerabilidades conocidas."));
  } else {
    for (const v of vulns) {
      console.log(chalk.red(`  ${v.id}${v.summary ? " — " + v.summary : ""}`));
    }
  }

  console.log();
  const hayRiesgo = typoMatches.length > 0 || vulns.length > 0 || wasTakenDown;
  const verdict = hayRiesgo ? chalk.bold.red("RIESGO") : chalk.bold.green("SIN HALLAZGOS");
  console.log(`Veredicto: ${verdict}`);
  console.log();
}

async function scanFlow() {
  while (true) {
    header();
    const packageName = await promptPackageName("Nombre del paquete:");
    await runScan(packageName);

    const next = await menu("¿Qué quieres hacer?", [
      { name: "Escanear otro paquete", value: "scan" },
      { name: "Menú principal", value: "main" },
      { name: "Salir", value: "exit" },
    ]);

    if (next === "exit") process.exit(0);
    if (next === "main") return;
  }
}

async function learnFlow() {
  while (true) {
    header();

    const key = await menu("Elige un tema:", [
      ...listTopics().map((k) => ({ name: getTopic(k).title, value: k })),
      new inquirer.Separator(),
      { name: "Volver", value: "__back__" },
    ]);

    if (key === "__back__") return;

    const topic = getTopic(key);
    header();
    console.log(chalk.green.bold(topic.title));
    console.log();
    for (const line of topic.body) console.log(line);
    console.log();

    const next = await menu("¿Qué quieres hacer?", [
      { name: "Volver a temas", value: "topics" },
      { name: "Menú principal", value: "main" },
      { name: "Salir", value: "exit" },
    ]);

    if (next === "exit") process.exit(0);
    if (next === "main") return;
  }
}

async function quizFlow() {
  header();
  let score = 0;

  for (const q of questions) {
    const correct = await menu(q.question, q.options.map((o) => ({ name: o.name, value: o.correct })));
    console.log();
    if (correct) {
      score++;
      console.log(chalk.green("Correcto."));
    } else {
      const correctAnswer = q.options.find((o) => o.correct).name;
      console.log(chalk.red(`Incorrecto. Respuesta correcta: ${correctAnswer}`));
    }
    console.log();
  }

  console.log(chalk.green.bold(`Puntaje final: ${score}/${questions.length}`));
  console.log();
  const next = await menu("¿Qué quieres hacer?", [
    { name: "Menú principal", value: "main" },
    { name: "Salir", value: "exit" },
  ]);
  if (next === "exit") process.exit(0);
}

async function interactiveMode() {
  while (true) {
    header();

    const action = await menu("¿Qué quieres hacer?", [
      new inquirer.Separator("── Testear ──"),
      { name: "Escanear un paquete", value: "scan" },
      new inquirer.Separator("── Aprender ──"),
      { name: "Aprender sobre vectores de riesgo", value: "learn" },
      new inquirer.Separator("── Practicar ──"),
      { name: "Examen", value: "quiz" },
      new inquirer.Separator(),
      { name: "Salir", value: "exit" },
    ]);

    if (action === "exit") process.exit(0);
    if (action === "scan") await scanFlow();
    if (action === "learn") await learnFlow();
    if (action === "quiz") await quizFlow();
  }
}

interactiveMode();
