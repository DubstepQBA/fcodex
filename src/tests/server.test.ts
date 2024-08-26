import http from "http";
import { Server } from "../core/server";
import { Request } from "../core/request";
import { Response } from "../core/response";

// Configuración de una aplicación de ejemplo con todos los endpoints
const app = new Server();

// Rutas básicas
app.router.get("/get", (req: Request, res: Response) => {
  res.send("GET request");
});

app.router.post("/post", (req: Request, res: Response) => {
  res.json({ message: "POST request" });
});

app.router.put("/put", (req: Request, res: Response) => {
  res.send("PUT request");
});

app.router.delete("/delete", (req: Request, res: Response) => {
  res.send("DELETE request");
});

app.router.patch("/patch", (req: Request, res: Response) => {
  res.send("PATCH request");
});

// Rutas dinámicas
app.router.get("/user/:id", (req: Request, res: Response) => {
  const userId = req.params.id;
  res.send(`User ID: ${userId}`);
});

// Rutas con parámetros de consulta
app.router.get("/search", (req: Request, res: Response) => {
  const query = req.query;
  res.json({ query });
});

describe("App", () => {
  let server: http.Server;
  let request: (options: {
    method: string;
    path: string;
    headers?: any;
    body?: any;
  }) => Promise<any>;

  beforeAll((done) => {
    server = app.listen(3000, done); // Inicializa el servidor en el puerto 3000

    request = async ({
      method,
      path,
      headers,
      body,
    }: {
      method: string;
      path: string;
      headers?: any;
      body?: any;
    }): Promise<any> => {
      return new Promise((resolve, reject) => {
        const req = http.request(
          {
            method,
            hostname: "localhost",
            port: 3000,
            path,
            headers,
          },
          (res) => {
            let responseData = "";
            res.on("data", (chunk) => {
              responseData += chunk;
            });
            res.on("end", () => {
              resolve(responseData);
            });
          }
        );

        req.on("error", (err) => {
          reject(err);
        });

        if (body) {
          req.write(body);
        }

        req.end();
      });
    };
  });

  afterAll((done) => {
    server.close(done); // Asegúrate de que el servidor se cierra correctamente
  });

  test("GET /get should respond with 'GET request'", async () => {
    const data = await request({
      method: "GET",
      path: "/get",
    });
    expect(data).toBe("GET request");
  });

  test("POST /post should respond with JSON message", async () => {
    const data = await request({
      method: "POST",
      path: "/post",
    });
    expect(JSON.parse(data)).toEqual({ message: "POST request" });
  });

  test("PUT /put should respond with 'PUT request'", async () => {
    const data = await request({
      method: "PUT",
      path: "/put",
    });
    expect(data).toBe("PUT request");
  });

  test("DELETE /delete should respond with 'DELETE request'", async () => {
    const data = await request({
      method: "DELETE",
      path: "/delete",
    });
    expect(data).toBe("DELETE request");
  });

  test("PATCH /patch should respond with 'PATCH request'", async () => {
    const data = await request({
      method: "PATCH",
      path: "/patch",
    });
    expect(data).toBe("PATCH request");
  });

  test("GET /user/:id should respond with 'User ID: 123'", async () => {
    const data = await request({
      method: "GET",
      path: "/user/123",
    });
    expect(data).toBe("User ID: 123");
  });

  test("GET /search with query parameters should respond with query object", async () => {
    const data = await request({
      method: "GET",
      path: "/search?name=John&age=30",
    });
    expect(JSON.parse(data)).toEqual({ query: { name: "John", age: "30" } });
  });
});
