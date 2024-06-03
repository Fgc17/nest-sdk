import { Project } from "ts-morph";
import { CachedFilesPatternRecord, RouteInfo } from "..";
import { getRoutesInfo } from "./getRoutesInfo";

export function processControllerFiles(
  project: Project,
  modulesControllers: Record<string, string[]>
) {
  const controllerFiles = project.getSourceFiles(
    CachedFilesPatternRecord.controller
  );
  const controllerRoutes: Record<string, RouteInfo[]> = controllerFiles.reduce(
    (acc, controllerFile) => {
      const controller = controllerFile.getClasses()[0]!;
      const controllerName = controller.getName()!;
      const routes = getRoutesInfo(controllerFile);
      return {
        ...acc,
        [controllerName]: routes,
      };
    },
    {}
  );

  const sdkRoutes: Record<string, Record<string, RouteInfo>> = Object.entries(modulesControllers).reduce(
    (acc, [module, controllers]) => {
      const moduleRoutes = controllers.reduce((acc, controller) => {
        const routes = controllerRoutes[controller]?.reduce((acc, route) => {
          const { methodName, ...rest } = route;
          return {
            ...acc,
            [route.methodName]: rest,
          };
        }, {});
        return {
          ...acc,
          ...routes,
        };
      }, {});
      return {
        ...acc,
        [module]: moduleRoutes,
      };
    },
    {}
  );

  const sdkRoutesTypes: Record<string, Record<string, RouteInfo['types']>> = Object.entries(sdkRoutes).reduce(
    (acc, [module, routes]) => {
      const moduleRoutes = Object.entries(routes).reduce(
        (acc, [route, { types }]) => {
          return {
            ...acc,
            [route]: types,
          };
        },
        {}
      );

      return {
        ...acc,
        [module]: moduleRoutes,
      };
    },
    {}
  );

  const sdkRoutesData: Record<string, Record<string, Omit<RouteInfo, 'types'>>> = Object.entries(sdkRoutes).reduce(
    (acc, [module, routes]) => {
      const moduleRoutes = Object.entries(routes).reduce(
        (acc, [route, { url, httpOperation }]) => {
          return {
            ...acc,
            [route]: {
              url,
              httpOperation,
            },
          };
        },
        {}
      );
      return {
        ...acc,
        [module]: moduleRoutes,
      };
    },
    {}
  );

  return { sdkRoutesData, sdkRoutesTypes };
}
