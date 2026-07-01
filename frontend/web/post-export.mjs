import { copyFileSync, existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "fs";
import { join, posix } from "path";

const distDir = join(process.cwd(), "dist");
const templatePath = join(process.cwd(), "web", "sw-template.js");
const publicAssets = [
  "icon.png",
  "apple-touch-icon.png",
  "favicon.png",
  "pwa-icon-512.png",
];

if (!existsSync(distDir)) {
  console.error("dist/ not found. Run expo export --platform web first.");
  process.exit(1);
}

function walk(dir, base = "") {
  const entries = readdirSync(dir);
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry);
    const rel = posix.join(base, entry);
    if (statSync(full).isDirectory()) {
      files.push(...walk(full, rel));
    } else {
      files.push("/" + rel.replace(/\\/g, "/"));
    }
  }
  return files;
}

const cacheable = walk(distDir).filter((url) =>
  /\.(html|js|css|png|jpg|jpeg|webp|woff2?|ttf|json|ico|svg|webmanifest)$/i.test(url),
);

if (!cacheable.includes("/index.html")) {
  cacheable.unshift("/index.html");
}

const assetsDir = join(process.cwd(), "assets");
for (const asset of publicAssets) {
  const src = join(assetsDir, asset);
  if (!existsSync(src)) {
    console.error(`Missing source asset: assets/${asset}`);
    process.exit(1);
  }
  copyFileSync(src, join(distDir, asset));
  if (!cacheable.includes("/" + asset)) {
    cacheable.push("/" + asset);
  }
}

const manifest = {
  name: "DAWASA Water Quality",
  short_name: "DAWASA",
  description: "Report water quality issues to DAWASA",
  start_url: "/",
  scope: "/",
  display: "standalone",
  orientation: "portrait",
  theme_color: "#007AFF",
  background_color: "#0f172a",
  lang: "en",
  icons: [
    {
      src: "/pwa-icon-512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "any maskable",
    },
    {
      src: "/icon.png",
      sizes: "192x192",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/apple-touch-icon.png",
      sizes: "180x180",
      type: "image/png",
    },
    {
      src: "/favicon.png",
      sizes: "48x48",
      type: "image/png",
    },
  ],
};

const manifestPath = join(distDir, "manifest.webmanifest");
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
if (!cacheable.includes("/manifest.webmanifest")) {
  cacheable.push("/manifest.webmanifest");
}

const cacheVersion = `dawasa-shell-${Date.now()}`;
const template = readFileSync(templatePath, "utf8");
const swSource = template
  .replace("__CACHE_VERSION__", cacheVersion)
  .replace("__PRECACHE_URLS__", JSON.stringify(cacheable));
writeFileSync(join(distDir, "sw.js"), swSource, "utf8");

function injectManifestLink(htmlPath) {
  let html = readFileSync(htmlPath, "utf8");
  if (html.includes('rel="manifest"')) {
    return;
  }
  html = html.replace(
    "<head>",
    '<head><link rel="manifest" href="/manifest.webmanifest" />',
  );
  writeFileSync(htmlPath, html, "utf8");
}

for (const url of cacheable) {
  if (url.endsWith(".html")) {
    injectManifestLink(join(distDir, url.slice(1)));
  }
}

const requiredArtifacts = [
  "manifest.webmanifest",
  "sw.js",
  "icon.png",
  "pwa-icon-512.png",
  "apple-touch-icon.png",
  "favicon.png",
  "index.html",
];

for (const artifact of requiredArtifacts) {
  if (!existsSync(join(distDir, artifact))) {
    console.error(`PWA build validation failed: missing dist/${artifact}`);
    process.exit(1);
  }
}

console.log(`PWA build OK: dist/sw.js with ${cacheable.length} precache entries.`);
