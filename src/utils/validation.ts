import Ajv, { ErrorObject } from "ajv";
import { AnySchema, JTDDataType } from "ajv/dist/core";

const ajv = new Ajv();

export async function validateRequestBody<T extends AnySchema>(
  schema: T,
  body: unknown
): Promise<{
  errors: Array<ErrorObject> | Array<Error>;
  body?: JTDDataType<T>;
}> {
  try {
    const v = await ajv.validate(schema, body);
    if (!v) return { errors: ajv.errors ?? [] };

    return {
      errors: [],
      body: body as JTDDataType<T>,
    };
  } catch (e: unknown) {
    return { errors: [e as Error] };
  }
}
