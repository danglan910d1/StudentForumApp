import { UserRole, UserStatus } from "../models/User";
import { CommonQuery } from "../services/common/buildCommonFilter";
interface UserBaseData {
    name: string;
    email: string;
    password: string;
    avatar?: string | null;
}
export interface RegisterBody extends Pick<UserBaseData, "name" | "email" | "password"> {
    avatar?: string;
}
export interface LoginBody extends Pick<UserBaseData, "email" | "password"> {
}
export interface UpdateProfileBody extends Partial<Pick<UserBaseData, "name" | "avatar">> {
}
export interface UpdatePasswordBody {
    oldPassword: string;
    newPassword: string;
}
export interface GetUserParams {
    id: string;
}
export interface UpdateUserStatusBody {
    status?: UserStatus;
    role?: UserRole;
}
export interface GetAllUsersQuery extends CommonQuery {
    role?: UserRole;
    email?: string;
    name?: string;
}
export interface UserResponseData {
    userId: string;
    name: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    avatar?: string | null;
    createdAt: Date;
    updatedAt: Date;
}
export {};
//# sourceMappingURL=user.d.ts.map