import { User, UserInfo } from "./typing/user.entities";
import { AuthTokenRequest } from "./typing/auth.dtos";
import { UpdateUserDto } from "./typing/user.dto";

export type SdkRoutesTypes = {
  auth: {
    authenticate: {
      body?: AuthTokenRequest;

      response: never[];
    };
  };

  users: {
    getUsers: {
      params?: { id: number };
      response: never[];
    };

    createUser: {
      response: {};
    };
  };
};

export const SdkRoutesData = {
  auth: {
    authenticate: {
      url: "auth/www",
      httpOperation: "Post",
    },
  },

  users: {
    getUsers: {
      url: "users/:id",
      httpOperation: "Get",
    },

    createUser: {
      url: "users/",
      httpOperation: "Post",
    },
  },
};

export function trimSlashes(str: string | undefined) {
  return str?.replace(/^\/|\/$/g, "");
}

interface SdkClientConfig {
  baseUrl: string;
  defaultHeaders?: Record<string, string>;
}

type SdkRoutesResponse<T> = T extends { response: infer R } ? R : never;

export function generateSDKClient(config: SdkClientConfig) {
  return async function <
    M extends keyof SdkRoutesTypes,
    R extends keyof SdkRoutesTypes[M]
  >(
    module: M,
    method: R,
    args: Omit<SdkRoutesTypes[M][R], "response"> & {
      headers?: Record<string, string>;
    }
  ) {
    const allParams: Record<string, string> = {};

    const types = args as any;

    if (types.body) allParams["body"] = types.body;

    let queryParams = "";
    if (types.query) {
      allParams["query"] = types.query;
      queryParams = `?${new URLSearchParams(types.query as any).toString()}`;
    }

    let urlWithParams = (SdkRoutesData as any)[module][method]["url"];
    if (types.params) {
      const paramsObject = types.params;

      allParams["params"] = `{${Object.keys(paramsObject)
        .map((param) => `${param}: ${paramsObject![param]}`)
        .join(", ")}}`;

      Object.keys(paramsObject).forEach((param) => {
        urlWithParams = urlWithParams.replace(`:${param}`, paramsObject[param]);
      });
    }

    return fetch(
      `${trimSlashes(config.baseUrl)}/${urlWithParams}/${queryParams}`,
      {
        ...(config.defaultHeaders && { headers: config.defaultHeaders }),
        ...args,
      }
    ) as SdkRoutesResponse<SdkRoutesTypes[M][R]>;
  };
}
