const https = require("https");

function httpGetJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "npm-learn-cli" } }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode === 404) return resolve(null);
        if (res.statusCode >= 400) return reject(new Error(`HTTP ${res.statusCode} al consultar ${url}`));
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on("error", reject);
  });
}

function httpPostJson(url, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const urlObj = new URL(url);
    const req = https.request(
      {
        hostname: urlObj.hostname,
        path: urlObj.pathname,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
        });
      }
    );
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

async function fetchPackageMetadata(packageName) {
  return httpGetJson(`https://registry.npmjs.org/${encodeURIComponent(packageName)}`);
}

async function checkKnownVulnerabilities(packageName, version) {
  const result = await httpPostJson("https://api.osv.dev/v1/query", {
    package: { name: packageName, ecosystem: "npm" },
    version,
  });
  return (result && result.vulns) || [];
}

module.exports = { fetchPackageMetadata, checkKnownVulnerabilities };
