#!/usr/bin/env node
/**
 * fetch-emotion-models.mjs
 *
 * Menyalin/men-download model weights face-api yang dibutuhkan fitur Emotion
 * Detection ke `public/models/` supaya worker (`public/workers/emotion-worker.js`)
 * bisa `loadFromUri("/models")`.
 *
 * Hanya 2 model yang dipakai fitur ini (lihat EMOTION_DETECTION_FRONTEND.md §5.2):
 *   - TinyFaceDetector  → tiny_face_detector_model-weights_manifest.json + .bin
 *   - FaceExpressionNet → face_expression_model-weights_manifest.json + .bin
 *
 * CATATAN penting soal nama shard:
 *   Spec menulis nama "*-shard1" (itu konvensi face-api LAMA dari justadudewhohacks).
 *   Distribusi @vladmandic/face-api memakai "*_model.bin", dan manifest-nya
 *   mereferensikan ".bin" di field `weightsManifest[].paths`. `loadFromUri`
 *   membaca manifest untuk menemukan shard, jadi nama yang BENAR adalah ".bin".
 *
 * Sumber (berurutan, fallback otomatis):
 *   1. node_modules/@vladmandic/face-api/model  (offline, versi cocok — disarankan)
 *   2. CDN jsDelivr @ versi yang sama
 *
 * Jalankan: pnpm fetch:emotion-models
 */

import { mkdir, copyFile, writeFile, readFile, access } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, "..");
const OUT_DIR = join(PROJECT_ROOT, "public", "models");

// Versi face-api yang ter-install — dipakai untuk pin URL CDN agar weights cocok.
const FACE_API_VERSION = (() => {
  try {
    return require("@vladmandic/face-api/package.json").version;
  } catch {
    return "1.7.15";
  }
})();

const FILES = [
  "tiny_face_detector_model-weights_manifest.json",
  "tiny_face_detector_model.bin",
  "face_expression_model-weights_manifest.json",
  "face_expression_model.bin",
];

const CDN_BASE = `https://cdn.jsdelivr.net/npm/@vladmandic/face-api@${FACE_API_VERSION}/model`;

async function localModelDir() {
  try {
    // Resolusi lewat package.json supaya tahan terhadap layout node_modules.
    const pkgPath = require.resolve("@vladmandic/face-api/package.json");
    const dir = join(dirname(pkgPath), "model");
    await access(join(dir, FILES[0]));
    return dir;
  } catch {
    return null;
  }
}

async function fromLocal(dir, file) {
  await copyFile(join(dir, file), join(OUT_DIR, file));
}

async function fromCdn(file) {
  const url = `${CDN_BASE}/${file}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(join(OUT_DIR, file), buf);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const localDir = await localModelDir();
  const source = localDir ? `node_modules (offline, v${FACE_API_VERSION})` : `CDN (v${FACE_API_VERSION})`;
  console.log(`[emotion-models] sumber: ${source}`);
  console.log(`[emotion-models] target: ${OUT_DIR}`);

  for (const file of FILES) {
    if (localDir) {
      await fromLocal(localDir, file);
    } else {
      await fromCdn(file);
    }
    console.log(`[emotion-models]   ✓ ${file}`);
  }

  // Sanity check: manifest harus mereferensikan shard yang benar-benar kita salin.
  for (const manifest of FILES.filter((f) => f.endsWith(".json"))) {
    const json = JSON.parse(await readFile(join(OUT_DIR, manifest), "utf8"));
    const paths = json.flatMap((g) => g.paths ?? []);
    for (const p of paths) {
      if (!FILES.includes(p)) {
        throw new Error(
          `Manifest ${manifest} mereferensikan shard "${p}" yang tidak ikut tersalin. ` +
            `Periksa daftar FILES.`,
        );
      }
    }
  }

  console.log(`[emotion-models] selesai — ${FILES.length} file siap di /public/models.`);
}

main().catch((err) => {
  console.error("[emotion-models] GAGAL:", err.message);
  process.exit(1);
});
