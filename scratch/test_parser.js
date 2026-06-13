const { JSDOM } = require("jsdom");

function latexTextToTiptapHtml(text) {
  if (!text) return "";
  
  if (text.includes('data-type="inline-math"') || text.includes('data-type="block-math"')) {
    return text;
  }

  try {
    const dom = new JSDOM("");
    const parser = new dom.window.DOMParser();
    const hasHtmlTags = /<\/?[a-z][\s\S]*>/i.test(text);
    const parsedText = hasHtmlTags ? text : text.split("\n").map(l => `<p>${l || "<br>"}</p>`).join("");
    
    const doc = parser.parseFromString(parsedText, "text/html");
    const walk = doc.createTreeWalker(doc.body, 4); // 4 is NodeFilter.SHOW_TEXT in JSDOM
    let textNode = walk.nextNode();
    const nodesToReplace = [];
    
    while (textNode) {
      const content = textNode.textContent ?? "";
      if (content.includes("$")) {
        const fragment = doc.createDocumentFragment();
        const parts = content.split(/(\$\$(?:[^$]|\$[^\n$])+\$\$|\$(?:[^$\n])+\$)/g);
        
        parts.forEach((part) => {
          if (/^\$\$(?:[^$]|\$[^\n$])+\$\$$/.test(part)) {
            const latex = part.slice(2, -2);
            const span = doc.createElement("div"); // wait, let's use what's in code or div
            span.setAttribute("data-type", "block-math");
            span.setAttribute("data-latex", latex);
            fragment.appendChild(span);
          } else if (/^\$(?:[^$\n])+\$$/.test(part)) {
            const latex = part.slice(1, -1);
            const span = doc.createElement("span");
            span.setAttribute("data-type", "inline-math");
            span.setAttribute("data-latex", latex);
            fragment.appendChild(span);
          } else if (part) {
            fragment.appendChild(doc.createTextNode(part));
          }
        });
        nodesToReplace.push({ node: textNode, replacement: fragment });
      }
      textNode = walk.nextNode();
    }
    
    nodesToReplace.forEach(({ node, replacement }) => {
      node.parentNode?.replaceChild(replacement, node);
    });
    
    return doc.body.innerHTML;
  } catch (e) {
    console.error("DOMParser parsing failed:", e);
  }
}

const testCases = [
  "Berapakah $x + 2$?",
  "<p>Berapakah $x + 2$?</p>",
  "Berapakah $$x + 2$$?",
  "<p>Berapakah $$x + 2$$?</p>",
  "Sederhanakan $\\frac{x^2 - 1}{x - 1}$",
  "Nilai dari $\\sin(30^\\circ)$ adalah",
];

testCases.forEach((tc) => {
  console.log("INPUT:", tc);
  console.log("OUTPUT:", latexTextToTiptapHtml(tc));
  console.log("--------------------------------");
});
