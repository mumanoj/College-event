export abstract class BaseService {
  protected handleError(error: unknown, context: string): never {
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    console.error(`[Service Error - ${context}]:`, error);
    throw new Error(`${context}: ${message}`);
  }
}
