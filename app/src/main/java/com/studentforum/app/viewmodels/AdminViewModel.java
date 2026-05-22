package com.studentforum.app.viewmodels;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;
import com.studentforum.app.api.ApiService;
import com.studentforum.app.api.requests.AdminApproveRequest;
import com.studentforum.app.models.Post;
import com.studentforum.app.models.responses.PostResponse;
import java.util.ArrayList;
import java.util.List;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class AdminViewModel extends ViewModel {
    private final ApiService apiService;
    private final MutableLiveData<List<Post>> adminPosts = new MutableLiveData<>();
    private final MutableLiveData<String> error = new MutableLiveData<>();
    private final MutableLiveData<Boolean> loading = new MutableLiveData<>();
    private final MutableLiveData<Boolean> actionSuccess = new MutableLiveData<>();

    public AdminViewModel(ApiService apiService) {
        this.apiService = apiService;
    }

    public LiveData<List<Post>> getAdminPosts() { return adminPosts; }
    public LiveData<String> getError() { return error; }
    public LiveData<Boolean> getLoading() { return loading; }
    public LiveData<Boolean> getActionSuccess() { return actionSuccess; }

    public void fetchPostsByStatus(String status) {
        loading.setValue(true);
        // Gọi API với adminView = true
        apiService.getPostsForAdmin(true, status).enqueue(new Callback<PostResponse>() {
            @Override
            public void onResponse(Call<PostResponse> call, Response<PostResponse> response) {
                loading.setValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    adminPosts.setValue(response.body().getPosts());
                } else {
                    error.setValue("Không thể tải danh sách chờ duyệt.");
                }
            }

            @Override
            public void onFailure(Call<PostResponse> call, Throwable t) {
                loading.setValue(false);
                error.setValue(t.getMessage());
            }
        });
    }

    public void approveOrRejectPost(String postId, String status, String reason) {
        loading.setValue(true);
        AdminApproveRequest request = new AdminApproveRequest(status, reason);
        
        apiService.approvePost(postId, request).enqueue(new Callback<Post>() {
            @Override
            public void onResponse(Call<Post> call, Response<Post> response) {
                loading.setValue(false);
                if (response.isSuccessful()) {
                    actionSuccess.setValue(true);
                } else {
                    error.setValue("Lỗi xử lý bài viết.");
                }
            }

            @Override
            public void onFailure(Call<Post> call, Throwable t) {
                loading.setValue(false);
                error.setValue(t.getMessage());
            }
        });
    }
}
