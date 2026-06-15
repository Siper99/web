const fs = require("fs");
const path = require("path");

const files = [
  "index.html",
  "styles.css",
  "data.jsx",
  "icons.jsx",
  "components.jsx",
  "graph.jsx",
  "reader.jsx",
  "app.jsx"
];

const distDir = path.join(__dirname, "dist");
fs.rmSync(distDir, { recursive: true, force: true });
fs.mkdirSync(distDir, { recursive: true });

for (const file of files) {
  fs.copyFileSync(path.join(__dirname, file), path.join(distDir, file));
}

console.log(`Copied ${files.length} files to dist/`);
