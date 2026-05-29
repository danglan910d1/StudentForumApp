package com.studentforum.app.activities;

import android.os.Bundle;
import android.text.TextUtils;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.CheckBox;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.studentforum.app.R;
import com.studentforum.app.api.ApiClient;
import com.studentforum.app.api.ApiService;
import com.studentforum.app.api.requests.AdminApproveRequest;
import com.studentforum.app.databinding.ActivityAdminApproveDetailBinding;
import com.studentforum.app.models.Post;
import com.studentforum.app.models.Tag;
import com.studentforum.app.utils.AuthManager;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class AdminApproveDetailActivity extends AppCompatActivity {
    private ActivityAdminApproveDetailBinding binding;
    private ApiService apiService;
    private AuthManager authManager;
    private String postId;
    private Post currentPost;
    
    // Map to keep track of tagId and its corresponding Spinner
    private Map<String, Spinner> pendingTagSpinners = new HashMap<>();
    
    // Map to keep track of existing tags and their CheckBoxes
    private Map<String, CheckBox> existingTagCheckboxes = new HashMap<>();

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

        binding.header.btnBack.setOnClickListener(v -> finish());
        binding.header.tvHeaderTitle.setText("Chi tiết kiểm duyệt");

        loadPostDetail();

        binding.btnSubmitApprove.setOnClickListener(v -> submitApproval());
    }

    private void loadPostDetail() {
        apiService.getAdminPostDetail(postId).enqueue(new Callback<Post>() {
            @Override
            public void onResponse(Call<Post> call, Response<Post> response) {
                if (response.isSuccessful() && response.body() != null) {
                    currentPost = response.body();
                    binding.tvTitle.setText(currentPost.getTitle());
                    binding.tvContent.setText(currentPost.getContent());
                    if (currentPost.getAuthor() != null) {
                        binding.tvAuthor.setText("Tác giả: " + currentPost.getAuthor().getName());
                    }
                    
                    renderPendingTags();
                    renderExistingTags();
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

    private void renderPendingTags() {
        List<Tag> pendingTags = currentPost.getPendingTags();
        binding.llPendingTagsContainer.removeAllViews();
        pendingTagSpinners.clear();

        if (pendingTags != null && !pendingTags.isEmpty()) {
            binding.cvPendingTags.setVisibility(View.VISIBLE);
            LayoutInflater inflater = LayoutInflater.from(this);
            for (Tag tag : pendingTags) {
                View itemView = inflater.inflate(R.layout.item_pending_tag, binding.llPendingTagsContainer, false);
                TextView tvTagName = itemView.findViewById(R.id.tvTagName);
                Spinner spinnerAction = itemView.findViewById(R.id.spinnerAction);
                
                tvTagName.setText("#" + tag.getName());
                pendingTagSpinners.put(tag.getId(), spinnerAction);
                
                binding.llPendingTagsContainer.addView(itemView);
            }
        } else {
            binding.cvPendingTags.setVisibility(View.GONE);
        }
    }

    private void renderExistingTags() {
        List<Tag> existingTags = currentPost.getTags();
        binding.llExistingTagsContainer.removeAllViews();
        existingTagCheckboxes.clear();

        if (existingTags != null && !existingTags.isEmpty()) {
            binding.cvExistingTags.setVisibility(View.VISIBLE);
            for (Tag tag : existingTags) {
                CheckBox cb = new CheckBox(this);
                cb.setText("#" + tag.getName());
                cb.setChecked(true); // Default to keep
                existingTagCheckboxes.put(tag.getId(), cb);
                binding.llExistingTagsContainer.addView(cb);
            }
        } else {
            binding.cvExistingTags.setVisibility(View.GONE);
        }
    }

    private void submitApproval() {
        if (currentPost == null) return;
        
        boolean isApproved = binding.rbApprove.isChecked();
        String status = isApproved ? "approved" : "rejected";
        String reason = binding.edtReason.getText().toString().trim();

        if (!isApproved && TextUtils.isEmpty(reason)) {
            Toast.makeText(this, "Vui lòng nhập lý do từ chối", Toast.LENGTH_SHORT).show();
            return;
        }

        // Collect pending tag actions
        List<AdminApproveRequest.PendingTagAction> tagActions = new ArrayList<>();
        for (Map.Entry<String, Spinner> entry : pendingTagSpinners.entrySet()) {
            String tagId = entry.getKey();
            int selectedActionPos = entry.getValue().getSelectedItemPosition();
            String actionString = mapPositionToAction(selectedActionPos);
            tagActions.add(new AdminApproveRequest.PendingTagAction(tagId, actionString));
        }

        // Collect keepTagIds (tags already approved on the post)
        List<String> keepTagIds = new ArrayList<>();
        for (Map.Entry<String, CheckBox> entry : existingTagCheckboxes.entrySet()) {
            if (entry.getValue().isChecked()) {
                keepTagIds.add(entry.getKey());
            }
        }

        AdminApproveRequest request = new AdminApproveRequest(status, reason, tagActions, keepTagIds);

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

    private String mapPositionToAction(int position) {
        switch (position) {
            case 0: return "approve_and_add_topic";
            case 1: return "approve_and_mark_free";
            case 2: return "approve_topic_and_reject_from_post";
            case 3: return "approve_global_and_reject_from_post";
            case 4: return "reject_tag";
            default: return "reject_tag";
        }
    }
}




