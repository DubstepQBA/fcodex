# FCodeX

FCodeX es un simple y ligero framework para construir servidores HTTP en Node.js usando TypeScript. Ofrece una forma fácil y estructurada de manejar rutas y middlewares, ideal para proyectos pequeños y medianos.

## Instalación

1. Clona este repositorio:

   ```sh
   git clone <URL_DEL_REPOSITORIO>
   cd <NOMBRE_DEL_DIRECTORIO>
   ```

2. Instala las dependencias::
   ```sh
   npm instal
   ```
3. Script
   ```sh
   npm run build  -> Compila el código TypeScript.
   npm run start:dev -> Compila el código y luego ejecuta el archivo dist/examples/app.js
   ```

## Uso

Para comenzar a usar el framework, puedes crear un archivo de ejemplo como app.ts en el directorio examples.

#### Crear un Servidor

1. Crear un archivo index.ts

   ```sh

       import { Server, Router } from "../src";
       import { loggerMiddleware } from "../src/middlewares/mw_logger";
       import { deleteHandler, getHandler, postHandler } from "./routes";

       const app = new Server();
       const router = app.router;

       // Usar el middleware de logging
       app.use(loggerMiddleware);

       // Definir rutas
       router.get("/hello", getHandler);
       router.post("/data", postHandler);
       router.delete("/delete", deleteHandler);

       // Iniciar el servidor
       app.listen(3000, () => {
       console.log("Server is running on port 3000");
       });

   ```

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o una pull request para proponer cambios.

## Licencia

Este proyecto está licenciado bajo la Licencia MIT. Consulta el archivo LICENSE para más detalles.
