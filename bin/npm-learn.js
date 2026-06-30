#!/usr/bin/env node
"use strict";

const chalk = require("chalk");
const inquirer = require("inquirer");
inquirer.registerPrompt("list", require("../lib/green-list"));
const { checkTyposquatting } = require("../lib/typosquat");
const { fetchPackageMetadata, checkKnownVulnerabilities } = require("../lib/registry-client");
const { listTopics, getTopic } = require("../lib/learn-content");

process.on("SIGINT", () => { process.exit(0); });

function header(title) {
  console.log();
  console.log(chalk.green.bold(`  ${title}`));
  console.log(chalk.dim("  " + "─".repeat(50)));
}

async function menu(message, choices) {
  const { value } = await inquirer.prompt([{
    type: "list", name: "value", message, prefix: "  ", choices,
  }]);
  return value;
}

function createSpinner(text) {
  const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  let i = 0;
  const id = setInterval(() => {
    process.stdout.write(`\r  ${chalk.green(frames[i % frames.length])} ${chalk.dim(text)}`);
    i++;
  }, 80);
  return {
    succeed(msg) {
      clearInterval(id);
      process.stdout.write(`\r  ${chalk.green("✓")} ${msg}\n`);
    },
    stop() {
      clearInterval(id);
      process.stdout.write(`\r${" ".repeat(text.length + 8)}\r`);
    },
  };
}

function printWelcome() {
  console.clear();
  console.log();
  console.log(chalk.green([
" ⠀⠀⠀⠀⠀⠀⠀⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠀⠀⠀⠀⠀⠀⠀",
"⠀⠀⠀⠀⠀⣠⣆⡐⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢌⣀⠀⠀⠀⠀⠀⠀⠀",
"⠀⠀⠀⠀⢆⣹⣐⢯⠀⠀⠀⠀⠀⠀⠀⢀⡀⠀⠀⠀⠀⠀⠰⢀⣼⣿⣶⣶⣤⣄⡀⠀⠀",
"⠀⢀⠀⠀⣼⣿⣞⣫⠀⠀⠀⠀⠀⠀⠀⠀⠠⢗⡶⣦⣀⡀⣠⣿⣯⡷⣟⣾⣯⡿⣿⡇⠀",
"⠴⣱⢾⣼⣽⣿⢛⠅⣀⠀⠀⣀⠀⠀⠀⠀⠀⠀⢈⡛⣽⣟⣿⣰⣯⣷⡿⢉⢱⢻⠜⠁⠀",
"⠀⠀⢨⣟⣿⣽⣿⡛⠖⠟⡜⠁⠀⠀⠀⠀⠀⢀⡎⡟⠗⢟⣞⡳⣽⢲⡣⢛⠉⢇⠀⠀⠀",
"⠀⠀⠀⣬⣿⡷⣯⢿⣻⣶⣄⡀⠀⠀⠀⠀⠈⠈⠀⠐⠀⢺⠩⠸⢳⠙⠀⠀⠀⠀⠀⠀⠀",
"⠀⠀⠀⠙⠻⢿⣽⣿⢯⣷⣻⢿⡄⠀⠀⠀⠀⠀⠀⠀⠃⠙⠈⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
"⠀⠀⠀⠀⠳⠴⠏⡙⠛⠿⡝⠛⠁⠀⠀npm-learn ⠀⠀⠀⠀⠀⠀⠀⠀⠀",
"      seguridad pre-instalación      ",
"⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠠⢀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
"⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢒⣼⣿⣷⣶⣶⣤⣌⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
"⠀⠀⠀⠀⠀⠀⠸⠶⣶⢦⣤⣀⣤⣠⢯⣿⢿⡿⣿⢯⡿⣿⣿⣧⡄⠀⠀⠀⠀⠀⠀⠀⠀",
"⠀⠀⠀⠀⠀⠀⠀⠄⠀⢻⣺⣽⢿⣯⣟⣯⢯⡙⠏⡙⢡⣭⣹⡚⢣⠀⠀⠀⠀⠀⠀⠀ ",
"⠀⠀⠀⠀⠀⠀⠀⠀⠀⣔⣾⡟⣿⡞⣱⡏⡶⠙⡷⠊⠉⠀⠈⠀⠀⠀⠀⠀⠀⠀⠀  ",
"⠀⠀⠀⠀⠀⠀⠀⠀⡠⠞⣵⠋⡋⠀⠑⠉⠐⠐⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀  ",
"⠀⠀⠀⠀⠀⠀⠂⠁⠈⠆⠀⠁⠁⠀⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀   ",
  ].join("\n")));
  console.log();
  console.log(chalk.dim("  ─────────────────────────────────────"));
  console.log(chalk.dim("   navegar [flechas] · salir [Ctrl+C]"));
  console.log(chalk.dim("  ─────────────────────────────────────"));
  console.log();
}

function highlightDiff(query, target) {
  const maxLen = Math.max(query.length, target.length);
  let out = "";
  for (let i = 0; i < maxLen; i++) {
    const q = query[i] || "";
    const t = target[i] || "";
    out += q === t ? chalk.dim(q) : chalk.bgRed.white(q);
  }
  return out;
}

async function runScan(packageName) {
  const [name, version] =
    packageName.includes("@") && !packageName.startsWith("@")
      ? packageName.split("@")
      : [packageName, null];

  const spinner = createSpinner(`Analizando ${name}...`);
  const typoMatches = checkTyposquatting(name);
  let resolvedVersion = version;
  let vulns = [];
  let packageExists = true;

  try {
    if (!resolvedVersion) {
      const meta = await fetchPackageMetadata(name);
      packageExists = !!meta;
      if (meta) resolvedVersion = meta["dist-tags"]?.latest;
    }
    if (resolvedVersion) vulns = await checkKnownVulnerabilities(name, resolvedVersion);
  } catch (err) {
    spinner.stop();
    console.log(chalk.dim(`\n  (sin conexión: ${err.message})`));
  }

  spinner.succeed(`${chalk.white(name)}  analizado`);

  console.log();
  console.log(chalk.bold("  [1] Typosquatting") + chalk.dim("  ¿el nombre es lo que crees?"));
  if (typoMatches.length === 0) {
    console.log(chalk.green("\n      ✓ Sin coincidencias sospechosas."));
  } else {
    for (const m of typoMatches.slice(0, 3)) {
      const c = m.riskLevel === "ALTO" ? chalk.red : chalk.yellow;
      console.log();
      console.log(c(`      ⚠  riesgo ${m.riskLevel} — se parece a "${m.legitPackage}"`));
      console.log(`        ${highlightDiff(name, m.legitPackage)}` +
        chalk.dim(`  (${m.distance} carácter${m.distance > 1 ? "es" : ""})`));
    }
  }

  console.log();
  console.log(chalk.bold("  [2] CVE / Vulnerabilidades conocidas") + chalk.dim("  vía OSV.dev"));
  if (!packageExists) {
    console.log(chalk.yellow("\n      ⚠  El paquete no existe en npm."));
  } else if (!vulns || vulns.length === 0) {
    console.log(chalk.green("\n      ✓ Sin vulnerabilidades conocidas."));
  } else {
    for (const v of vulns.slice(0, 5)) {
      console.log();
      console.log(chalk.red(`      ⚠  ${v.id}`));
      if (v.summary) console.log(chalk.dim(`         ${v.summary}`));
    }
    console.log(chalk.dim("\n      → actualizar a la versión más reciente suele corregir esto."));
  }

  console.log();
  console.log(chalk.bold("  [3] Dependency confusion") + chalk.dim("  · no cubierto en este MVP"));
  console.log(chalk.bold("  [4] Señales sociotécnicas") + chalk.dim("  · no cubierto en este MVP"));

  const hasHighTypo = typoMatches.some((m) => m.riskLevel === "ALTO");
  const hasVulns = Array.isArray(vulns) && vulns.length > 0;
  let verdict;
  if (hasHighTypo) {
    verdict = { label: "RIESGO ALTO",   color: chalk.bold.red    };
  } else if (hasVulns || typoMatches.length > 0) {
    verdict = { label: "RIESGO MEDIO",  color: chalk.bold.yellow };
  } else {
    verdict = { label: "SIN HALLAZGOS", color: chalk.bold.green  };
  }

  console.log();
  console.log(chalk.dim("  " + "─".repeat(50)));
  console.log(`  Veredicto: ${verdict.color(verdict.label)}`);
  console.log();
}

const TOPIC_LABELS = {
  "typosquatting":        "Typosquatting — nombres casi idénticos",
  "dependency-confusion": "Dependency Confusion — mismo nombre, otro registro",
  "cve":                  "CVE / Vulnerabilidades conocidas",
  "supply-chain":         "Supply Chain Attack — panorama general",
};

async function learnFlow() {
  while (true) {
    console.clear();
    header("npm-learn learn  ·  temas disponibles");
    console.log();

    const key = await menu("¿Qué tema quieres explorar?", [
      ...listTopics().map((k) => ({ name: "  " + (TOPIC_LABELS[k] || k), value: k })),
      new inquirer.Separator(),
      { name: "  ← Volver al menú principal", value: "__back__" },
    ]);

    if (key === "__back__") return;

    const topic = getTopic(key);
    console.clear();
    header(topic.title);
    console.log();
    for (const line of topic.body) {
      console.log(line ? `  ${chalk.white(line)}` : "");
    }
    console.log();

    const next = await menu("¿Qué quieres hacer ahora?", [
      { name: "  Volver a temas",  value: "topics" },
      { name: "  Menú principal",  value: "main"   },
      { name: "  Salir",           value: "exit"   },
    ]);

    if (next === "exit") process.exit(0);
    if (next === "main") return;
  }
}

async function scanFlow() {
  while (true) {
    console.clear();
    header("npm-learn  ·  escanear paquete");
    console.log(chalk.dim("\n  Ejemplos: reactt  ·  lodash  ·  express@4.18.2\n"));

    const { packageName } = await inquirer.prompt([{
      type: "input",
      name: "packageName",
      message: "Nombre del paquete:",
      prefix: "  ",
      validate: (v) => v.trim().length > 0 || "Escribe el nombre de un paquete.",
    }]);

    await runScan(packageName.trim());

    const next = await menu("¿Qué quieres hacer ahora?", [
      { name: "  Escanear otro paquete",         value: "scan"  },
      { name: "  Aprender sobre estos vectores", value: "learn" },
      { name: "  Menú principal",                value: "main"  },
      { name: "  Salir",                         value: "exit"  },
    ]);

    if (next === "exit")  process.exit(0);
    if (next === "learn") { await learnFlow(); return; }
    if (next === "main")  return;
  }
}

async function interactiveMode() {
  while (true) {
    printWelcome();

    const action = await menu("¿Qué quieres hacer?", [
      { name: "  Escanear un paquete",               value: "scan"  },
      { name: "  Aprender sobre vectores de riesgo",  value: "learn" },
      new inquirer.Separator(),
      { name: "  Salir",                              value: "exit"  },
    ]);

    if (action === "exit")  process.exit(0);
    if (action === "scan")  await scanFlow();
    if (action === "learn") await learnFlow();
  }
}

async function directMode([command, arg]) {
  if (command === "learn") {
    if (!arg) {
      header("npm-learn learn  ·  temas disponibles");
      for (const key of listTopics()) console.log(`    ${chalk.green(key)}`);
      console.log(chalk.dim("\n  Uso: npm-learn learn <tema>\n"));
      return;
    }
    const topic = getTopic(arg);
    if (!topic) {
      console.log(chalk.red(`\n  No existe el tema "${arg}".`));
      console.log(chalk.dim(`  Temas disponibles: ${listTopics().join(", ")}\n`));
      return;
    }
    header(topic.title);
    console.log();
    for (const line of topic.body) console.log(`  ${line}`);
    console.log();
    return;
  }

  header(`npm-learn  ·  ${command}`);
  await runScan(command);
  console.log(chalk.dim("  ¿Quieres entender estos vectores? npm-learn learn\n"));
}

async function main() {
  const args = process.argv.slice(2);
  try {
    await (args.length === 0 ? interactiveMode() : directMode(args));
  } catch (err) {
    if (err.isTtyError) {
      console.error(chalk.red("\n  Error: no hay terminal interactivo."));
      console.error(chalk.dim("  Uso directo: npm-learn <paquete>  |  npm-learn learn\n"));
      process.exit(1);
    }
    if (err.message?.includes("User force closed") || err.message?.includes("readline")) {
      process.exit(0);
    }
    throw err;
  }
}

main();
