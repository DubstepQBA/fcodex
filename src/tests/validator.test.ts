import { Validator, ValidationSchema } from "../modules/validator/validator";

describe("Validator class", () => {
  it("should validate a valid string", () => {
    const schema: ValidationSchema = {
      name: {
        type: "string",
        required: true,
      },
      lastname: {
        type: "string",
        required: true,
      },
    };
    const validator = new Validator(schema);
    const data = { name: "Javier", lastname: "Alfaro" };
    const errors = validator.validate(data);
    expect(errors).toEqual([]);
  });

  it("should validate a valid email", () => {
    const schema: ValidationSchema = {
      name: {
        type: "string",
        required: true,
      },
      lastname: {
        type: "string",
        required: true,
      },
      email: {
        type: "email",
        required: true,
      },
    };

    const validator = new Validator(schema);
    const data = {
      name: "Javier",
      lastname: "Alfaro",
      email: "javier@gmail.com",
    };
    const errors = validator.validate(data);
    expect(errors).toEqual([]);
  });

  it("should validate a valid date", () => {
    const schema: ValidationSchema = {
      name: {
        type: "string",
        required: true,
      },
      lastname: {
        type: "string",
        required: true,
      },
      date: {
        type: "date",
        required: true,
      },
    };

    const validator = new Validator(schema);
    const data = {
      name: "Javier",
      lastname: "Alfaro",
      date: "2022-01-01",
    };
    const errors = validator.validate(data);
    expect(errors).toEqual([]);
  });

  it("should validate a valid number", () => {
    const schema: ValidationSchema = {
      name: {
        type: "string",
        required: true,
      },
      lastname: {
        type: "string",
        required: true,
      },
      age: {
        type: "number",
        required: true,
      },
    };
    const validator = new Validator(schema);
    const data = {
      name: "Javier",
      lastname: "Alfaro",
      age: 30,
    };
    const errors = validator.validate(data);
    expect(errors).toEqual([]);
  });

  it("should validate a valid boolean", () => {
    const schema: ValidationSchema = {
      name: {
        type: "string",
        required: true,
      },
      lastname: {
        type: "string",
        required: true,
      },
      active: {
        type: "boolean",
        required: true,
      },
    };
    const validator = new Validator(schema);
    const data = {
      name: "Javier",
      lastname: "Alfaro",
      active: true,
    };
    const errors = validator.validate(data);
    expect(errors).toEqual([]);
  });

  it("should validate a valid array", () => {
    const schema: ValidationSchema = {
      name: {
        type: "string",
        required: true,
      },
      lastname: {
        type: "string",
        required: true,
      },
      skills: {
        type: "array",
        required: true,
        min: 2,
        max: 5,
      },
    };
    const validator = new Validator(schema);
    const data = {
      name: "Javier",
      lastname: "Alfaro",
      skills: ["html", "css", "js"],
    };
    const errors = validator.validate(data);
    expect(errors).toEqual([]);
  });

  it("should validate a valid object", () => {
    const schema: ValidationSchema = {
      name: {
        type: "string",
        required: true,
      },
      lastname: {
        type: "string",
        required: true,
      },
      address: {
        type: "object",
        required: true,
      },
    };
    const validator = new Validator(schema);
    const data = {
      name: "Javier",
      lastname: "Alfaro",
      address: {
        street: "Calle falsa 123",
        number: 123,
      },
    };
    const errors = validator.validate(data);
    expect(errors).toEqual([]);
  });

  it("should validate a required", () => {
    const schema: ValidationSchema = {
      name: {
        type: "string",
        required: true,
      },
      lastname: {
        type: "string",
        required: true,
      },
    };
    const validator = new Validator(schema);
    const data = {
      name: "Javier",
    };
    const errors = validator.validate(data);

    expect(errors).toEqual([
      {
        field: "lastname",
        message: "This field is required.",
      },
    ]);
  });

  it("should validate a min length", () => {
    const schema: ValidationSchema = {
      name: {
        type: "string",
        required: true,
        minLength: 10,
      },
    };
    const validator = new Validator(schema);
    const data = {
      name: "Javier",
      lastname: "Alfaro",
    };
    const errors = validator.validate(data);

    expect(errors).toEqual([
      {
        field: "name",
        message: `Must be at least ${schema.name.minLength} characters long.`,
      },
    ]);
  });

  it("should validate a max length", () => {
    const schema: ValidationSchema = {
      name: {
        type: "string",
        required: true,
        maxLength: 2,
      },
    };
    const validator = new Validator(schema);
    const data = {
      name: "Javier",
      lastname: "Alfaro",
    };
    const errors = validator.validate(data);

    expect(errors).toEqual([
      {
        field: "name",
        message: `Must be at most ${schema.name.maxLength} characters long.`,
      },
    ]);
  });
});
