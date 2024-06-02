import { SourceFile } from "ts-morph";
import { RouteInfo } from "..";
import { getPureType } from "../utils/morph";
import {
  AwaitTypeText,
  resolveNodemodules,
  resolveTypedObjects,
  unquotify,
  trimSlashes,
} from "../utils/string";

export function getRoutesInfo(controller: SourceFile): RouteInfo[] {
  const controllerClass = controller.getClasses()[0];

  if (!controllerClass) return [];

  const httpDecorators = ["Get", "Post", "Put", "Delete", "Patch"];

  return controllerClass.getMethods().map((method) => {
    const parameters = method.getParameters();
    const paramDecorators = parameters.filter((p) => p.getDecorator("Param"));

    let reqParams: string | undefined;
    if (paramDecorators.length) {
      reqParams = JSON.stringify(
        paramDecorators.reduce((acc, p) => {
          acc[p.getName()] = getPureType(p);
          return acc;
        }, {})
      );
    }

    const httpOperation = httpDecorators.find((h) =>
      method.getDecorators().find((d) => d.getName() === h)
    )!;

    return {
      types: {
        body: getPureType(parameters.find((p) => p.getDecorator("Body"))),
        query: getPureType(parameters.find((p) => p.getDecorator("Query"))),
        params: paramDecorators.length ? reqParams : undefined,
        response: AwaitTypeText(
          resolveNodemodules(
            resolveTypedObjects(method.getReturnType().getText())
          )
        ),
      },
      methodName: method.getName(),
      httpOperation: httpOperation,
      url:
        unquotify(
          controllerClass
            .getDecorator("Controller")
            ?.getArguments()[0]
            ?.getText()
        ) +
        "/" +
        trimSlashes(
          unquotify(
            method.getDecorator(httpOperation)?.getArguments()[0]?.getText() ??
              ""
          )
        ),
    };
  });
}
