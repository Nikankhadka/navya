import { z } from 'zod';

export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .trim()
  .toLowerCase();

function getFirstErrorMessage(result: unknown, field: string): string | undefined {
  const parseResult = result as {
    success: boolean;
    error?: { issues: { path: PropertyKey[]; message: string }[] };
  };
  if (!parseResult.success && parseResult.error) {
    const fieldError = parseResult.error.issues.find((issue) => issue.path.includes(field));
    return fieldError?.message;
  }
  return undefined;
}

export { getFirstErrorMessage };
