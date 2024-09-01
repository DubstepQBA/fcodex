export class HttpError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

class ValidationError extends HttpError {
  constructor(message: string) {
    super(message, 400);
  }
}

class NotFoundError extends HttpError {
  constructor(message: string = "Not Found") {
    super(message, 404);
  }
}

class UnauthorizedError extends HttpError {
  constructor(message: string = "Unauthorized") {
    super(message, 401);
  }
}
