import "reflect-metadata";
import { Middleware } from "../../core/router";

export const MIDDLEWARES_METADATA_KEY = Symbol("middlewares");
/**
 * Adds a middleware to a controller method.
 *
 * Middlewares are executed in the order they are defined. If a middleware returns a
 * value, it will be passed to the next middleware as an argument. If a middleware
 * throws an error, it will be handled by the error handler middleware.
 *
 * @param middleware - The middleware function.
 * @returns The MethodDecorator.
 * @example
 */
export function Use(middleware: Middleware) {
  return (target: Object, propertyKey: string | symbol) => {
    const middlewares =
      Reflect.getMetadata(MIDDLEWARES_METADATA_KEY, target.constructor) || {};
    middlewares[propertyKey] = middleware;
    Reflect.defineMetadata(
      MIDDLEWARES_METADATA_KEY,
      middlewares,
      target.constructor
    );
  };
}
