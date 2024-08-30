export const updateUserBodySchema = {
  type: "object",
  properties: {
    username: { type: "string" },
    email: { type: "string" },
    password: { type: "string" },
  },
  additionalProperties: false,
} as const;

export const createUserBodySchema = {
  ...updateUserBodySchema,
  required: ["username", "email", "password"],
} as const;

export const exerciseBodySchema = {
  type: "object",
  properties: {
    name: { type: "string" },
  },
  required: ["name"],
  additionalProperties: false,
} as const;

export const setBodySchema = {
  type: "object",
  properties: {
    reps: {
      type: "array",
      items: {
        type: "array",
        minItems: 2,
        maxItems: 2,
        items: { type: "number", minimum: 0 },
      },
    },
  },
  required: ["reps"],
  additionalProperties: false,
} as const;
