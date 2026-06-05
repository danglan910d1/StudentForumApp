export declare const registerService: (name: string, email: string, password: string) => Promise<{
    user: any;
    token: string;
}>;
export declare const loginService: (email: string, password: string, ip: string) => Promise<{
    user: any;
    token: string;
}>;
export declare const logoutService: (token: string) => Promise<boolean>;
//# sourceMappingURL=authlLayer.d.ts.map