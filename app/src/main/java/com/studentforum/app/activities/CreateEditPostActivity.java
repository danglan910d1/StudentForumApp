package com.studentforum.app.activities;

import android.os.Bundle;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.Spinner;
import android.widget.Switch;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.studentforum.app.R;
import com.studentforum.app.api.ApiClient;
import com.studentforum.app.api.ApiService;
import com.studentforum.app.models.Post;
import com.studentforum.app.models.Topic;
import com.studentforum.app.models.responses.TopicResponse;
import com.studentforum.app.utils.AuthManager;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class CreateEditPostActivity extends AppCompatActivity {
    private String postId;
    private boolean isEditMode = false;
    private ApiService apiService;

    private TextView tvHeaderTitle, tvBreadcrumb, btnCancel, btnSave, btnDeletePost;
    private EditText edtTitle, edtContent, edtTags;
    private ImageView btnBack, ivCoverPreview;
    private View btnUploadImage;
    private Spinner spinnerTopic;
    private Switch switchComments, switchAnonymous;

    private List<Topic> topicsList = new ArrayList<>();
    private ArrayAdapter<String> topicAdapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_create_edit_post);

        apiService = ApiClient.getClient(new AuthManager(this)).create(ApiService.class);
        
        if (getIntent() != null && getIntent().hasExtra("POST_ID")) {
            postId = getIntent().getStringExtra("POST_ID");
            isEditMode = true;
        }

        initViews();
        setupMode();
        fetchTopics();
    }

    private void initViews() {
        tvHeaderTitle = findViewById(R.id.tvHeaderTitle);
        tvBreadcrumb = findViewById(R.id.tvBreadcrumb);
        btnCancel = findViewById(R.id.btnCancel);
        btnSave = findViewById(R.id.btnSave);
        btnDeletePost = findViewById(R.id.btnDeletePost);
        
        edtTitle = findViewById(R.id.edtTitle);
        edtContent = findViewById(R.id.edtContent);
        edtTags = findViewById(R.id.edtTags);
        
        btnBack = findViewById(R.id.btnBack);
        ivCoverPreview = findViewById(R.id.ivCoverPreview);
        btnUploadImage = findViewById(R.id.btnUploadImage);
        
        spinnerTopic = findViewById(R.id.spinnerTopic);
        switchComments = findViewById(R.id.switchComments);
        switchAnonymous = findViewById(R.id.switchAnonymous);

        topicAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item, new ArrayList<>());
        topicAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinnerTopic.setAdapter(topicAdapter);

        btnBack.setOnClickListener(v -> finish());
        btnCancel.setOnClickListener(v -> finish());

        btnSave.setOnClickListener(v -> savePost());
        
        btnDeletePost.setOnClickListener(v -> {
            deletePost();
        });

        btnUploadImage.setOnClickListener(v -> {
            Toast.makeText(this, "Tính năng tải ảnh đang cập nhật...", Toast.LENGTH_SHORT).show();
        });
    }

    private void setupMode() {
        if (isEditMode) {
            tvHeaderTitle.setText("Chỉnh sửa bài viết");
            tvBreadcrumb.setText("Bài viết của tôi > Chỉnh sửa bài viết");
            btnDeletePost.setVisibility(View.VISIBLE);
        } else {
            tvHeaderTitle.setText("Tạo bài viết mới");
            tvBreadcrumb.setText("Bài viết của tôi > Tạo bài viết mới");
            btnDeletePost.setVisibility(View.GONE);
        }
    }

    private void fetchTopics() {
        apiService.getTopics().enqueue(new Callback<TopicResponse>() {
            @Override
            public void onResponse(Call<TopicResponse> call, Response<TopicResponse> response) {
                if (response.isSuccessful() && response.body() != null && response.body().getTopics() != null) {
                    topicsList = response.body().getTopics();
                    topicAdapter.clear();
                    for (Topic t : topicsList) {
                        topicAdapter.add(t.getName());
                    }
                    topicAdapter.notifyDataSetChanged();
                    
                    if (isEditMode) {
                        fetchPostData();
                    }
                }
            }

            @Override
            public void onFailure(Call<TopicResponse> call, Throwable t) {
                Toast.makeText(CreateEditPostActivity.this, "Lỗi tải chủ đề", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void fetchPostData() {
        apiService.getPostDetail(postId).enqueue(new Callback<Post>() {
            @Override
            public void onResponse(Call<Post> call, Response<Post> response) {
                if (response.isSuccessful() && response.body() != null) {
                    Post post = response.body();
                    edtTitle.setText(post.getTitle());
                    edtContent.setText(post.getContent());
                    
                    // Set tags
                    if (post.getTags() != null) {
                        List<String> tagNames = new ArrayList<>();
                        for (com.studentforum.app.models.Tag tag : post.getTags()) {
                            tagNames.add(tag.getName());
                        }
                        edtTags.setText(android.text.TextUtils.join(", ", tagNames));
                    }
                    
                    // Set topic
                    if (post.getTopic() != null) {
                        for (int i = 0; i < topicsList.size(); i++) {
                            if (topicsList.get(i).getId().equals(post.getTopic().getId())) {
                                spinnerTopic.setSelection(i);
                                break;
                            }
                        }
                    }
                }
            }
            @Override
            public void onFailure(Call<Post> call, Throwable t) {
                Toast.makeText(CreateEditPostActivity.this, "Lỗi tải bài viết", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void savePost() {
        String title = edtTitle.getText().toString().trim();
        String content = edtContent.getText().toString().trim();
        String tagsInput = edtTags.getText().toString().trim();
        
        if (title.isEmpty() || content.isEmpty() || topicsList.isEmpty()) {
            Toast.makeText(this, "Vui lòng nhập đủ Tiêu đề, Nội dung và Chủ đề", Toast.LENGTH_SHORT).show();
            return;
        }
        
        String topicId = topicsList.get(spinnerTopic.getSelectedItemPosition()).getId();
        
        List<String> tags = new ArrayList<>();
        if (!tagsInput.isEmpty()) {
            for (String tag : tagsInput.split(",")) {
                tags.add(tag.trim());
            }
        }

        Map<String, Object> postData = new HashMap<>();
        postData.put("title", title);
        postData.put("content", content);
        postData.put("topicId", topicId);
        postData.put("tags", tags);

        if (isEditMode) {
            apiService.updatePost(postId, postData).enqueue(new Callback<Post>() {
                @Override
                public void onResponse(Call<Post> call, Response<Post> response) {
                    if (response.isSuccessful()) {
                        Toast.makeText(CreateEditPostActivity.this, "Cập nhật bài viết thành công", Toast.LENGTH_SHORT).show();
                        finish();
                    } else {
                        Toast.makeText(CreateEditPostActivity.this, "Lỗi cập nhật", Toast.LENGTH_SHORT).show();
                    }
                }
                @Override
                public void onFailure(Call<Post> call, Throwable t) {
                    Toast.makeText(CreateEditPostActivity.this, "Lỗi kết nối", Toast.LENGTH_SHORT).show();
                }
            });
        } else {
            apiService.createPost(postData).enqueue(new Callback<Post>() {
                @Override
                public void onResponse(Call<Post> call, Response<Post> response) {
                    if (response.isSuccessful()) {
                        Toast.makeText(CreateEditPostActivity.this, "Đăng bài viết thành công", Toast.LENGTH_SHORT).show();
                        finish();
                    } else {
                        Toast.makeText(CreateEditPostActivity.this, "Lỗi đăng bài", Toast.LENGTH_SHORT).show();
                    }
                }
                @Override
                public void onFailure(Call<Post> call, Throwable t) {
                    Toast.makeText(CreateEditPostActivity.this, "Lỗi kết nối", Toast.LENGTH_SHORT).show();
                }
            });
        }
    }
    
    private void deletePost() {
        if (!isEditMode || postId == null) return;
        apiService.deletePost(postId).enqueue(new Callback<okhttp3.ResponseBody>() {
            @Override
            public void onResponse(Call<okhttp3.ResponseBody> call, Response<okhttp3.ResponseBody> response) {
                if (response.isSuccessful()) {
                    Toast.makeText(CreateEditPostActivity.this, "Đã xóa bài viết", Toast.LENGTH_SHORT).show();
                    finish();
                } else {
                    Toast.makeText(CreateEditPostActivity.this, "Không thể xóa", Toast.LENGTH_SHORT).show();
                }
            }
            @Override
            public void onFailure(Call<okhttp3.ResponseBody> call, Throwable t) {
                Toast.makeText(CreateEditPostActivity.this, "Lỗi kết nối", Toast.LENGTH_SHORT).show();
            }
        });
    }
}
