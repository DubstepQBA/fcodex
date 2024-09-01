import "reflect-metadata";
import { Router } from "../../core/router"; // Ajusta la ruta según sea necesario
import { BASE_PATH_METADATA_KEY } from "./ControllerDecorator";
import { ROUTE_METADATA_KEY } from "./RouteDecorator";

/**
 * Registers a controller with the given router. The controller should have
 * decorators applied. Each decorated method will be added as a route to the
 * router.
 *
 * @param controller The controller to register.
 * @param router The router to which to register the controller.
 */
export function registerController(controller: any, router: Router) {
  const basePath =
    Reflect.getMetadata(BASE_PATH_METADATA_KEY, controller) || "";

  const routes = Reflect.getMetadata(ROUTE_METADATA_KEY, controller) || [];

  routes.forEach(
    ({
      method,
      path,
      propertyKey,
    }: {
      method: string;
      path: string;
      propertyKey: string | symbol;
    }) => {
      const handler = controller.prototype[propertyKey];
      if (typeof handler === "function") {
        const fullPath = `${basePath}${path}`;
        router[method.toLowerCase()](fullPath, handler.bind(new controller()));
      } else {
        console.error(
          `Handler for ${propertyKey.toString()} is not a function`
        );
      }
    }
  );
}
