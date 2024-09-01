import "reflect-metadata";

export const ROUTE_METADATA_KEY = Symbol("route");

/**
 * Creates a decorator that adds a route to a controller.
 *
 * @param method The HTTP method for the route.
 * @returns A decorator function that adds the route.
 *
 * @example
 * export function Get(path: string) {
 *   return createRouteDecorator("GET")(path);
 * }
 */
export function createRouteDecorator(method: string) {
  return (path: string) => (target: any, propertyKey: string | symbol) => {
    const routes =
      Reflect.getMetadata(ROUTE_METADATA_KEY, target.constructor) || [];

    routes.push({ method, path, propertyKey });
    Reflect.defineMetadata(ROUTE_METADATA_KEY, routes, target.constructor);
  };
}

export const Get = createRouteDecorator("GET");
export const Post = createRouteDecorator("POST");
export const Put = createRouteDecorator("PUT");
export const Delete = createRouteDecorator("DELETE");
export const Patch = createRouteDecorator("PATCH");
