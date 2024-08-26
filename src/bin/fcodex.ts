import { Command } from "commander";
import * as fs from "fs-extra";
import * as path from "path";

const program = new Command();
program.version("1.0.0");

program
  .command("create <project-name>")
  .description("Crear un nuevo proyecto con FCodeX")
  .action((projectName: string) => {
    const projectPath = path.join(process.cwd(), projectName);

    if (fs.existsSync(projectPath)) {
      console.error("El proyecto ya existe en este directorio.");
      process.exit(1);
    }

    fs.ensureDirSync(projectPath);

    // Estructura básica del proyecto
    const folders = ["src", "src/routes", "src/middleware", "src/controllers"];

    folders.forEach((folder) => {
      fs.ensureDirSync(path.join(projectPath, folder));
    });

    // Archivos básicos
    const files: { [key: string]: string } = {
      "src/index.ts": `
import { Server } from 'fcodex';
import { router } from './routes';

const app = new Server();

app.use(router);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
      `,
      "src/routes/index.ts": `
import { Router } from 'fcodex';
import { exampleController } from '../controllers/exampleController';

const router = new Router();

router.get('/', exampleController);

export { router };
      `,
      "src/controllers/exampleController.ts": `
import { Request, Response } from 'fcodex';

export const exampleController = (req: Request, res: Response) => {
  res.send('Hello, FCodeX!');
};
      `,
    };

    Object.entries(files).forEach(([filePath, content]) => {
      fs.outputFileSync(path.join(projectPath, filePath), content.trim());
    });

    console.log(`Proyecto ${projectName} creado exitosamente.`);
  });

program.parse(process.argv);
