import { describe, expect, it } from "vitest";

import {
  latexTextToTiptapHtml,
  tiptapHtmlToLatexHtml,
} from "@/libs/utils";

describe("TKA rich text helpers", () => {
  it("converts inline and block latex to tiptap nodes", () => {
    const html = latexTextToTiptapHtml("Hitung $x^2$ dan $$y = 2$$");
    expect(html).toContain('data-type="inline-math"');
    expect(html).toContain('data-type="block-math"');
    expect(html).toContain('data-latex="x^2"');
  });

  it("wraps plain text in paragraphs", () => {
    expect(latexTextToTiptapHtml("Baris satu\nBaris dua")).toContain("<p>");
  });

  it("strips html in a non-dom runtime", () => {
    expect(tiptapHtmlToLatexHtml("<p>Halo <strong>dunia</strong></p>")).toBe(
      "Halo dunia",
    );
  });
});
