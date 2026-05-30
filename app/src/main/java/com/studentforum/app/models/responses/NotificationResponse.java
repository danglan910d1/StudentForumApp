package com.studentforum.app.models.responses;

import com.google.gson.annotations.SerializedName;
import com.studentforum.app.models.Notification;
import java.util.List;

public class NotificationResponse {
    @SerializedName("notifications")
    private List<Notification> data;

    @SerializedName("pagination")
    private Pagination pagination;

    @SerializedName("unreadCount")
    private int unreadCount;

    public static class Pagination {
        @SerializedName("currentPage")
        private int currentPage;

        @SerializedName("totalPages")
        private int totalPages;

        @SerializedName("totalItems")
        private int totalItems;

        public int getCurrentPage() { return currentPage; }
        public int getTotalPages() { return totalPages; }
        public int getTotalItems() { return totalItems; }
    }

    public List<Notification> getData() { return data; }
    public Pagination getPagination() { return pagination; }
    public int getUnreadCount() { return unreadCount; }
}
