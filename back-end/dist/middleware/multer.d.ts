import { Request, Response, NextFunction } from "express";
export declare const uploadSingleAvatar: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const uploadMultipleFiles: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const multerErrorHandler: (uploadFunction: any) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=multer.d.ts.map