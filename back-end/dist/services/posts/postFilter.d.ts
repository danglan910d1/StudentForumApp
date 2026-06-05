import { GetPostsQuery } from "../../types/post";
import { AuthContext } from "../common/buildCommonFilter";
/**
 * Xây dựng đối tượng filter MongoDB đặc thù cho Post.
 * Nó gọi hàm chung để xử lý Status và Search, sau đó thêm lọc đặc thù.
 */
export declare const buildPostFilter: (queryParams: GetPostsQuery, authContext: AuthContext) => Promise<any>;
//# sourceMappingURL=postFilter.d.ts.map