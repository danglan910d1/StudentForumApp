package com.studentforum.app.adapters;

import android.content.Context;
import android.graphics.Color;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.studentforum.app.R;
import com.studentforum.app.models.Notification;
import com.studentforum.app.components.AuthorAvatarView;
import com.studentforum.app.models.User;
import com.studentforum.app.utils.AppUtils;

import java.util.ArrayList;
import java.util.List;

public class NotificationAdapter extends RecyclerView.Adapter<NotificationAdapter.NotificationViewHolder> {

    private Context context;
    private List<Notification> notificationList = new ArrayList<>();
    private OnNotificationClickListener listener;

    public interface OnNotificationClickListener {
        void onNotificationClick(Notification notification, int position);
    }

    public NotificationAdapter(Context context, OnNotificationClickListener listener) {
        this.context = context;
        this.listener = listener;
    }

    public void setNotifications(List<Notification> notifications) {
        this.notificationList = notifications;
        notifyDataSetChanged();
    }

    public void addNotifications(List<Notification> newNotifications) {
        int startPosition = this.notificationList.size();
        this.notificationList.addAll(newNotifications);
        notifyItemRangeInserted(startPosition, newNotifications.size());
    }

    public void markAsRead(int position) {
        if (position >= 0 && position < notificationList.size()) {
            notificationList.get(position).setRead(true);
            notifyItemChanged(position);
        }
    }

    @NonNull
    @Override
    public NotificationViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.item_notification, parent, false);
        return new NotificationViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull NotificationViewHolder holder, int position) {
        Notification noti = notificationList.get(position);

        holder.tvContent.setText(noti.getContent());
        holder.tvTime.setText(AppUtils.getTimeAgo(noti.getCreatedAt()));

        // Sender Avatar
        if (noti.getSender() != null) {
            User mockUser = new User();
            mockUser.setId(noti.getSender().getUserId());
            mockUser.setName(noti.getSender().getName());
            mockUser.setAvatar(noti.getSender().getAvatar());
            holder.ivAvatar.setAuthor(mockUser);
        } else {
            holder.ivAvatar.setAuthor(null);
        }

        // Unread styling
        if (!noti.isRead()) {
            holder.itemView.setBackgroundColor(Color.parseColor("#F3F4F6")); // Nền xanh nhạt/xám nhạt
            holder.viewUnreadDot.setVisibility(View.VISIBLE);
        } else {
            holder.itemView.setBackgroundColor(Color.TRANSPARENT);
            holder.viewUnreadDot.setVisibility(View.GONE);
        }

        holder.itemView.setOnClickListener(v -> {
            if (listener != null) {
                listener.onNotificationClick(noti, position);
            }
        });
    }

    @Override
    public int getItemCount() {
        return notificationList.size();
    }

    public class NotificationViewHolder extends RecyclerView.ViewHolder {
        AuthorAvatarView ivAvatar;
        TextView tvContent, tvTime;
        View viewUnreadDot;

        public NotificationViewHolder(@NonNull View itemView) {
            super(itemView);
            ivAvatar = itemView.findViewById(R.id.ivSenderAvatar);
            tvContent = itemView.findViewById(R.id.tvContent);
            tvTime = itemView.findViewById(R.id.tvTime);
            viewUnreadDot = itemView.findViewById(R.id.viewUnreadDot);
        }
    }
}
