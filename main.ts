// news-image-20261122 entry program (Node 22, standard library only).
//
// The entry image lives beside this file as entry.png: a one-picture
// summary of the world news of Sunday, 22 November 2026, drawn entirely
// with code-rendered text. This program's only job is to deliver those
// exact bytes to the grader's output path, unchanged, on every run.
//
// Output path resolution:
//   - In the grader's container the writable directory is /output.
//   - For local runs, MAKEFUN_OUTPUT_DIR points at a stand-in directory.
// The copy is a plain byte-for-byte file copy, so two runs always
// produce identical output as long as entry.png itself does not change.

import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const MAX_IMAGE_BYTES = 1_048_576; // the gate's 1 MiB ceiling

function resolveSourcePath(): string {
  // import.meta.url is the reliable anchor: the image sits next to this
  // file in the repository, wherever the repository itself is mounted.
  const here = dirname(fileURLToPath(import.meta.url));
  return join(here, "entry.png");
}

function resolveOutputPath(): string {
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  return join(outDir, "entry.png");
}

function main(): void {
  const source = resolveSourcePath();
  if (!existsSync(source)) {
    throw new Error(`entry image is missing next to main.ts: ${source}`);
  }
  const size = statSync(source).size;
  if (size === 0 || size > MAX_IMAGE_BYTES) {
    throw new Error(`entry image size ${size} is outside the allowed range`);
  }

  const target = resolveOutputPath();
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(source, target);

  // Verify the delivered bytes: the gate reads exactly what landed in
  // the output path, so a short or corrupted copy must fail loudly here
  // rather than surface later as an invalid entry.
  const digest = (path: string): string =>
    createHash("sha256").update(readFileSync(path)).digest("hex");
  if (digest(target) !== digest(source)) {
    throw new Error("copied image does not match the source bytes");
  }
}

main();
