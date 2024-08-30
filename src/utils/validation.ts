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
    const v = await ajv.validate(schema, body);
    if (!v)
      return { errorMessages: ajv.errors?.map((e) => e.message ?? "") ?? [] };

    return {
      errorMessages: [],
      body: body as JTDDataType<T>,
    };
  } catch (e: unknown) {
    return { errorMessages: [(e as Error).message] };
  }
}
