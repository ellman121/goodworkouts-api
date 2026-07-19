import Ajv from "ajv";
import { AnySchema, JTDDataType } from "ajv/dist/core";

const ajv = new Ajv();

export async function validateRequestBody<T extends AnySchema>(
  schema: T,
  body: unknown
): Promise<{
  errorMessages: string[];
  body?: JTDDataType<T>;
}> {
  try {
    const v = ajv.validate(schema, body);
    const errors = ajv.errors; // Extract to prevent a race condition
    if (!v)
      return { errorMessages: errors?.map((e) => e.message ?? "") ?? [] };

    return {
      errorMessages: [],
      body: body as JTDDataType<T>,
    };
  } catch (e: unknown) {
    return { errorMessages: [(e as Error).message] };
  }
}
