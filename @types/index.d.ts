import { Logger } from "winston";

declare module 'express-serve-static-core' {
    interface Request {
        logger: Logger;
        user: {
            _doc:{
                id: string,
                userName: string,
                email: string,
                isAdmin: boolean,
                role:string[]
            }
        }
    }
}
