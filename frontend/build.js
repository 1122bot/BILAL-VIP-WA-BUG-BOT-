const fs = require("fs");
const path = require("path");
const { build } = require("esbuild");

const outputDir = path.join(__dirname, "dist");
const apiUrl = (process.env.BACKEND_API_URL || "").trim();

if (apiUrl) {
  const parsedUrl = new URL(apiUrl);
  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error("BACKEND_API_URL must use HTTP or HTTPS.");
  }
}

async function buildFrontend() {
  fs.rmSync(outputDir, { recursive: true, force: true });
  fs.mkdirSync(outputDir, { recursive: true });
  for (const filename of ["index.html", "admin.html", "admin.js", "style.css"]) {
    fs.copyFileSync(path.join(__dirname, filename), path.join(outputDir, filename));
  }
  fs.copyFileSync(
    path.join(__dirname, "node_modules", "flag-icons", "css", "flag-icons.min.css"),
    path.join(outputDir, "flag-icons.css"),
  );
  fs.cpSync(
    path.join(__dirname, "node_modules", "flag-icons", "flags", "4x3"),
    path.join(outputDir, "flags", "4x3"),
    { recursive: true },
  );
  await build({
    entryPoints: [path.join(__dirname, "app.js")],
    outfile: path.join(outputDir, "app.js"),
    bundle: true,
    format: "iife",
    platform: "browser",
    target: ["es2020"],
    minify: true,
  });
  fs.writeFileSync(
    path.join(outputDir, "config.js"),
    `window.BILAL_API_URL = ${JSON.stringify(apiUrl)};\n`
  );
  console.log(`Frontend built to ${outputDir}${apiUrl ? ` for ${apiUrl}` : ""}`);
}

buildFrontend().catch(error => {
  console.error("Frontend build failed:", error);
  process.exitCode = 1;
});
