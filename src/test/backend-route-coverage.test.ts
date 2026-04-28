import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { integratedEndpoints } from "./integrated-endpoints";

type RouteDefinition = {
  file: string;
  basePath: string;
};

const backendRoutesDir = path.resolve(
  process.cwd(),
  "../getsmart_api_services/src/routes",
);

const routeDefinitions: RouteDefinition[] = [
  { file: "AuthRouter.ts", basePath: "/auth" },
  { file: "CourseEnrollmentRouter.ts", basePath: "/course-enrollments" },
  { file: "CourseModuleRouter.ts", basePath: "/course-modules" },
  { file: "CourseRouter.ts", basePath: "/courses" },
  { file: "DiagnosticTestRouter.ts", basePath: "/diagnostic-tests" },
  { file: "NotificationRouter.ts", basePath: "/notifications" },
  { file: "SubjectRouter.ts", basePath: "/subjects" },
];

function normalizePath(basePath: string, routePath: string) {
  if (routePath === "/") {
    return basePath;
  }

  return `${basePath}${routePath}`;
}

function extractMethodPathPairs(file: string, basePath: string) {
  const source = readFileSync(path.join(backendRoutesDir, file), "utf8")
    .split("\n")
    .filter((line) => !line.trim().startsWith("//"))
    .join("\n");

  const routePattern =
    /this\.\w+\.(get|post|put|patch|delete)\(\s*"([^"]+)"/g;

  return Array.from(source.matchAll(routePattern), ([, method, routePath]) => ({
    method: method.toUpperCase(),
    path: normalizePath(basePath, routePath),
  }));
}

describe("backend route coverage", () => {
  it("lists every active backend route in the frontend integration catalog", () => {
    const frontendPairs = new Set(
      integratedEndpoints.map(({ method, path }) => `${method} ${path}`),
    );

    const backendPairs = [
      "GET /",
      ...routeDefinitions.flatMap(({ file, basePath }) =>
        extractMethodPathPairs(file, basePath).map(
          ({ method, path }) => `${method} ${path}`,
        ),
      ),
    ];

    const missingPairs = backendPairs.filter((pair) => !frontendPairs.has(pair));

    expect(missingPairs).toEqual([]);
  });
});
