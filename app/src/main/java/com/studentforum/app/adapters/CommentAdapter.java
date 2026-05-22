package com.studentforum.app.adapters;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.studentforum.app.R;
import com.studentforum.app.models.Comment;

import java.util.ArrayList;
import java.util.List;

public class CommentAdapter extends RecyclerView.Adapter<CommentAdapter.CommentViewHolder> {
    private List<Comment> commentList = new ArrayList<>();
    private final Context context;

    public CommentAdapter(Context context) {
        this.context = context;
    }

    public void setComments(List<Comment> comments) {
        this.commentList = comments;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public CommentViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        // Tạm thời dùng layout mặc định hoặc tự tạo file comment_item.xml
        View view = LayoutInflater.from(context).inflate(R.layout.comment_item, parent, false);
        return new CommentViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull CommentViewHolder holder, int position) {
        Comment comment = commentList.get(position);
        
        holder.tvContent.setText(comment.getContent());
        
        if (comment.getAuthor() != null) {
            holder.tvAuthorName.setText(comment.getAuthor().getName());
            if (comment.getAuthor().getAvatar() != null && !comment.getAuthor().getAvatar().isEmpty()) {
                String avatarUrl = com.studentforum.app.utils.AppUtils.getAssetUrl(comment.getAuthor().getAvatar());
                com.bumptech.glide.Glide.with(context)
                        .load(avatarUrl)
                        .placeholder(R.drawable.ic_profile)
                        .circleCrop()
                        .into(holder.ivAvatar);
            } else {
                holder.ivAvatar.setImageResource(R.drawable.ic_profile);
            }
        }
        
        holder.tvDate.setText(comment.getCreatedAt()); // Dùng thư viện chuyển sang "Vừa xong"
        
        // Optimistic Update cho Like Comment tương tự PostAdapter
        holder.tvLikeCount.setText(String.valueOf(comment.getLikesCount()));
        
        if (comment.isLikedByCurrentUser()) {
            holder.icLike.setImageResource(R.drawable.ic_heart_filled);
            holder.icLike.setColorFilter(android.graphics.Color.parseColor("#EF4444"));
        } else {
            holder.icLike.setImageResource(R.drawable.ic_heart);
            holder.icLike.setColorFilter(android.graphics.Color.parseColor("#6B7280"));
        }
    }

    @Override
    public int getItemCount() {
        return commentList.size();
    }

    public static class CommentViewHolder extends RecyclerView.ViewHolder {
        TextView tvAuthorName, tvContent, tvDate, tvLikeCount;
        ImageView ivAvatar, icLike;

        public CommentViewHolder(@NonNull View itemView) {
            super(itemView);
            tvAuthorName = itemView.findViewById(R.id.tvAuthorName);
            tvContent = itemView.findViewById(R.id.tvContent);
            tvDate = itemView.findViewById(R.id.tvDate);
            tvLikeCount = itemView.findViewById(R.id.tvLikeCount);
            
            ivAvatar = itemView.findViewById(R.id.ivAvatar);
            icLike = itemView.findViewById(R.id.icLike);
        }
    }
}
