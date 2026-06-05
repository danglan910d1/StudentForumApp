declare module "multer-storage-cloudinary" {
  import { StorageEngine } from "multer";
  import { v2 as cloudinary } from "cloudinary";

  export interface Options {
    cloudinary: typeof cloudinary;
    params?: {
      folder?: string;
      format?: string;
      allowed_formats?: string[];
      public_id?: (req: any, file: any) => string;
      transformation?: Array<{ [key: string]: any }>;
      upload_preset?: string;
      resource_type?: string;
      [key: string]: any;
    };
  }

  export class CloudinaryStorage implements StorageEngine {
    constructor(options: Options);
    _handleFile(req: any, file: any, cb: any): void;
    _removeFile(req: any, file: any, cb: any): void;
  }
}
