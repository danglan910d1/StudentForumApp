import { Document } from "mongoose";
import { UserResponseData } from "../types/user";
export type UserRole = "user" | "admin";
export type UserStatus = "active" | "banned";
export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    avatar?: string | null;
    status: UserStatus;
    createdAt: Date;
    updatedAt: Date;
    is_deleted: boolean;
    toJSON(): Omit<IUser, "password" | "__v" | "_id"> & {
        userId: string;
    };
    toObject(): Omit<IUser, "password" | "__v" | "_id"> & {
        userId: string;
    };
    getUserResponseData(): UserResponseData;
}
declare const _default: import("mongoose").Model<IUser, {}, {}, {}, Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=User.d.ts.map