package com.studentforum.app.adapters;

import android.content.Context;
import android.content.Intent;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.studentforum.app.R;
import com.studentforum.app.models.Post;

import java.util.ArrayList;
import java.util.List;

public class PostAdapter extends RecyclerView.Adapter<PostAdapter.PostViewHolder> {
    private List<Post> postList = new ArrayList<>();
    private final Context context;
    private OnPostClickListener listener;

    public interface OnPostClickListener {
        void onPostClick(Post post);
        void onAuthorClick(Post post);
        void onLikeClick(Post post, int position);
    }

    public PostAdapter(Context context) {
        this.context = context;
    }

    public void setOnPostClickListener(OnPostClickListener listener) {
        this.listener = listener;
    }

    public void setPosts(List<Post> posts) {
        this.postList = posts;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public PostViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.post_card, parent, false);
        return new PostViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull PostViewHolder holder, int position) {
        Post post = postList.get(position);
        
        holder.tvTitle.setText(post.getTitle() != null ? post.getTitle() : "");
        holder.tvContent.setText(post.getContent() != null ? post.getContent() : "");
        holder.tvLikeCount.setText(String.valueOf(post.getLikesCount()));
        holder.tvCommentCount.setText(String.valueOf(post.getCommentsCount()));
        
        // Đổi màu icon Like
        if (post.isLikedByCurrentUser()) {
            holder.icLike.setImageResource(R.drawable.ic_heart_filled);
            holder.icLike.setColorFilter(android.graphics.Color.parseColor("#EF4444"));
        } else {
            holder.icLike.setImageResource(R.drawable.ic_heart);
            holder.icLike.setColorFilter(android.graphics.Color.parseColor("#6B7280"));
        }
        
        if (post.getTopic() != null) {
            holder.tvCategory.setText(post.getTopic().getName());
            holder.tvCategory.setVisibility(View.VISIBLE);
        } else {
            holder.tvCategory.setVisibility(View.GONE);
        }
        
        if (post.getAuthor() != null) {
            holder.tvAuthorName.setText(post.getAuthor().getName());
            if (post.getAuthor().getAvatar() != null && !post.getAuthor().getAvatar().isEmpty()) {
                String avatarUrl = com.studentforum.app.utils.AppUtils.getAssetUrl(post.getAuthor().getAvatar());
                com.bumptech.glide.Glide.with(context)
                        .load(avatarUrl)
                        .placeholder(R.drawable.ic_profile)
                        .circleCrop()
                        .into(holder.ivAuthorAvatar);
            } else {
                holder.ivAuthorAvatar.setImageResource(R.drawable.ic_profile);
            }
        }

        // --- Logic Click riêng biệt ---
        holder.itemView.setOnClickListener(v -> {
            if (listener != null) listener.onPostClick(post);
        });

        View.OnClickListener authorClickListener = v -> {
            if (listener != null) listener.onAuthorClick(post);
        };
        holder.tvAuthorName.setOnClickListener(authorClickListener);
        holder.ivAuthorAvatar.setOnClickListener(authorClickListener);

        holder.icLike.setOnClickListener(v -> {
            // 1. Optimistic Update
            boolean isCurrentlyLiked = post.isLikedByCurrentUser();
            post.setLikedByCurrentUser(!isCurrentlyLiked);
            post.setLikesCount(post.getLikesCount() + (isCurrentlyLiked ? -1 : 1));

            // 2. Kích hoạt re-bind cho hàng này để cập nhật màu icon và số đếm
            notifyItemChanged(position);

            // 3. Bắn event lên Activity
            if (listener != null) listener.onLikeClick(post, position);
        });
    }

    @Override
    public int getItemCount() {
        return postList.size();
    }

    public static class PostViewHolder extends RecyclerView.ViewHolder {
        TextView tvTitle, tvContent, tvCategory, tvAuthorName, tvLikeCount, tvCommentCount;
        ImageView ivCover, ivAuthorAvatar, icLike;

        public PostViewHolder(@NonNull View itemView) {
            super(itemView);
            tvTitle = itemView.findViewById(R.id.tvTitle);
            tvContent = itemView.findViewById(R.id.tvContent);
            tvCategory = itemView.findViewById(R.id.tvCategory);
            tvAuthorName = itemView.findViewById(R.id.tvAuthorName);
            tvLikeCount = itemView.findViewById(R.id.tvLikeCount);
            tvCommentCount = itemView.findViewById(R.id.tvCommentCount);
            
            ivAuthorAvatar = itemView.findViewById(R.id.ivAuthorAvatar);
            icLike = itemView.findViewById(R.id.icLike);
        }
    }
}
