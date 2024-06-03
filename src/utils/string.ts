/* eslint-disable @typescript-eslint/no-unused-vars */

export function AwaitTypeText(inputString: string) {
  const promiseRegex = /^Promise<(.+)>$/;
  const match = inputString.match(promiseRegex);
  return match ? match[1] : inputString;
}

export function unquotify(str?: string): string {
  console.log(str);
  if (!str) return "";

  return str.replace(/['"`]/g, "");
}

export function trimSlashes(str?: string): string {
  if (!str) return "";

  return str.replace(/^\/|\/$/g, "");
}

export function resolveNodemodules(inputString: string): string {
  const regex = /import\("(.*?)"\)/g;
  return inputString.replace(regex, (match, p1) => {
    const lastNodeModulesIndex = p1.lastIndexOf("node_modules");
    if (lastNodeModulesIndex !== -1) {
      const packagePath = p1.substring(
        lastNodeModulesIndex + "node_modules/".length
      );
      return `import("${packagePath}")`;
    }
    return match;
  });
}

export function resolveTypedObjects(inputString: string): string {
  const importRegex = /import\("(.*?)"\)./g;
  const typedObjectPatterns = [
    /\.dto$/,
    /\.models$/,
    /\.entities$/,
    /\.model$/,
    /\.entity$/,
  ];

  return inputString.replace(importRegex, (match, p1) => {
    if (typedObjectPatterns.some((pattern) => pattern.test(p1))) {
      return "";
    }
    return match;
  });
}

export function generateImportStatement(
  fileContent: string,
  from: string
): string {
  const exportPattern =
    /export (type|class|interface|function|const|var|let)\s+(\w+)/g;
  const matches = fileContent.matchAll(exportPattern);

  const imports = new Set<string>();

  for (const match of matches) {
    if (match[2]) {
      imports.add(match[2]);
    }
  }

  const importStatement = `import { ${[...imports].join(
    ", "
  )} } from "${from}";`;
  return importStatement;
}

export function countOccurrences(str: string, substr: string): number {
  if (substr.length === 0) return 0;

  const regex = new RegExp(substr, "g");
  const matches = str.match(regex);

  return matches ? matches.length : 0;
}
