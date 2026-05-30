package com.studentforum.app.viewmodels;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;
import com.studentforum.app.api.ApiService;
import com.studentforum.app.models.Post;
import com.studentforum.app.models.responses.PostResponse;
import java.util.List;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class PostViewModel extends ViewModel {
    private final ApiService apiService;
    private final MutableLiveData<List<Post>> posts = new MutableLiveData<>();
    private final MutableLiveData<String> error = new MutableLiveData<>();
    private final MutableLiveData<Boolean> loading = new MutableLiveData<>();

    public static class PostLikeEvent {
        public final String postId;
        public final boolean isLiked;
        public final int likesCount;
        public PostLikeEvent(String postId, boolean isLiked, int likesCount) {
            this.postId = postId;
            this.isLiked = isLiked;
            this.likesCount = likesCount;
        }
    }
    public static final MutableLiveData<PostLikeEvent> postLikeEventBus = new MutableLiveData<>();

    public static void updateCacheLikeStatus(String postId, boolean isLiked, int likesCount) {
        for (com.studentforum.app.models.responses.PostResponse response : listCache.values()) {
            if (response.getPosts() != null) {
                for (Post post : response.getPosts()) {
                    if (post.getId() != null && post.getId().equals(postId)) {
                        post.setLikedByCurrentUser(isLiked);
                        post.setLikesCount(likesCount);
                    }
                }
            }
        }
    }

    public PostViewModel(ApiService apiService) {
        this.apiService = apiService;
    }

    private final MutableLiveData<com.studentforum.app.models.responses.PostResponse.Pagination> pagination = new MutableLiveData<>();

    public LiveData<List<Post>> getPosts() { return posts; }
    public LiveData<String> getError() { return error; }
    public LiveData<Boolean> getLoading() { return loading; }
    public LiveData<com.studentforum.app.models.responses.PostResponse.Pagination> getPagination() { return pagination; }

    public void fetchFeed(int page) {
        fetchFeed(page, null);
    }

    private static final java.util.Map<String, com.studentforum.app.models.responses.PostResponse> listCache = new java.util.HashMap<>();

    public void clearCache() {
        listCache.clear();
    }

    public void fetchFeed(int page, String query) {
        String cacheKey = "feed_" + page + "_" + (query != null ? query : "");
        if (listCache.containsKey(cacheKey)) {
            com.studentforum.app.models.responses.PostResponse cachedResponse = listCache.get(cacheKey);
            posts.setValue(cachedResponse.getPosts());
            pagination.setValue(cachedResponse.getPagination());
            return;
        }

        loading.setValue(true);
        apiService.getPosts(page, 5, query).enqueue(new Callback<com.studentforum.app.models.responses.PostResponse>() {
            @Override
            public void onResponse(Call<com.studentforum.app.models.responses.PostResponse> call, Response<com.studentforum.app.models.responses.PostResponse> response) {
                loading.setValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    listCache.put(cacheKey, response.body());
                    posts.setValue(response.body().getPosts());
                    pagination.setValue(response.body().getPagination());
                } else {
                    error.setValue("Không thể tải danh sách bài viết.");
                }
            }

            @Override
            public void onFailure(Call<PostResponse> call, Throwable t) {
                loading.setValue(false);
                error.setValue("Lỗi mạng: " + t.getMessage());
            }
        });
    }

    public void fetchMyPosts(String authorId, boolean isMyProfile) {
        loading.setValue(true);
        apiService.getMyPosts(authorId, isMyProfile, null).enqueue(new Callback<PostResponse>() {
            @Override
            public void onResponse(Call<PostResponse> call, Response<PostResponse> response) {
                loading.setValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    posts.setValue(response.body().getPosts());
                } else {
                    error.setValue("Không thể tải danh sách bài viết cá nhân.");
                }
            }

            @Override
            public void onFailure(Call<PostResponse> call, Throwable t) {
                loading.setValue(false);
                error.setValue("Lỗi mạng: " + t.getMessage());
            }
        });
    }
}
