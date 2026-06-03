/**
 * Tests for PDF text extraction.
 *
 * The extract module requires a real PDF file with actual text content.
 * We use one of the europa-magazin PDFs from the static directory as a
 * fixture — only available in the development environment.
 *
 * Tests that require a real PDF are skipped when the fixture is absent,
 * so CI without the fixture still passes.
 */

import { assertEquals, assertExists } from "jsr:@std/assert@^1";
import { extractPdfText } from "../src/extract.ts";

const FIXTURE_PDF = "/Users/xrs/claude/europa-magazin/static/em/woz.pdf";

async function fixtureExists(): Promise<boolean> {
  try {
    await Deno.stat(FIXTURE_PDF);
    return true;
  } catch {
    return false;
  }
}

// ── Unit tests (no PDF required) ──────────────────────────────────────────────

Deno.test("extractPdfText: throws for missing file", async () => {
  let threw = false;
  try {
    await extractPdfText("/nonexistent/path/to/file.pdf");
  } catch {
    threw = true;
  }
  assertEquals(threw, true);
});

// ── Integration tests (require fixture PDF) ───────────────────────────────────

Deno.test("extractPdfText: returns pageCount, pages, and text", async () => {
  if (!await fixtureExists()) {
    console.log("  [skip] fixture PDF not available");
    return;
  }

  const result = await extractPdfText(FIXTURE_PDF);

  // Basic shape
  assertExists(result.pageCount);
  assertExists(result.pages);
  assertExists(result.text);
  assertEquals(typeof result.pageCount, "number");
  assertEquals(result.pages.length, result.pageCount);
  assertEquals(result.pageCount > 0, true);
});

Deno.test("extractPdfText: text is non-empty for a text PDF", async () => {
  if (!await fixtureExists()) {
    console.log("  [skip] fixture PDF not available");
    return;
  }

  const result = await extractPdfText(FIXTURE_PDF);
  assertEquals(result.text.length > 0, true);
});

Deno.test("extractPdfText: pages array length matches pageCount", async () => {
  if (!await fixtureExists()) {
    console.log("  [skip] fixture PDF not available");
    return;
  }

  const result = await extractPdfText(FIXTURE_PDF);
  assertEquals(result.pages.length, result.pageCount);
});
