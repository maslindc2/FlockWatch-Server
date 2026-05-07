import { logger } from "../../utils/winston-logger";

class FetchRetry {
    /**
     *
     * @param URL This the URL we are making the fetch operation to
     * @param options This our fetch request options includes headers, body, and
     * @param timeoutMs How long to wait in Milliseconds before retrying operation
     * @returns The Post Promise
     */
    private async fetchWithTimeout(
        URL: string,
        options: RequestInit,
        timeoutMs: number
    ): Promise<Response> {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort, timeoutMs);
        try {
            return await fetch(URL, {
                ...options,
                signal: controller.signal,
            });
        } finally {
            clearTimeout(timeout);
        }
    }

    /**
     * Responsible for Retrying our fetch operation if we encounter any network issues with our initial fetch operation
     * @param URL This the URL we are making the fetch operation to
     * @param retries Number of times to retry the operation
     * @param timeoutMs How long to wait in Milliseconds before retrying operation
     * @param baseDelay Base network delay in Milliseconds (attempts to account for network delay to slow servers)
     * @param authID Auth ID we are sending in our fetch operation
     * @param fetchOptions This is contains the fetch configuration (method, headers, and body)
     * @returns The Post Promise
     */
    private async fetchWithRetry(
        URL: string,
        retries: number,
        timeoutMs: number,
        baseDelay: number,
        options: RequestInit
    ): Promise<Response> {
        const wait = (ms: number) =>
            new Promise((resolve) => setTimeout(resolve, ms));
        try {
            return await this.fetchWithTimeout(URL, options, timeoutMs);
        } catch (error: any) {
            if (retries <= 0) throw error;

            logger.error(
                `Network error contacting Server, retries left ${retries}: ${error.message}`
            );

            const attemptNumber = retries;
            const rawDelay = baseDelay * Math.pow(2, attemptNumber);
            const jitter = Math.floor(Math.random() * baseDelay);

            await wait(rawDelay + jitter);

            return this.fetchWithRetry(
                URL,
                retries - 1,
                timeoutMs,
                baseDelay,
                options
            );
        }
    }
    protected buildHeaders(): Record<string, string> {
        return {
            "Content-Type": "application/json",
        };
    }

    /**
     *
     * @param URL This the URL we are making the fetch operation to
     * @param body This is the body that we will be sending as part of our fetch operation
     * @param retries Number of times to retry the fetch operation
     * @param timeoutMs How long to wait in Milliseconds before retrying operation
     * @param baseDelay Base network delay in Milliseconds (attempts to account for network delay to slow servers)
     * @returns The Post Promise
     */
    public async postRetry(
        URL: string,
        body: any,
        retries: number,
        timeoutMs: number,
        baseDelay: number
    ): Promise<Response | undefined> {
        try {
            // Create the configuration for the fetch operation specifying the method, headers, and our body
            const config: RequestInit = {
                method: "POST",
                headers: this.buildHeaders(),
                body: JSON.stringify(body),
            };

            return await this.fetchWithRetry(
                URL,
                retries,
                timeoutMs,
                baseDelay,
                config
            );
        } catch (error) {
            logger.error(`Failed to make a post request, resulted in ${error}`);
            console.error(
                `Failed to make a post request, resulted in ${error}`
            );
        }
    }
    /**
     *
     * @param URL This the URL we are making the fetch operation to
     * @param retries Number of times to retry the fetch operation
     * @param timeoutMs How long to wait in Milliseconds before retrying operation
     * @param baseDelay Base network delay in Milliseconds (attempts to account for network delay to slow servers)
     * @returns The Post Promise
     */
    public async getRetry(
        URL: string,
        retries: number,
        timeoutMs: number,
        baseDelay: number
    ): Promise<Response | undefined> {
        try {
            const options = {
                method: "GET",
                headers: this.buildHeaders(),
            };

            return await this.fetchWithRetry(
                URL,
                retries,
                timeoutMs,
                baseDelay,
                options
            );
        } catch (error) {
            logger.error(`Failed to make a post request, resulted in ${error}`);
            console.error(
                `Failed to make a post request, resulted in ${error}`
            );
        }
    }
}

export { FetchRetry };
