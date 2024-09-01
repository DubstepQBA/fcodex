import "reflect-metadata";

export const BASE_PATH_METADATA_KEY = Symbol("basePath");

/**
 * Decorator to set the base path for a controller.
 *
 * @param basePath the base path for the controller
 * @returns a class decorator that sets the base path for the controller
 *
 * @example
 */
export function Controller(basePath: string = ""): ClassDecorator {
  return (target: Function) => {
    const normalizedBasePath = basePath.startsWith("/")
      ? basePath
      : `/${basePath}`;

    Reflect.defineMetadata(BASE_PATH_METADATA_KEY, normalizedBasePath, target);
  };
}
