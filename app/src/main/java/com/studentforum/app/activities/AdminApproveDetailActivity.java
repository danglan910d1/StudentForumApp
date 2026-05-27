package com.studentforum.app.activities;

import android.os.Bundle;
import android.text.TextUtils;
import android.view.View;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import com.studentforum.app.api.ApiClient;
import com.studentforum.app.api.ApiService;
import com.studentforum.app.api.requests.AdminApproveRequest;
import com.studentforum.app.databinding.ActivityAdminApproveDetailBinding;
import com.studentforum.app.models.Post;
import com.studentforum.app.utils.AuthManager;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class AdminApproveDetailActivity extends AppCompatActivity {
    private ActivityAdminApproveDetailBinding binding;
    private ApiService apiService;
    private AuthManager authManager;
    private String postId;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityAdminApproveDetailBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        postId = getIntent().getStringExtra("postId");
        if (postId == null) {
            Toast.makeText(this, "Không tìm thấy ID bài viết", Toast.LENGTH_SHORT).show();
            finish();
            return;
        }

        authManager = new AuthManager(this);
        apiService = ApiClient.getClient(authManager).create(ApiService.class);

        binding.ivBack.setOnClickListener(v -> finish());

        loadPostDetail();

        binding.btnSubmitApprove.setOnClickListener(v -> submitApproval());
    }

    private void loadPostDetail() {
        apiService.getPostDetail(postId).enqueue(new Callback<Post>() {
            @Override
            public void onResponse(Call<Post> call, Response<Post> response) {
                if (response.isSuccessful() && response.body() != null) {
                    Post post = response.body();
                    binding.tvTitle.setText(post.getTitle());
                    binding.tvContent.setText(post.getContent());
                    if (post.getAuthor() != null) {
                        binding.tvAuthor.setText("Tác giả: " + post.getAuthor().getName());
                    }
                } else {
                    Toast.makeText(AdminApproveDetailActivity.this, "Lỗi tải chi tiết bài viết", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<Post> call, Throwable t) {
                Toast.makeText(AdminApproveDetailActivity.this, "Lỗi kết nối", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void submitApproval() {
        boolean isApproved = binding.rbApprove.isChecked();
        String status = isApproved ? "approved" : "rejected";
        String reason = binding.edtReason.getText().toString().trim();

        if (!isApproved && TextUtils.isEmpty(reason)) {
            Toast.makeText(this, "Vui lòng nhập lý do từ chối", Toast.LENGTH_SHORT).show();
            return;
        }

        AdminApproveRequest request = new AdminApproveRequest(status, reason);
        // Note: Chưa xử lý pendingTagActions và keepTagIds trong phiên bản cơ bản này

        apiService.approvePost(postId, request).enqueue(new Callback<Post>() {
            @Override
            public void onResponse(Call<Post> call, Response<Post> response) {
                if (response.isSuccessful()) {
                    Toast.makeText(AdminApproveDetailActivity.this, "Đã xử lý duyệt bài thành công!", Toast.LENGTH_SHORT).show();
                    setResult(RESULT_OK);
                    finish();
                } else {
                    Toast.makeText(AdminApproveDetailActivity.this, "Duyệt bài thất bại", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<Post> call, Throwable t) {
                Toast.makeText(AdminApproveDetailActivity.this, "Lỗi kết nối khi duyệt bài", Toast.LENGTH_SHORT).show();
            }
        });
    }
}
