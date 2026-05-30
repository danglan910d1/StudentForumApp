package com.studentforum.app.activities;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.MediatorLiveData;
import androidx.lifecycle.ViewModel;
import android.util.Pair;

import com.studentforum.app.api.ApiService;
import com.studentforum.app.models.Post;
import com.studentforum.app.models.Tag;
import com.studentforum.app.models.Topic;
import com.studentforum.app.models.responses.TagResponse;
import com.studentforum.app.models.responses.TopicResponse;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class CreateEditPostViewModel extends ViewModel {
    private final ApiService apiService;

    private final MutableLiveData<List<Topic>> topicsResult = new MutableLiveData<>();
    private final MutableLiveData<List<Tag>> tagsResult = new MutableLiveData<>();
    private final MutableLiveData<Post> postResult = new MutableLiveData<>();
    private final MediatorLiveData<Pair<Post, List<Topic>>> postAndTopicsResult = new MediatorLiveData<>();
    private final MutableLiveData<Boolean> saveSuccess = new MutableLiveData<>();
    private final MutableLiveData<String> errorMessage = new MutableLiveData<>();

    public CreateEditPostViewModel(ApiService apiService) {
        this.apiService = apiService;
        
        postAndTopicsResult.addSource(postResult, post -> {
            List<Topic> topics = topicsResult.getValue();
            if (post != null && topics != null) {
                postAndTopicsResult.setValue(new Pair<>(post, topics));
            }
        });
        
        postAndTopicsResult.addSource(topicsResult, topics -> {
            Post post = postResult.getValue();
            if (post != null && topics != null) {
                postAndTopicsResult.setValue(new Pair<>(post, topics));
            }
        });
    }

    public LiveData<List<Topic>> getTopicsResult() { return topicsResult; }
    public LiveData<List<Tag>> getTagsResult() { return tagsResult; }
    public LiveData<Post> getPostResult() { return postResult; }
    public LiveData<Pair<Post, List<Topic>>> getPostAndTopicsResult() { return postAndTopicsResult; }
    public LiveData<Boolean> getSaveSuccess() { return saveSuccess; }
    public LiveData<String> getErrorMessage() { return errorMessage; }

    public void clearError() {
        errorMessage.setValue(null);
    }

    public void fetchTopics() {
        apiService.getTopics(100).enqueue(new Callback<TopicResponse>() {
            @Override
            public void onResponse(Call<TopicResponse> call, Response<TopicResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    topicsResult.setValue(response.body().getTopics());
                } else {
                    errorMessage.setValue("Lỗi tải chủ đề");
                }
            }

            @Override
            public void onFailure(Call<TopicResponse> call, Throwable t) {
                errorMessage.setValue("Lỗi kết nối");
            }
        });
    }

    public void fetchTags(String topicId) {
        apiService.getTags(topicId, 100).enqueue(new Callback<TagResponse>() {
            @Override
            public void onResponse(Call<TagResponse> call, Response<TagResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    tagsResult.setValue(response.body().getTags());
                }
            }
            @Override
            public void onFailure(Call<TagResponse> call, Throwable t) {}
        });
    }

    public void fetchPostData(String postId) {
        apiService.getPostDetail(postId).enqueue(new Callback<Post>() {
            @Override
            public void onResponse(Call<Post> call, Response<Post> response) {
                if (response.isSuccessful() && response.body() != null) {
                    postResult.setValue(response.body());
                } else {
                    errorMessage.setValue("Lỗi tải chi tiết bài viết");
                }
            }
            @Override
            public void onFailure(Call<Post> call, Throwable t) {
                errorMessage.setValue("Lỗi tải chi tiết bài viết");
            }
        });
    }

    public void savePost(String title, String content, String topicId, List<String> tags, boolean isEditMode, String postId) {
        Map<String, Object> postData = new HashMap<>();
        postData.put("title", title);
        postData.put("content", content);
        postData.put("topicId", topicId);
        postData.put("tags", tags);

        Callback<Post> callback = new Callback<Post>() {
            @Override
            public void onResponse(Call<Post> call, Response<Post> response) {
                if (response.isSuccessful()) {
                    saveSuccess.setValue(true);
                } else {
                    String errorDetail = "";
                    try {
                        if (response.errorBody() != null) {
                            errorDetail = response.errorBody().string();
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                    errorMessage.setValue(isEditMode ? "Lỗi cập nhật: " + errorDetail : "Lỗi đăng bài: " + errorDetail);
                }
            }
            @Override
            public void onFailure(Call<Post> call, Throwable t) {
                errorMessage.setValue("Lỗi mạng");
            }
        };

        if (isEditMode && postId != null) {
            apiService.updatePost(postId, postData).enqueue(callback);
        } else {
            apiService.createPost(postData).enqueue(callback);
        }
    }
}
