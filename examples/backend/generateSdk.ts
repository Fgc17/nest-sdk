import { generateSdk } from "../../src";

generateSdk({
  apiUrl: "http://localhost:3000",
  dist: "examples/frontend/sdk",
  tsconfig: 'examples/backend/tsconfig.json'
});
