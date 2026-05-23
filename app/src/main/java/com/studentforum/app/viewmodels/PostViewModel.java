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

    public void fetchFeed(int page, String query) {
        loading.setValue(true);
        apiService.getPosts(page, query).enqueue(new Callback<com.studentforum.app.models.responses.PostResponse>() {
            @Override
            public void onResponse(Call<com.studentforum.app.models.responses.PostResponse> call, Response<com.studentforum.app.models.responses.PostResponse> response) {
                loading.setValue(false);
                if (response.isSuccessful() && response.body() != null) {
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

    public void fetchMyPosts(String authorId) {
        loading.setValue(true);
        apiService.getMyPosts(authorId).enqueue(new Callback<PostResponse>() {
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
