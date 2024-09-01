# FCodeX

FCodeX es un simple y ligero framework para construir servidores HTTP en Node.js usando TypeScript. Ofrece una forma fácil y estructurada de manejar rutas y middlewares, ideal para proyectos pequeños y medianos.

## Instalación

1. NPM :

   ```sh
   npm i fcodex
   ```

## Uso

Para comenzar a usar el framework, puedes crear un proyecto en npm. Crea un index.js (ts) en el directorio. Asegurate que tengas el type:"module" en el package.json.

#### Crear un Servidor

1.  Crear un archivo index.ts

    ```sh
       import { Server } from "fcodex";
       const app = new Server();
       const router = app.router;

       router.get("/hello", (req, res) => {
       res.status(200).send("Hello");
       });

       app.listen(3000, () => {
       console.log(`Server is running on port 3000`);
       });
    ```

2.  Correr el proyecto con Nodejs.
    ```sh
    node index.js
    ```

# Features

- [x] Soporte nativo de JWT sin dependencia
- [x] Soporte para Query Parameters
- [x] Soporte para Middleware Asíncrono
- [x] Soporte para Middleware Global y de Rutas Específicas
- [x] Manejo de Errores Centralizado
- [x] CORS (Cross-Origin Resource Sharing)
- [x] Rutas Dinámicas
- [x] Generador de Código para Esqueletos de Proyecto
- [x] Soporte para Validación de Datos sin dependencia
- [x] Configuración Centralizada
- [x] Soporte de Decoradores para Contoller y Rutas
- [ ] Autenticación y Autorización

## Métrica autocannon

| Métrica                       | FCodeX            | Express           |
| ----------------------------- | ----------------- | ----------------- |
| **Latencia Promedio**         | 118.16 ms         | 256.01 ms         |
| **Latencia 2.5%**             | 49 ms             | 200 ms            |
| **Latencia 50%**              | 107 ms            | 239 ms            |
| **Latencia 97.5%**            | 274 ms            | 354 ms            |
| **Latencia 99%**              | 436 ms            | 410 ms            |
| **Requisiciones por Segundo** | 8,430.8           | 3,883.3           |
| **Bytes por Segundo**         | 1.54 MB           | 928 kB            |
| **Total de Requisiciones**    | 254,000 en 30.12s | 117,000 en 30.08s |
| **Errores**                   | No reportado      | No reportado      |

### **Observaciones:**

- **Latencia**: `fcodex` tiene una latencia promedio menor, lo cual es mejor.
- **Requisiciones por Segundo**: `fcodex` maneja más solicitudes por segundo.
- **Bytes por Segundo**: `fcodex` maneja más datos por segundo.
- **Requisiciones por Segundo**: `fcodex` es aproximadamente 117.53% más rápido.
- **Bytes por Segundo**: `fcodex`maneja aproximadamente 65.54% más datos por segundo.

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o una pull request para proponer cambios.

## Licencia

Este proyecto está licenciado bajo la Licencia MIT. Consulta el archivo LICENSE para más detalles.
