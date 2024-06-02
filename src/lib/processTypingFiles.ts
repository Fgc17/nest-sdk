import path from "path";
import { Project } from "ts-morph";
import { SDKGeneratorConfig, FileMetadata, CachedFilesPatternRecord } from "..";
import { ensureFileWrite } from "../utils/files";
import { trimSlashes } from "../utils/string";
import { getTypingFilesData } from "./getTypingFilesData";

export function processTypingFiles(
  project: Project,
  config: SDKGeneratorConfig
) {
  const typingFiles = project.getSourceFiles(CachedFilesPatternRecord.typing);
  const typingFilesData = getTypingFilesData(typingFiles);

  typingFilesData.forEach((f) => {
    ensureFileWrite(
      path.join(trimSlashes(config.dist), "typing", f.name),
      f.content
    );
  });

  return typingFilesData
    .map(
      (f) =>
        `import { ${f.exports.join(", ")} } from "./typing/${f.name.replace(
          ".ts",
          ""
        )}";`
    )
    .join("\n");
}
