const content1 = "Berapakah $x + 2$?";
const parts1 = content1.split(/(\$\$(?:[^$]|\$[^\n$])+\$\$|\$(?:[^$\n])+\$)/g);
console.log("Parts 1:", parts1);

parts1.forEach((part) => {
  const isBlock = /^\$\$(?:[^$]|\$[^\n$])+\$\$$/.test(part);
  const isInline = /^\$(?:[^$\n])+\$$/.test(part);
  console.log(`Part: "${part}", isBlock: ${isBlock}, isInline: ${isInline}`);
});

const content2 = "Berapakah $x^2 + y^2 = z^2$ atau $a = b$?";
const parts2 = content2.split(/(\$\$(?:[^$]|\$[^\n$])+\$\$|\$(?:[^$\n])+\$)/g);
console.log("Parts 2:", parts2);

parts2.forEach((part) => {
  const isBlock = /^\$\$(?:[^$]|\$[^\n$])+\$\$$/.test(part);
  const isInline = /^\$(?:[^$\n])+\$$/.test(part);
  console.log(`Part: "${part}", isBlock: ${isBlock}, isInline: ${isInline}`);
});
