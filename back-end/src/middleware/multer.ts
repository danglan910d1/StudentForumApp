// import multer, { MulterError, StorageEngine } from "multer";
// import { Request, Response, NextFunction } from "express";
// import path from "path";
// import fs from "fs";

// // --- ĐỊNH NGHĨA TYPE MỞ RỘNG ---
// interface CustomRequest extends Request {
//   fileValidationError?: string;
// }

// // --- 1. CẤU HÌNH DISK STORAGE (CHO POST IMAGES VÀ CÁC FILE LỚN) ---

// export const UPLOADS_DIR = path.join(process.cwd(), "uploads");
// // Đảm bảo thư mục uploads tồn tại
// if (!fs.existsSync(UPLOADS_DIR)) {
//   fs.mkdirSync(UPLOADS_DIR, { recursive: true });
// }

// // Gán kiểu rõ ràng cho Disk Storage Engine để tránh lỗi Type
// const diskStorageEngine: StorageEngine = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, UPLOADS_DIR);
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(
//       null,
//       file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
//     );
//   },
// });

// // --- 2. CẤU HÌNH MEMORY STORAGE (CHO AVATAR) ---
// // Gán kiểu rõ ràng cho Memory Storage Engine để tránh lỗi Type
// const memoryStorageEngine: StorageEngine = multer.memoryStorage();

// // --- 3. CẤU HÌNH FILTER (KIỂM TRA KIỂU FILE) ---
// const fileFilter = (
//   req: CustomRequest,
//   file: Express.Multer.File,
//   cb: multer.FileFilterCallback
// ) => {
//   if (file.mimetype.startsWith("image/")) {
//     cb(null, true);
//   } else {
//     req.fileValidationError =
//       "Chỉ chấp nhận các định dạng ảnh (JPEG, PNG, GIF, WebP).";
//     cb(null, false);
//   }
// };

// // --- 4. CÁC CẤU HÌNH MULTER CỤ THỂ ---

// // 1. Upload một file (Avatar) - Dùng Memory Storage (Transactional)
// export const uploadSingleAvatar = multer({
//   storage: memoryStorageEngine, // <-- Dùng Memory
//   fileFilter: fileFilter,
//   limits: { fileSize: 1024 * 1024 * 2 }, // Giới hạn 2MB
// }).single("avatar");

// // 2. Upload nhiều file (Post Images) - Dùng Disk Storage (Tốt cho RAM, vì file lớn hơn)
// export const uploadMultipleFiles = multer({
//   storage: diskStorageEngine, // <-- Dùng Disk
//   fileFilter: fileFilter,
//   limits: {
//     fileSize: 1024 * 1024 * 5, // Giới hạn 5MB CHO MỖI FILE
//     files: 5, // Tối đa 5 file
//   },
// }).array("files", 5);

// // --- 5. MIDDLEWARE XỬ LÝ LỖI MULTER TỔNG QUÁT ---

// type MulterMiddleware = (
//   req: Request,
//   res: Response,
//   callback: (err: any) => any
// ) => void;

// /**
//  * Middleware để bọc và xử lý lỗi từ Multer, giúp Express Error Handler không bị bỏ qua.
//  * @param uploadFunction Hàm Multer cụ thể (ví dụ: uploadSingleAvatar, uploadMultipleFiles)
//  */
// export const multerErrorHandler =
//   (uploadFunction: MulterMiddleware) =>
//   (req: Request, res: Response, next: NextFunction) => {
//     const customReq = req as CustomRequest;

//     uploadFunction(customReq, res, function (err) {
//       // Xử lý lỗi từ fileFilter trước
//       if (customReq.fileValidationError) {
//         return res.status(400).json({
//           success: false,
//           message: customReq.fileValidationError,
//         });
//       }

//       if (err instanceof MulterError) {
//         // Lỗi Multer (ví dụ: File quá lớn, quá số lượng file)
//         if (err.code === "LIMIT_FILE_SIZE") {
//           return res.status(400).json({
//             success: false,
//             message: `Upload failed: Kích thước file vượt quá giới hạn cho phép (Max 2MB/5MB).`,
//           });
//         }
//         if (err.code === "LIMIT_UNEXPECTED_FILE") {
//           return res.status(400).json({
//             success: false,
//             message: `Upload failed: Tên field không chính xác hoặc vượt quá số lượng file cho phép.`,
//           });
//         }
//         return res.status(400).json({
//           success: false,
//           message: `Upload failed: Lỗi Multer - ${err.message}`,
//         });
//       }

//       if (err) {
//         // Lỗi hệ thống hoặc lỗi khác không phải Multer
//         console.error("Lỗi upload không xác định:", err);
//         return res.status(500).json({
//           success: false,
//           message: "Đã xảy ra lỗi không xác định trong quá trình tải lên.",
//         });
//       } // Nếu không có lỗi, chuyển sang middleware/controller tiếp theo

//       next();
//     });
//   };

import multer, { MulterError } from "multer";
import { Request, Response, NextFunction } from "express";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary"; // Bản v4 dùng import trực tiếp được

interface CustomRequest extends Request {
  fileValidationError?: string;
}

// 1. Cấu hình Cloudinary
cloudinary.config({
  cloud_name: String(process.env.CLOUDINARY_NAME),
  api_key: String(process.env.CLOUDINARY_KEY),
  api_secret: String(process.env.CLOUDINARY_SECRET),
  secure: true,
});

// 2. Cấu hình Storage (Sử dụng Object phẳng để dứt điểm vụ load lâu)
const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "avatars",
    upload_preset: "ml_default",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  } as any,
});

const postStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "posts",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    public_id: (req: Request, file: Express.Multer.File) =>
      `post-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
  } as any,
});

// 3. Filter
const fileFilter = (req: CustomRequest, file: Express.Multer.File, cb: any) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    req.fileValidationError = "Chỉ chấp nhận các định dạng ảnh.";
    cb(null, false);
  }
};

// 4. Export Multer
export const uploadSingleAvatar = multer({
  storage: avatarStorage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
}).single("avatar");

export const uploadMultipleFiles = multer({
  storage: postStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
}).array("files", 5);

// 5. Middleware xử lý lỗi
export const multerErrorHandler =
  (uploadFunction: any) =>
  (req: Request, res: Response, next: NextFunction) => {
    const customReq = req as CustomRequest;
    console.log(" [Multer] Đang đẩy file lên Cloudinary...");

    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        console.error("[Multer] Timeout 30s");
        return res.status(504).json({
          success: false,
          message: "Tải ảnh quá lâu. Hãy kiểm tra mạng hoặc Cloudinary Preset.",
        });
      }
    }, 30000);

    uploadFunction(customReq, res, function (err: any) {
      clearTimeout(timeout);
      if (customReq.fileValidationError) {
        return res
          .status(400)
          .json({ success: false, message: customReq.fileValidationError });
      }
      if (err instanceof MulterError) {
        return res
          .status(400)
          .json({ success: false, message: `Multer: ${err.message}` });
      }
      if (err) {
        console.error("CLOUDINARY_ERROR:", err);
        return res
          .status(500)
          .json({ success: false, message: "Lỗi upload.", error: err.message });
      }
      console.log("[Multer] Thành công!");
      next();
    });
  };
