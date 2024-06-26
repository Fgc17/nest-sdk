import GlobToRegExp from "glob-to-regexp";
import { SourceFile, SyntaxKind } from "ts-morph";
import { CachedFilesPatternRecord } from "..";
import { countOccurrences } from "../utils/string";

export function getTypingFilesData(typingFiles: SourceFile[]) {
  return typingFiles.map((f) => {
    f.getDescendantsOfKind(SyntaxKind.Decorator).forEach((decorator) => {
      decorator.remove();
    });

    let additionalCodeImports: string[] = [];

    const fileText = f.getFullText();

    f.getImportDeclarations().forEach((importDeclaration) => {
      const importPath = importDeclaration.getModuleSpecifierValue();

      const isTypingImport = GlobToRegExp(
        CachedFilesPatternRecord.typing.replace(".ts", ""),
        {
          extended: true,
        }
      ).test(importPath);

      if (isTypingImport) {
        importDeclaration.setModuleSpecifier(
          "./" + importPath.split("/").pop()!.replace(".ts", "")
        );
        return;
      }

      additionalCodeImports.push(
        ...importDeclaration
          .getNamedImports()
          .map((i) => {
            const importName = i.getName();

            if (countOccurrences(fileText, importName) === 1) return "";

            return importName;
          })
          .filter(Boolean)
      );

      importDeclaration.remove();
    });

    if (additionalCodeImports.length) {
      f.addImportDeclaration({
        moduleSpecifier: "../additional-code",
        namedImports: additionalCodeImports,
      });
    }

    let content = f.getText();

    return {
      content,
      exports: f.getExportSymbols().map((s) => s.getName()),
      name: f.getBaseName(),
    };
  });
}
