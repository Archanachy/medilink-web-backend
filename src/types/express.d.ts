export {};

declare global {
    namespace Express {
        interface Request {
            file?: Express.Multer.File;
            files?: Express.Multer.File[];
            user?: {
                id?: string;
                role?: string;
                email?: string;
                username?: string;
            };
        }
    }
}
