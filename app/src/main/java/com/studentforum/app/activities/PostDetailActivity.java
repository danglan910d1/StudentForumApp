package com.studentforum.app.activities;

import android.content.Intent;
import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.widget.PopupMenu;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;

import com.bumptech.glide.Glide;
import com.mikepenz.fastadapter.FastAdapter;
import com.mikepenz.fastadapter.adapters.ItemAdapter;
import com.studentforum.app.R;
import com.studentforum.app.adapters.items.CommentItem;
import com.studentforum.app.api.ApiClient;
import com.studentforum.app.api.ApiService;
import com.studentforum.app.databinding.ActivityPostDetailBinding;
import com.studentforum.app.models.Comment;
import com.studentforum.app.models.Post;
import com.studentforum.app.models.responses.CommentResponse;
import com.studentforum.app.utils.AppUtils;
import com.studentforum.app.utils.AuthManager;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import io.noties.markwon.Markwon;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class PostDetailActivity extends AppCompatActivity implements CommentItem.OnCommentInteractionListener {
    private String postId;
    private ApiService apiService;
    private ActivityPostDetailBinding binding;

    private ItemAdapter<CommentItem> commentItemAdapter;
    private FastAdapter<CommentItem> fastAdapter;

    private Post currentPost;
    private AuthManager authManager;
    private String currentUserId;
    
    private String replyingToCommentId = null;
    private String editingCommentId = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityPostDetailBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        authManager = new AuthManager(this);
        currentUserId = authManager.getUserId();

        setSupportActionBar(binding.toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayShowTitleEnabled(false);
        }
        binding.toolbar.setNavigationOnClickListener(v -> onBackPressed());

        postId = getIntent().getStringExtra("POST_ID");
        apiService = ApiClient.getClient(authManager).create(ApiService.class);

        initViews();
        fetchPostDetail();
        fetchComments();
    }

    private void initViews() {
        commentItemAdapter = new ItemAdapter<>();
        fastAdapter = FastAdapter.with(commentItemAdapter);

        binding.rvComments.setLayoutManager(new LinearLayoutManager(this));
        binding.rvComments.setAdapter(fastAdapter);

        binding.btnSendComment.setOnClickListener(v -> sendComment());

        binding.btnLike.setOnClickListener(v -> {
            if (currentPost == null) return;
            boolean isCurrentlyLiked = currentPost.isLikedByCurrentUser();
            boolean newLikedState = !isCurrentlyLiked;
            int newLikesCount = currentPost.getLikesCount() + (isCurrentlyLiked ? -1 : 1);

            currentPost.setLikedByCurrentUser(newLikedState);
            currentPost.setLikesCount(newLikesCount);

            updateLikeUI(newLikedState, newLikesCount);

            com.studentforum.app.viewmodels.PostViewModel.postLikeEventBus.postValue(
                    new com.studentforum.app.viewmodels.PostViewModel.PostLikeEvent(currentPost.getId(), newLikedState, newLikesCount)
            );

            apiService.toggleLikePost(postId).enqueue(new Callback<okhttp3.ResponseBody>() {
                @Override
                public void onResponse(Call<okhttp3.ResponseBody> call, Response<okhttp3.ResponseBody> response) {
                    if (!response.isSuccessful()) revertLike(isCurrentlyLiked);
                }

                @Override
                public void onFailure(Call<okhttp3.ResponseBody> call, Throwable t) {
                    revertLike(isCurrentlyLiked);
                }
            });
        });
    }

    private void revertLike(boolean originalState) {
        currentPost.setLikedByCurrentUser(originalState);
        currentPost.setLikesCount(currentPost.getLikesCount() + (originalState ? 1 : -1));
        updateLikeUI(currentPost.isLikedByCurrentUser(), currentPost.getLikesCount());
        com.studentforum.app.viewmodels.PostViewModel.postLikeEventBus.postValue(
                new com.studentforum.app.viewmodels.PostViewModel.PostLikeEvent(currentPost.getId(), originalState, currentPost.getLikesCount())
        );
    }

    private void updateLikeUI(boolean isLiked, int count) {
        if (isLiked) {
            binding.ivLikeIcon.setImageResource(R.drawable.ic_heart_filled);
            binding.ivLikeIcon.setColorFilter(Color.parseColor("#EF4444"));
        } else {
            binding.ivLikeIcon.setImageResource(R.drawable.ic_heart);
            binding.ivLikeIcon.setColorFilter(Color.parseColor("#6B7280"));
        }
        binding.tvLikeCount.setText(String.valueOf(count));
    }

    private void fetchPostDetail() {
        if (postId == null) return;
        apiService.getPostDetail(postId).enqueue(new Callback<Post>() {
            @Override
            public void onResponse(Call<Post> call, Response<Post> response) {
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
        this.currentPost = post;
        binding.tvTitle.setText(post.getTitle());

        if (post.getTopic() != null) binding.tvCategory.setText(post.getTopic().getName());
        if (post.getAuthor() != null) binding.tvAuthorName.setText(post.getAuthor().getName());
        binding.tvTime.setText(AppUtils.getTimeAgo(post.getCreatedAt()));
        binding.tvDate.setText("Đã đăng vào " + AppUtils.formatDate(post.getCreatedAt()));
        updateLikeUI(post.isLikedByCurrentUser(), post.getLikesCount());

        if (post.getCoverImage() != null && !post.getCoverImage().trim().isEmpty()) {
            binding.ivCoverImage.setVisibility(View.VISIBLE);
            Glide.with(this).load(AppUtils.getAssetUrl(post.getCoverImage())).into(binding.ivCoverImage);
        } else {
            binding.ivCoverImage.setVisibility(View.VISIBLE);
            binding.ivCoverImage.setImageResource(R.drawable.bg_library);
        }

        if (post.getAuthor() != null && post.getAuthor().getAvatar() != null && !post.getAuthor().getAvatar().isEmpty()) {
            Glide.with(this)
                    .load(AppUtils.getAssetUrl(post.getAuthor().getAvatar()))
                    .placeholder(R.drawable.ic_profile)
                    .circleCrop()
                    .into(binding.ivAuthorAvatar);
        } else {
            binding.ivAuthorAvatar.setImageResource(R.drawable.ic_profile);
        }

        if (post.getAuthor() != null) {
            View.OnClickListener profileClickListener = v -> {
                Intent intent = new Intent(PostDetailActivity.this, ProfileActivity.class);
                intent.putExtra("USER_ID", post.getAuthor().getId());
                startActivity(intent);
            };
            binding.ivAuthorAvatar.setOnClickListener(profileClickListener);
            binding.tvAuthorName.setOnClickListener(profileClickListener);
        }

        if (currentUserId != null && post.getAuthor() != null && currentUserId.equals(post.getAuthor().getId())) {
            binding.ivMoreOptions.setVisibility(View.VISIBLE);
            binding.ivMoreOptions.setOnClickListener(v -> showOwnerMenu(post));
        } else {
            binding.ivMoreOptions.setVisibility(View.GONE);
        }

        Markwon markwon = Markwon.create(this);
        markwon.setMarkdown(binding.tvContent, post.getContent() != null ? post.getContent() : "");
    }

    private void showOwnerMenu(Post post) {
        PopupMenu popup = new PopupMenu(this, binding.ivMoreOptions);
        popup.getMenu().add("Chỉnh sửa bài viết");
        popup.getMenu().add("Xóa bài viết");
        popup.setOnMenuItemClickListener(item -> {
            if (item.getTitle().equals("Chỉnh sửa bài viết")) {
                Intent intent = new Intent(this, CreateEditPostActivity.class);
                intent.putExtra("POST_ID", post.getId());
                startActivity(intent);
            } else {
                deletePost();
            }
            return true;
        });
        popup.show();
    }

    private void deletePost() {
        apiService.deletePost(postId).enqueue(new Callback<okhttp3.ResponseBody>() {
            @Override
            public void onResponse(Call<okhttp3.ResponseBody> call, Response<okhttp3.ResponseBody> response) {
                if (response.isSuccessful()) {
                    Toast.makeText(PostDetailActivity.this, "Đã xóa bài viết", Toast.LENGTH_SHORT).show();
                    finish();
                } else {
                    Toast.makeText(PostDetailActivity.this, "Không thể xóa bài viết", Toast.LENGTH_SHORT).show();
                }
            }
            @Override
            public void onFailure(Call<okhttp3.ResponseBody> call, Throwable t) {
                Toast.makeText(PostDetailActivity.this, "Lỗi kết nối", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void fetchComments() {
        if (postId == null) return;
        apiService.getComments(postId).enqueue(new Callback<CommentResponse>() {
            @Override
            public void onResponse(Call<CommentResponse> call, Response<CommentResponse> response) {
                if (response.isSuccessful() && response.body() != null && response.body().getComments() != null) {
                    List<Comment> rawComments = response.body().getComments();
                    List<CommentItem> items = new ArrayList<>();
                    for (Comment c : rawComments) {
                        c.setViewLevel(0);
                        items.add(new CommentItem(c, currentUserId, PostDetailActivity.this));
                    }
                    commentItemAdapter.set(items);
                    binding.tvCommentTitle.setText("Bình luận (" + items.size() + ")");
                }
            }
            @Override
            public void onFailure(Call<CommentResponse> call, Throwable t) {
                Toast.makeText(PostDetailActivity.this, "Lỗi kết nối bình luận", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void sendComment() {
        String content = binding.edtCommentInput.getText().toString().trim();
        if (content.isEmpty()) return;

        Map<String, Object> data = new HashMap<>();
        data.put("content", content);
        
        if (editingCommentId != null) {
            // Cập nhật bình luận
            apiService.updateComment(editingCommentId, data).enqueue(new Callback<Comment>() {
                @Override
                public void onResponse(Call<Comment> call, Response<Comment> response) {
                    if (response.isSuccessful() && response.body() != null) {
                        binding.edtCommentInput.setText("");
                        binding.edtCommentInput.setHint("Thêm bình luận...");
                        String updatedId = editingCommentId;
                        editingCommentId = null;
                        
                        for (int i = 0; i < commentItemAdapter.getAdapterItemCount(); i++) {
                            if (commentItemAdapter.getAdapterItem(i).getComment().getId().equals(updatedId)) {
                                commentItemAdapter.getAdapterItem(i).getComment().setContent(content);
                                fastAdapter.notifyItemChanged(i);
                                break;
                            }
                        }
                    } else {
                        Toast.makeText(PostDetailActivity.this, "Lỗi cập nhật bình luận", Toast.LENGTH_SHORT).show();
                    }
                }
                @Override
                public void onFailure(Call<Comment> call, Throwable t) {
                    Toast.makeText(PostDetailActivity.this, "Lỗi mạng", Toast.LENGTH_SHORT).show();
                }
            });
            return;
        }

        data.put("postId", postId);
        data.put("parentId", replyingToCommentId); // Sử dụng replyingToCommentId

        apiService.addComment(data).enqueue(new Callback<Comment>() {
            @Override
            public void onResponse(Call<Comment> call, Response<Comment> response) {
                if (response.isSuccessful() && response.body() != null) {
                    binding.edtCommentInput.setText("");
                    binding.edtCommentInput.setHint("Thêm bình luận...");
                    
                    Comment newComment = response.body();
                    String parentId = replyingToCommentId;
                    replyingToCommentId = null; // Reset lại
                    
                    if (parentId != null) {
                        newComment.setViewLevel(1);
                        int insertPosition = -1;
                        for (int i = 0; i < commentItemAdapter.getAdapterItemCount(); i++) {
                            if (commentItemAdapter.getAdapterItem(i).getComment().getId().equals(parentId)) {
                                insertPosition = i + 1;
                                while (insertPosition < commentItemAdapter.getAdapterItemCount() && 
                                       commentItemAdapter.getAdapterItem(insertPosition).getComment().getViewLevel() > 0) {
                                    insertPosition++;
                                }
                                break;
                            }
                        }
                        if (insertPosition != -1) {
                            commentItemAdapter.add(insertPosition, new CommentItem(newComment, currentUserId, PostDetailActivity.this));
                        } else {
                            fetchComments();
                        }
                    } else {
                        newComment.setViewLevel(0);
                        commentItemAdapter.add(0, new CommentItem(newComment, currentUserId, PostDetailActivity.this));
                        binding.tvCommentTitle.setText("Bình luận (" + commentItemAdapter.getAdapterItemCount() + ")");
                    }
                } else {
                    Toast.makeText(PostDetailActivity.this, "Lỗi gửi bình luận", Toast.LENGTH_SHORT).show();
                }
            }
            @Override
            public void onFailure(Call<Comment> call, Throwable t) {
                Toast.makeText(PostDetailActivity.this, "Lỗi mạng", Toast.LENGTH_SHORT).show();
            }
        });
    }

    @Override
    public void onReplyClicked(Comment comment) {
        replyingToCommentId = comment.getId();
        editingCommentId = null; // Huỷ edit nếu đang edit
        binding.edtCommentInput.setHint("Đang trả lời " + (comment.getAuthor() != null ? comment.getAuthor().getName() : "người này") + "...");
        binding.edtCommentInput.requestFocus();
    }

    @Override
    public void onEditClicked(Comment comment) {
        editingCommentId = comment.getId();
        replyingToCommentId = null; // Huỷ reply nếu đang reply
        binding.edtCommentInput.setText(comment.getContent());
        binding.edtCommentInput.setHint("Đang chỉnh sửa bình luận...");
        binding.edtCommentInput.requestFocus();
    }

    @Override
    public void onDeleteClicked(Comment comment) {
        apiService.deleteComment(comment.getId()).enqueue(new Callback<okhttp3.ResponseBody>() {
            @Override
            public void onResponse(Call<okhttp3.ResponseBody> call, Response<okhttp3.ResponseBody> response) {
                if (response.isSuccessful()) {
                    Toast.makeText(PostDetailActivity.this, "Đã xóa bình luận", Toast.LENGTH_SHORT).show();
                    for (int i = 0; i < commentItemAdapter.getAdapterItemCount(); i++) {
                        if (commentItemAdapter.getAdapterItem(i).getComment().getId().equals(comment.getId())) {
                            commentItemAdapter.remove(i);
                            break;
                        }
                    }
                    binding.tvCommentTitle.setText("Bình luận (" + commentItemAdapter.getAdapterItemCount() + ")");
                } else {
                    Toast.makeText(PostDetailActivity.this, "Không thể xóa bình luận", Toast.LENGTH_SHORT).show();
                }
            }
            @Override
            public void onFailure(Call<okhttp3.ResponseBody> call, Throwable t) {
                Toast.makeText(PostDetailActivity.this, "Lỗi kết nối", Toast.LENGTH_SHORT).show();
            }
        });
    }

    @Override
    public void onViewRepliesClicked(Comment comment) {
        apiService.getReplies(postId, comment.getId()).enqueue(new Callback<CommentResponse>() {
            @Override
            public void onResponse(Call<CommentResponse> call, Response<CommentResponse> response) {
                if (response.isSuccessful() && response.body() != null && response.body().getComments() != null) {
                    List<Comment> replies = response.body().getComments();
                    List<CommentItem> replyItems = new ArrayList<>();
                    for (Comment r : replies) {
                        r.setViewLevel(comment.getViewLevel() + 1);
                        replyItems.add(new CommentItem(r, currentUserId, PostDetailActivity.this));
                    }
                    
                    // Tìm vị trí của comment cha để chèn vào bên dưới
                    int position = -1;
                    for (int i = 0; i < commentItemAdapter.getAdapterItemCount(); i++) {
                        if (commentItemAdapter.getAdapterItem(i).getComment().getId().equals(comment.getId())) {
                            position = i;
                            break;
                        }
                    }
                    if (position != -1) {
                        commentItemAdapter.add(position + 1, replyItems);
                        // Cập nhật lại UI nút "Xem phản hồi"
                        commentItemAdapter.getAdapterItem(position).getComment().setRepliesCount(0); // Ẩn nút đi
                        fastAdapter.notifyItemChanged(position);
                    }
                }
            }

            @Override
            public void onFailure(Call<CommentResponse> call, Throwable t) {
                Toast.makeText(PostDetailActivity.this, "Lỗi tải phản hồi", Toast.LENGTH_SHORT).show();
            }
        });
    }

    @Override
    public void onLikeClicked(Comment comment) {
        apiService.toggleLikeComment(comment.getId()).enqueue(new Callback<okhttp3.ResponseBody>() {
            @Override
            public void onResponse(Call<okhttp3.ResponseBody> call, Response<okhttp3.ResponseBody> response) {
                if (response.isSuccessful()) {
                    boolean isLiked = comment.isLikedByCurrentUser();
                    comment.setLikedByCurrentUser(!isLiked);
                    comment.setLikesCount(comment.getLikesCount() + (!isLiked ? 1 : -1));
                    
                    for (int i = 0; i < commentItemAdapter.getAdapterItemCount(); i++) {
                        if (commentItemAdapter.getAdapterItem(i).getComment().getId().equals(comment.getId())) {
                            fastAdapter.notifyItemChanged(i);
                            break;
                        }
                    }
                }
            }

            @Override
            public void onFailure(Call<okhttp3.ResponseBody> call, Throwable t) {
                Toast.makeText(PostDetailActivity.this, "Lỗi kết nối", Toast.LENGTH_SHORT).show();
            }
        });
    }
}
