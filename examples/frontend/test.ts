import { generateSDKClient } from "../backend/sdk";

const serverApi = generateSDKClient({
  baseUrl: "http://localhost:3000",
});

serverApi("users", "getUsers", {
  params: {
    id: 2,
  },
});
