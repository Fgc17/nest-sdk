import fs, { WriteFileOptions } from "fs";
import path from "path";

export function ensureFileWrite(
  filePath: string,
  data: any,
  encoding: WriteFileOptions = "utf-8"
) {
  const dir = path.dirname(filePath);

  fs.mkdirSync(dir, { recursive: true });

  fs.writeFileSync(filePath, data, encoding);
}

export function ensureFileRead(
  filePath: string,
  encoding: BufferEncoding = "utf-8"
) {
  if (!fs.existsSync(filePath)) ensureFileWrite(filePath, "{}", encoding);

  return fs.readFileSync(filePath, encoding);
}
