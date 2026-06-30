# npm-learn

Scanner CLI de seguridad pre-instalación para paquetes npm. Detecta vectores de riesgo en el momento previo a `npm install`, antes de que el código se ejecute en el equipo del desarrollador.

Proyecto Final — Desarrollo Profesional 1 (C1335), 2026-1.
Autora: Anaís Polett Rodríguez Carvajal.

## Motivación

Según Sonatype (2026), los ataques a la cadena de suministro de software han crecido un 40% desde 2023 [2]. La mayoría de desarrolladores instala dependencias npm sin evaluación previa de riesgo, exponiendo su empleabilidad y generando responsabilidad legal.

Esta herramienta nace de una revisión sistemática de literatura (41 estudios primarios, 2022–2026) que identificó una brecha: de las herramientas que operan en fase **pre-instalación**, ninguna cubre de forma integrada typosquatting y dependency confusion — vectores de identidad (¿es este el paquete correcto?) — junto con CVEs conocidos.

## Instalación

```bash
git clone <url-del-repositorio>
cd npm-learn
npm install
npm link
```

## Uso

```bash
npm-learn <nombre-del-paquete>
npm-learn <nombre-del-paquete>@<version>
```

Ejemplo:

```bash
npm-learn reactt
npm-learn lodash@4.17.20
```

## Qué detecta (MVP actual)

| # | Vector de riesgo | Método | Fuente de datos |
|---|---|---|---|
| 1 | Typosquatting | Distancia de Levenshtein contra ~95 paquetes de alta popularidad | Local |
| 2 | CVEs / advisories conocidos | Consulta en vivo | OSV.dev (incluye GitHub Security Advisories) |

## Qué NO cubre (limitaciones declaradas)

| # | Vector de riesgo | Motivo |
|---|---|---|
| 3 | Dependency confusion | Requiere verificación cross-registro (privado vs. público); fuera de alcance del MVP |
| 4 | Señales sociotécnicas (mantenedores, actividad, reputación) | Requiere modelo multivariable tipo Weak Links (W1–W6); fuera de alcance del MVP |

Estas dos limitaciones son intencionales y se presentan como trabajo futuro, no como omisiones no advertidas.

## Arquitectura

```
bin/npm-learn.js       — CLI y orquestación de las dos detecciones
lib/typosquat.js       — Levenshtein + heurística de umbral por longitud de nombre
lib/registry-client.js — Cliente HTTP para registry.npmjs.org y api.osv.dev
lib/top-packages.js    — Corpus de paquetes de referencia
```

## Herramientas y fuentes utilizadas

- Node.js (entorno de ejecución) — Node.js Foundation.
- npm registry API — `registry.npmjs.org`, npm, Inc.
- OSV.dev — Open Source Vulnerabilities, Google.
- chalk — formato de salida en terminal, npm, Inc.
- Claude (Anthropic) — asistencia en desarrollo de código durante el curso.

## Referencias (IEEE)

[1] B. Pinckney, B. Mathis, and W. Visser, "Flexible and Optimal Dependency Management via Max-SMT," in *Proc. 2023 IEEE/ACM 45th Int. Conf. Software Engineering (ICSE)*, 2023, pp. 1410–1422, doi: 10.1109/icse48619.2023.00124.

[2] Sonatype, *State of the Software Supply Chain 2026*, Sonatype, Inc., 2026.

[3] M. Ohm, H. Plate, A. Sykosch, and M. Meier, "Backstabber's Knife Collection: A Review of Open Source Software Supply Chain Attacks," in *Proc. Int. Conf. Detection of Intrusions and Malware, and Vulnerability Assessment (DIMVA)*, 2020, pp. 23–43.

[4] Google, "OSV.dev — Open Source Vulnerabilities," [Online]. Available: https://osv.dev.

[5] npm, Inc., "npm Registry API Documentation," [Online]. Available: https://docs.npmjs.com/.
