package com.studentforum.app.activities;

import android.os.Bundle;
import android.view.View;
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
import com.studentforum.app.utils.AuthManager;

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

        if (isEditMode) {
            fetchPostData();
        }
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

        btnBack.setOnClickListener(v -> finish());
        btnCancel.setOnClickListener(v -> finish());

        btnSave.setOnClickListener(v -> savePost());
        
        btnDeletePost.setOnClickListener(v -> {
            Toast.makeText(this, "Yêu cầu xóa bài viết...", Toast.LENGTH_SHORT).show();
            // TODO: Gọi API Delete Post
        });

        btnUploadImage.setOnClickListener(v -> {
            Toast.makeText(this, "Mở thư viện ảnh...", Toast.LENGTH_SHORT).show();
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

    private void fetchPostData() {
        apiService.getPostDetail(postId).enqueue(new Callback<Post>() {
            @Override
            public void onResponse(Call<Post> call, Response<Post> response) {
                if (response.isSuccessful() && response.body() != null) {
                    Post post = response.body();
                    edtTitle.setText(post.getTitle());
                    edtContent.setText(post.getContent());
                    // Cập nhật Tags, Switch,...
                }
            }
            @Override
            public void onFailure(Call<Post> call, Throwable t) {
                Toast.makeText(CreateEditPostActivity.this, "Lỗi tải bài viết", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void savePost() {
        Toast.makeText(this, "Đang lưu bài viết...", Toast.LENGTH_SHORT).show();
        // TODO: Map dữ liệu từ edtTitle, edtContent, v.v. và gọi apiService.createPost / updatePost
        // finish();
    }
}
