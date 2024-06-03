import fs from "fs";
import path from "path";
import { glob } from "glob";
import GlobToRegExp from "glob-to-regexp";
import { CachedFilesPatternRecord } from "..";

export type FileType = "controller" | "typing" | "additionalCode";

export interface FileMetadata {
  lastModified: number;
  path: string;
  name: string;
  type: FileType;
}

export interface FileCache {
  [key: string]: FileMetadata;
}

export function getModifiedFiles(
  projectFilesPaths: string[],
  cachedFiles: FileCache
): FileMetadata[] {
  return projectFilesPaths.reduce((acc, filePath) => {
    const lastModified = fs.statSync(filePath).mtimeMs;
    const cachedFile = cachedFiles[filePath];
    const type = Object.entries(CachedFilesPatternRecord).find(
      ([key, pattern]) =>
        GlobToRegExp(pattern, {
          extended: true,
        }).test(filePath)
    )![0] as FileType;

    if (!cachedFile || cachedFile.lastModified !== lastModified) {
      acc.push({
        lastModified,
        path: filePath,
        type,
        name: path.basename(filePath),
      });
    }

    return acc;
  }, [] as FileMetadata[]);
}
