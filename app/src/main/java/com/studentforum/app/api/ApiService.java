package com.studentforum.app.api;

import com.studentforum.app.models.*;
import com.studentforum.app.models.responses.*;
import com.studentforum.app.api.requests.*;

import java.util.List;
import java.util.Map;

import retrofit2.Call;
import retrofit2.http.*;
import okhttp3.MultipartBody;
import okhttp3.ResponseBody;

public interface ApiService {

    // --- 1. AUTHENTICATION ---
    @POST("auth/login")
    Call<AuthResponse> login(@Body Map<String, String> credentials);

    @POST("auth/register")
    Call<AuthResponse> register(@Body Map<String, String> userData);

    // --- 2. POSTS (Public & Feed) ---
    @GET("posts")
    Call<PostResponse> getPosts(@Query("page") Integer page, @Query("limit") Integer limit, @Query("search") String query);

    @GET("posts/{id}")
    Call<Post> getPostDetail(@Path("id") String id);

    // --- 3. CREATE / EDIT POSTS ---
    @POST("posts")
    Call<Post> createPost(@Body Map<String, Object> postData);

    @PUT("posts/{id}")
    Call<Post> updatePost(@Path("id") String id, @Body Map<String, Object> postData);
    
    @DELETE("posts/{id}")
    Call<ResponseBody> deletePost(@Path("id") String id);
    
    @Multipart
    @POST("upload")
    Call<Map<String, String>> uploadImage(@Part MultipartBody.Part image);

    // --- 4. ADMIN MODERATION ---
    @GET("posts")
    Call<PostResponse> getPostsForAdmin(@Query("adminView") boolean adminView, @Query("status") String status);

    @POST("posts/admin/approve/{id}")
    Call<Post> approvePost(@Path("id") String id, @Body AdminApproveRequest request);

    // --- 5. PERSONAL / MANAGE POSTS ---
    @GET("posts")
    Call<PostResponse> getMyPosts(@Query("authorId") String authorId);

    // --- 6. TOPICS ---
    @GET("topics")
    Call<TopicResponse> getTopics();

    // --- 7. NOTIFICATIONS ---
    @GET("notifications")
    Call<List<Notification>> getNotifications();

    // --- 8. LIKES & COMMENTS ---
    @POST("likes/post/{id}")
    Call<ResponseBody> toggleLikePost(@Path("id") String id);

    @POST("likes/comment/{id}")
    Call<ResponseBody> toggleLikeComment(@Path("id") String id);

    @GET("comments")
    Call<CommentResponse> getComments(@Query("postId") String postId);
    
    @GET("comments")
    Call<CommentResponse> getReplies(@Query("postId") String postId, @Query("parentId") String parentId);
    
    @POST("comments")
    Call<Comment> addComment(@Body Map<String, Object> commentData);
    
    @PUT("comments/{id}")
    Call<Comment> updateComment(@Path("id") String id, @Body Map<String, Object> commentData);
    
    @DELETE("comments/{id}")
    Call<ResponseBody> deleteComment(@Path("id") String id);

    // --- 9. PROFILE & SECURITY ---
    @GET("users/me")
    Call<User> getMyProfile();

    @PUT("users/me")
    Call<User> updateProfile(@Body Map<String, String> profileData);

    @PUT("users/me/password")
    Call<ResponseBody> changePassword(@Body Map<String, String> passwordData);
}
