/// HTTP status codes
const BAD_REQUEST = 400;
const NOT_FOUND = 404;
const INTERNAL_SERVER_ERROR = 500;

export class ApiError extends Error {
  type: string;
  status: number;

  constructor(message: string, status = INTERNAL_SERVER_ERROR) {
    super();
    Error.captureStackTrace(this, this.constructor);
    Object.defineProperty(this, 'message', {
      value: message,
    });
    this.status = status;
    this.type = this.constructor.name;
  }
}

export class BadRequestError extends ApiError {
  constructor(message = 'Bad API request', status = BAD_REQUEST) {
    super(message, status);
  }
}

export class ValidationError extends BadRequestError {
  constructor(message = 'Bad body format') {
    super(message);
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Not found', status = NOT_FOUND) {
    super(message, status);
  }
}

export class ResourceNotFoundError extends NotFoundError {
  resourceType: string;

  constructor(resourceType: string, resourceId: string) {
    const message = `${resourceType} ${resourceId} not found`;
    super(message);
    this.resourceType = resourceType;
  }
}
