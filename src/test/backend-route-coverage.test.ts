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
  "../getsmart_api_services_go/internal/routes",
);

const routeDefinitions: RouteDefinition[] = [
  { file: "auth_router.go", basePath: "/auth" },
  { file: "course_enrollment_router.go", basePath: "/course-enrollments" },
  { file: "course_module_router.go", basePath: "/course-modules" },
  { file: "course_router.go", basePath: "/courses" },
  { file: "diagnostic_test_router.go", basePath: "/diagnostic-tests" },
  { file: "notification_router.go", basePath: "/notifications" },
  { file: "subject_router.go", basePath: "/subjects" },
  { file: "forum_router.go", basePath: "/forum" },
  { file: "progress_router.go", basePath: "/progress" },
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
    /r\.(Get|Post|Put|Patch|Delete)\(\s*"([^"]+)"/g;

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
