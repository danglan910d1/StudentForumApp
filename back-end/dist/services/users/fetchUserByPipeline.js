"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchUserByPipeline = void 0;
const User_1 = __importDefault(require("../../models/User"));
const userPipeline_1 = require("./userPipeline");
// --- [ UTILS: Hàm bổ trợ lấy User qua Pipeline để đồng nhất dữ liệu ] ---
const fetchUserByPipeline = async (filter, isAdminView // Biến này xác định "Người đang xem" có quyền xem pending hay không
) => {
    const pipeline = (0, userPipeline_1.buildUserAggregationPipeline)(filter, {
        includeStats: true, // Luôn luôn tính toán thống kê
        isAdminView: isAdminView, // Truyền vào để pipeline quyết định trả về Object hay Number
    });
    const users = await User_1.default.aggregate(pipeline).exec();
    return users[0] || null;
};
exports.fetchUserByPipeline = fetchUserByPipeline;
//# sourceMappingURL=fetchUserByPipeline.js.map