export class RegisterWithExternal {
    firstName: string;
    lastName: string;
    userId: string;
    accessToken: string;
    provider: string;

    constructor(firstName: string, lastName: string, userId: string, accessToken: string, provider: string) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.userId = userId;
        this.accessToken = accessToken;
        this.provider = provider;
    }
}