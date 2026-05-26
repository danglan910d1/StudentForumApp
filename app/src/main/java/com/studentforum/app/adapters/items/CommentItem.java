package com.studentforum.app.adapters.items;

import android.graphics.Color;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;

import androidx.annotation.NonNull;

import com.bumptech.glide.Glide;
import com.mikepenz.fastadapter.binding.AbstractBindingItem;
import com.studentforum.app.R;
import com.studentforum.app.databinding.CommentItemBinding;
import com.studentforum.app.models.Comment;
import com.studentforum.app.utils.AppUtils;

import java.util.List;

public class CommentItem extends AbstractBindingItem<CommentItemBinding> {

    private final Comment comment;
    private final String currentUserId;
    private final OnCommentInteractionListener listener;

    public CommentItem(Comment comment, String currentUserId, OnCommentInteractionListener listener) {
        this.comment = comment;
        this.currentUserId = currentUserId;
        this.listener = listener;
    }

    public Comment getComment() {
        return comment;
    }

    @Override
    public int getType() {
        return R.id.tvContent; // Trả về 1 ID duy nhất từ layout làm ViewType
    }

    @NonNull
    @Override
    public CommentItemBinding createBinding(@NonNull LayoutInflater inflater, ViewGroup parent) {
        return CommentItemBinding.inflate(inflater, parent, false);
    }

    @Override
    public void bindView(@NonNull CommentItemBinding binding, @NonNull List<?> payloads) {
        super.bindView(binding, payloads);

        binding.tvAuthorName.setText(comment.getAuthor() != null ? comment.getAuthor().getName() : "Anonymous");
        binding.tvContent.setText(comment.getContent());
        binding.tvDate.setText(AppUtils.getTimeAgo(comment.getCreatedAt()));
        binding.tvLikeCount.setText(String.valueOf(comment.getLikesCount()));

        // Logic ViewLevel: Thụt lề nếu là Reply (Level > 0)
        ViewGroup.MarginLayoutParams params = (ViewGroup.MarginLayoutParams) binding.getRoot().getLayoutParams();
        if (params == null) {
            params = new ViewGroup.MarginLayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        }
        // Thụt lề 40dp cho mỗi cấp độ
        int marginStart = comment.getViewLevel() * 120; // 120px = ~40dp
        params.setMargins(marginStart, 0, 0, 0);
        binding.getRoot().setLayoutParams(params);

        // Load Avatar
        if (comment.getAuthor() != null && comment.getAuthor().getAvatar() != null && !comment.getAuthor().getAvatar().isEmpty()) {
            Glide.with(binding.getRoot().getContext())
                    .load(AppUtils.getAssetUrl(comment.getAuthor().getAvatar()))
                    .placeholder(R.drawable.ic_profile)
                    .circleCrop()
                    .into(binding.ivAvatar);
        } else {
            binding.ivAvatar.setImageResource(R.drawable.ic_profile);
        }

        // Like Status
        if (comment.isLikedByCurrentUser()) {
            binding.icLike.setImageResource(R.drawable.ic_heart_filled);
            binding.icLike.setColorFilter(Color.parseColor("#EF4444"));
        } else {
            binding.icLike.setImageResource(R.drawable.ic_heart);
            binding.icLike.setColorFilter(Color.parseColor("#6B7280"));
        }
        
        // Logic Delete
        if (currentUserId != null && comment.getAuthor() != null && currentUserId.equals(comment.getAuthor().getId())) {
            binding.btnDelete.setVisibility(View.VISIBLE);
            binding.btnDelete.setOnClickListener(v -> {
                if (listener != null) listener.onDeleteClicked(comment);
            });
        } else {
            binding.btnDelete.setVisibility(View.GONE);
        }
        
        // Logic Reply
        binding.btnReply.setOnClickListener(v -> {
            if (listener != null) listener.onReplyClicked(comment);
        });
        
        // Logic View Replies
        if (comment.getRepliesCount() > 0 && comment.getViewLevel() == 0) {
            binding.btnViewReplies.setVisibility(View.VISIBLE);
            binding.btnViewReplies.setText("Xem " + comment.getRepliesCount() + " phản hồi");
            binding.btnViewReplies.setOnClickListener(v -> {
                if (listener != null) listener.onViewRepliesClicked(comment);
            });
        } else {
            binding.btnViewReplies.setVisibility(View.GONE);
        }
    }

    @Override
    public void unbindView(@NonNull CommentItemBinding binding) {
        super.unbindView(binding);
        binding.tvAuthorName.setText(null);
        binding.tvContent.setText(null);
        binding.tvDate.setText(null);
        binding.tvLikeCount.setText(null);
        binding.ivAvatar.setImageDrawable(null);
        binding.btnViewReplies.setOnClickListener(null);
        binding.btnReply.setOnClickListener(null);
        binding.btnDelete.setOnClickListener(null);
    }
    
    public interface OnCommentInteractionListener {
        void onReplyClicked(Comment comment);
        void onDeleteClicked(Comment comment);
        void onViewRepliesClicked(Comment comment);
    }
}
