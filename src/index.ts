import { Project } from "ts-morph";
import { trimSlashes, unquotify } from "./utils/string";
import path from "path";
import { SdkGeneratorCode } from "./code/sdkGenerator.code";
import { glob } from "glob";
import { ensureFileRead, ensureFileWrite } from "./utils/files";
import _ from "lodash";
import { getModifiedFiles } from "./lib/cache";
import { processControllerFiles } from "./lib/processControllerFiles";
import { processTypingFiles } from "./lib/processTypingFiles";

export interface SDKGeneratorConfig {
  apiUrl: string;
  dist: string;
  additionalCode?: string;
  tsconfig?: string;
}

export interface RouteInfo {
  methodName: string;
  url: string;
  httpOperation: string;
  types: {
    body?: string | undefined;
    query?: string | undefined;
    params?: string | undefined;
    response: string | undefined;
  };
}

export type FileType = "controller" | "typing" | "additionalCode";

export interface FileMetadata {
  lastModified: number;
  path;
  name: string;
  type: FileType;
}

export interface FileCache {
  [key: string]: FileMetadata;
}

export const CachedFilesPatternRecord: Record<FileType, string> = {
  typing: `**/{*.enums,*.enum,*.model,*.models,*.entities,*.entity,*.dto,*.dtos}.ts`,
  controller: "**/{*.controller,*.controllers}.ts",
  additionalCode: "**/sdk-additional_code.ts",
};

export function generateSdk(config: SDKGeneratorConfig): void {
  console.time("SDK generation time");

  const projectFilesPaths = glob.sync(Object.values(CachedFilesPatternRecord), {
    ignore: config.dist + "/**",
  });

  const timestampCache = ensureFileRead(
    path.join(trimSlashes(config.dist), "timestamp.json")
  );

  const currentCache = JSON.parse(timestampCache || "{}") as FileCache;

  const modifiedFiles = getModifiedFiles(projectFilesPaths, currentCache);

  if (!modifiedFiles.length) return console.timeEnd("SDK generation time");

  ensureFileWrite(
    path.join(trimSlashes(config.dist), "timestamp.json"),
    JSON.stringify(
      {
        ...currentCache,
        ...modifiedFiles.reduce((acc, file) => {
          acc[file.path] = file;
          return acc;
        }, {} as FileCache),
      },
      null,
      2
    )
  );

  const project = new Project({
    tsConfigFilePath: config.tsconfig ?? "tsconfig.json",
  });

  const modifiedAdditionalCodeFiles = modifiedFiles.filter(
    (file) => file.type === "additionalCode"
  );

  if (modifiedAdditionalCodeFiles.length) {
    const additionalCode = modifiedAdditionalCodeFiles
      .map((file) => ensureFileRead(file.path))
      .join("\n");

    ensureFileWrite(
      path.join(trimSlashes(config.dist), "additional-code.ts"),
      additionalCode
    );
  }

  const modifiedTypingFiles = modifiedFiles.filter(
    (file) => file.type === "typing"
  );

  const modifiedControllerFiles = modifiedFiles.filter(
    (file) => file.type === "controller"
  );

  let allTypesImports;

  if (modifiedTypingFiles.length) {
    allTypesImports = processTypingFiles(project, config);
  } else {
    allTypesImports = ensureFileRead(
      path.join(trimSlashes(config.dist), "allTypesImports.ts")
    );
  }

  const moduleFiles = project.getSourceFiles("**/*module.ts");
  const modulesControllers: { [key: string]: string[] } = moduleFiles.reduce(
    (acc, moduleFile) => {
      const module = moduleFile.getClasses()[0];

      const moduleObject = module
        ?.getDecorator("Module")
        ?.getArguments()[0] as any;

      const controllers = moduleObject
        .getProperty("controllers")
        ?.getText()
        .split("[")[1]
        ?.split("]")[0]
        ?.split(",")
        .flatMap((c) => c.trim())!;

      if (!controllers) return acc;

      const moduleKey = module?.getName()!.toLowerCase().replace("module", "")!;
      return {
        ...acc,
        [moduleKey]: controllers,
      };
    },
    {}
  );

  const { sdkRoutesData, sdkRoutesTypes } = processControllerFiles(
    project,
    modulesControllers
  );

  const sdkRoutesFile = `
    ${allTypesImports}

    export type SdkRoutesTypes = {
      ${Object.entries(sdkRoutesTypes)
        .map(
          ([module, routes]) => `
        ${module}: {
          ${Object.entries(routes)
            .map(
              ([route, types]) => `
            ${route}: {
              ${types.body ? `body?: ${unquotify(types.body)};` : ""}
              ${types.query ? `query?: ${unquotify(types.query)};` : ""}
              ${types.params ? `params?: ${unquotify(types.params)};` : ""}
              response: ${unquotify(types.response)};
            };
          `
            )
            .join("\n")}
        };
      `
        )
        .join("\n")}
    }


    export const SdkRoutesData = {
      ${Object.entries(sdkRoutesData)
        .map(
          ([module, routes]) => `
        ${module}: {
          ${Object.entries(routes)
            .map(
              ([route, { url, httpOperation }]) => `
            ${route}: {
              url: "${url}",
              httpOperation: "${httpOperation}",
            },
          `
            )
            .join("\n")}
        },
      `
        )
        .join("\n")}
    }

    ${SdkGeneratorCode}
  `;

  ensureFileWrite(path.join(config.dist, "index.ts"), sdkRoutesFile);
  ensureFileWrite(
    path.join(trimSlashes(config.dist), "allTypesImports.ts"),
    allTypesImports
  );

  console.timeEnd("SDK generation time");
}
