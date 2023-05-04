export class LoginWithExternal {
    accessToken: string;
    userId: string;
    provider: string;

    constructor(accessToken: string, userId: string, provider: string) {
        this.accessToken = accessToken;
        this.userId = userId;
        this.provider = provider;
    }
}