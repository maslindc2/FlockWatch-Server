import { FetchRetry } from "./fetch-retry";

/**
 * Extends FetchRetry to include a Bearer token Authorization header
 * using the provided auth ID for scraping service authentication.
 */
class FetchRetryAuthID extends FetchRetry {
    /**
     * @param authID The Auth ID to include in the Authorization header.
     */
    constructor(private readonly authID: string) {
        super();
    }
    protected override buildHeaders(): Record<string, string> {
        return {
            ...super.buildHeaders(),
            Authorization: `Bearer ${this.authID}`,
        };
    }
}
export { FetchRetryAuthID };
