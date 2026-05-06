import { FetchRetry } from "./fetch-retry";

class FetchRetryAuthID extends FetchRetry {
    constructor(private readonly authID: string){
        super();
    }
    protected override buildHeaders(): Record<string, string> {
        return {
            ...super.buildHeaders,
            Authorization: `Bearer ${this.authID}`
        }
    }
}
export {FetchRetryAuthID}