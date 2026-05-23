package com.studentforum.app.activities;

import android.os.Bundle;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import android.view.View;

import com.studentforum.app.R;
import com.studentforum.app.api.ApiClient;
import com.studentforum.app.api.ApiService;
import com.studentforum.app.models.Post;
import com.studentforum.app.utils.AuthManager;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import android.widget.EditText;
import com.studentforum.app.adapters.CommentAdapter;
import com.studentforum.app.models.Comment;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

import io.noties.markwon.Markwon;

public class PostDetailActivity extends AppCompatActivity {
    private String postId;
    private ApiService apiService;

    private TextView tvTitle, tvContent, tvCategory, tvTime, tvAuthorName, tvDate, tvLikeCount, tvCommentTitle;
    private ImageView ivCoverImage, ivAuthorAvatar, ivMoreOptions;
    private RecyclerView rvComments;
    private CommentAdapter commentAdapter;
    private EditText edtCommentInput;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_post_detail);

        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayShowTitleEnabled(false);
        }
        toolbar.setNavigationOnClickListener(v -> onBackPressed());

        postId = getIntent().getStringExtra("POST_ID");
        apiService = ApiClient.getClient(new AuthManager(this)).create(ApiService.class);

        initViews();
        fetchPostDetail();
        fetchComments();
    }

    private void initViews() {
        tvTitle = findViewById(R.id.tvTitle);
        tvContent = findViewById(R.id.tvContent);
        tvCategory = findViewById(R.id.tvCategory);
        tvTime = findViewById(R.id.tvTime);
        tvAuthorName = findViewById(R.id.tvAuthorName);
        tvDate = findViewById(R.id.tvDate);
        tvLikeCount = findViewById(R.id.tvLikeCount);
        tvCommentTitle = findViewById(R.id.tvCommentTitle);
        ivCoverImage = findViewById(R.id.ivCoverImage);
        ivAuthorAvatar = findViewById(R.id.ivAuthorAvatar);
        ivMoreOptions = findViewById(R.id.ivMoreOptions);
        rvComments = findViewById(R.id.rvComments);
        edtCommentInput = findViewById(R.id.edtCommentInput);
        
        rvComments.setLayoutManager(new LinearLayoutManager(this));
        commentAdapter = new CommentAdapter(this);
        rvComments.setAdapter(commentAdapter);

        findViewById(R.id.btnSendComment).setOnClickListener(v -> sendComment());
        
        findViewById(R.id.btnLike).setOnClickListener(v -> {
            ImageView ivLikeIcon = findViewById(R.id.ivLikeIcon);
            TextView tvLikeCount = findViewById(R.id.tvLikeCount);
            
            apiService.toggleLikePost(postId).enqueue(new Callback<okhttp3.ResponseBody>() {
                @Override
                public void onResponse(Call<okhttp3.ResponseBody> call, Response<okhttp3.ResponseBody> response) {
                    if (response.isSuccessful() && response.body() != null) {
                        try {
                            String jsonString = response.body().string();
                            org.json.JSONObject jsonObject = new org.json.JSONObject(jsonString);
                            boolean isLiked = jsonObject.getBoolean("isLiked");
                            int likeCount = jsonObject.getInt("likeCount");
                            
                            if (ivLikeIcon != null && tvLikeCount != null) {
                                if (isLiked) {
                                    ivLikeIcon.setImageResource(R.drawable.ic_heart_filled);
                                    ivLikeIcon.setColorFilter(android.graphics.Color.parseColor("#EF4444"));
                                } else {
                                    ivLikeIcon.setImageResource(R.drawable.ic_heart);
                                    ivLikeIcon.setColorFilter(android.graphics.Color.parseColor("#6B7280"));
                                }
                                tvLikeCount.setText(String.valueOf(likeCount));
                            }
                        } catch (Exception e) {
                            fetchPostDetail();
                        }
                    } else {
                        Toast.makeText(PostDetailActivity.this, "Lỗi thả tim", Toast.LENGTH_SHORT).show();
                    }
                }
                @Override
                public void onFailure(Call<okhttp3.ResponseBody> call, Throwable t) {}
            });
        });
    }

    private void fetchPostDetail() {
        if (postId == null) return;

        View layoutLoading = findViewById(R.id.layoutLoading);
        if (layoutLoading != null) layoutLoading.setVisibility(android.view.View.VISIBLE);

        apiService.getPostDetail(postId).enqueue(new Callback<Post>() {
            @Override
            public void onResponse(Call<Post> call, Response<Post> response) {
                if (layoutLoading != null) layoutLoading.setVisibility(android.view.View.GONE);
                if (response.isSuccessful() && response.body() != null) {
                    displayPost(response.body());
                } else {
                    Toast.makeText(PostDetailActivity.this, "Lỗi tải bài viết", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<Post> call, Throwable t) {
                Toast.makeText(PostDetailActivity.this, "Lỗi kết nối", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void displayPost(Post post) {
        tvTitle.setText(post.getTitle());
        
        if (post.getTopic() != null) {
            tvCategory.setText(post.getTopic().getName());
        }
        
        if (post.getAuthor() != null) {
            tvAuthorName.setText(post.getAuthor().getName());
        }

        tvDate.setText(post.getCreatedAt()); // Format lại thời gian nếu cần
        tvLikeCount.setText(String.valueOf(post.getLikesCount()));

        // Xử lý logic ẩn/hiện ảnh bìa (Cover Image)
        if (post.getCoverImage() != null && !post.getCoverImage().trim().isEmpty()) {
            ivCoverImage.setVisibility(android.view.View.VISIBLE);
            String coverUrl = com.studentforum.app.utils.AppUtils.getAssetUrl(post.getCoverImage());
            com.bumptech.glide.Glide.with(this).load(coverUrl).into(ivCoverImage);
        } else {
            ivCoverImage.setVisibility(android.view.View.VISIBLE);
            ivCoverImage.setImageResource(R.drawable.bg_library);
        }

        if (post.getAuthor() != null && post.getAuthor().getAvatar() != null && !post.getAuthor().getAvatar().isEmpty()) {
            String avatarUrl = com.studentforum.app.utils.AppUtils.getAssetUrl(post.getAuthor().getAvatar());
            com.bumptech.glide.Glide.with(this)
                    .load(avatarUrl)
                    .placeholder(R.drawable.ic_profile)
                    .circleCrop()
                    .into(ivAuthorAvatar);
        } else {
            ivAuthorAvatar.setImageResource(R.drawable.ic_profile);
        }

        ImageView ivLikeIcon = findViewById(R.id.ivLikeIcon);
        if (ivLikeIcon != null) {
            if (post.isLikedByCurrentUser()) {
                ivLikeIcon.setImageResource(R.drawable.ic_heart_filled);
                ivLikeIcon.setColorFilter(android.graphics.Color.parseColor("#EF4444"));
            } else {
                ivLikeIcon.setImageResource(R.drawable.ic_heart);
                ivLikeIcon.setColorFilter(android.graphics.Color.parseColor("#6B7280"));
            }
        }

        // --- Logic Nút More Options (3 chấm) ---
        AuthManager authManager = new AuthManager(this);
        if (authManager.getUserId() != null && post.getAuthor() != null && authManager.getUserId().equals(post.getAuthor().getId())) {
            ivMoreOptions.setVisibility(android.view.View.VISIBLE);
            ivMoreOptions.setOnClickListener(v -> {
                android.widget.PopupMenu popup = new android.widget.PopupMenu(this, ivMoreOptions);
                popup.getMenu().add("Chỉnh sửa bài viết");
                popup.getMenu().add("Xóa bài viết");
                popup.setOnMenuItemClickListener(item -> {
                    if (item.getTitle().equals("Chỉnh sửa bài viết")) {
                        android.content.Intent intent = new android.content.Intent(this, CreateEditPostActivity.class);
                        intent.putExtra("POST_ID", post.getId());
                        startActivity(intent);
                    } else {
                        Toast.makeText(this, "Đã gửi yêu cầu xóa bài viết", Toast.LENGTH_SHORT).show();
                    }
                    return true;
                });
                popup.show();
            });
        } else {
            ivMoreOptions.setVisibility(android.view.View.GONE);
        }

        // Markwon tự render nội dung sang HTML:
        Markwon markwon = Markwon.create(this);
        markwon.setMarkdown(tvContent, post.getContent() != null ? post.getContent() : "");
    }

    private void fetchComments() {
        if (postId == null) return;
        apiService.getComments(postId).enqueue(new Callback<List<Comment>>() {
            @Override
            public void onResponse(Call<List<Comment>> call, Response<List<Comment>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    commentAdapter.setComments(response.body());
                    tvCommentTitle.setText("Bình luận (" + response.body().size() + ")");
                }
            }
            @Override
            public void onFailure(Call<List<Comment>> call, Throwable t) {}
        });
    }

    private void sendComment() {
        String content = edtCommentInput.getText().toString().trim();
        if (content.isEmpty()) return;
        
        Map<String, Object> data = new java.util.HashMap<>();
        data.put("postId", postId);
        data.put("content", content);
        data.put("parentId", null);
        
        apiService.addComment(postId, data).enqueue(new Callback<Comment>() {
            @Override
            public void onResponse(Call<Comment> call, Response<Comment> response) {
                if (response.isSuccessful()) {
                    edtCommentInput.setText("");
                    fetchComments(); // Reload
                } else {
                    try {
                        String err = response.errorBody() != null ? response.errorBody().string() : "Lỗi gửi bình luận";
                        Toast.makeText(PostDetailActivity.this, err, Toast.LENGTH_LONG).show();
                    } catch(Exception e) {
                        Toast.makeText(PostDetailActivity.this, "Lỗi gửi bình luận", Toast.LENGTH_SHORT).show();
                    }
                }
            }
            @Override
            public void onFailure(Call<Comment> call, Throwable t) {
                Toast.makeText(PostDetailActivity.this, "Lỗi mạng", Toast.LENGTH_SHORT).show();
            }
        });
    }
}
