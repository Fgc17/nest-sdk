import { Project } from "ts-morph";
import { CachedFilesPatternRecord, RouteInfo } from "..";
import { getRoutesInfo } from "./getRoutesInfo";

export function processControllerFiles(
  project: Project,
  modulesControllers: any
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

  const sdkRoutes = Object.entries(modulesControllers).reduce(
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

  const sdkRoutesTypes = Object.entries(sdkRoutes).reduce(
    (acc, [module, routes]) => {
      const moduleRoutes = Object.entries(routes as any).reduce(
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

  const sdkRoutesData = Object.entries(sdkRoutes).reduce(
    (acc, [module, routes]) => {
      const moduleRoutes = Object.entries(routes as any).reduce(
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
