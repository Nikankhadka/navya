export async function withMinimumLoading<T>(
  operation: () => Promise<T>,
  minMs: number = 500,
): Promise<T> {
  const [result] = await Promise.all([
    operation(),
    new Promise((resolve) => setTimeout(resolve, minMs)),
  ]);
  return result;
}
