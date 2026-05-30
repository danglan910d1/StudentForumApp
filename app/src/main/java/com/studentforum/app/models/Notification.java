package com.studentforum.app.models;

import com.google.gson.annotations.SerializedName;
import java.util.Date;

public class Notification {
    @SerializedName("notificationId")
    private String id;
    
    @SerializedName("type")
    private String type;
    
    @SerializedName("targetId")
    private String targetId;
    
    @SerializedName("targetType")
    private String targetType;
    
    @SerializedName("targetSlug")
    private String targetSlug;
    
    @SerializedName("content")
    private String content;
    
    @SerializedName("is_read")
    private boolean isRead;
    
    @SerializedName("createdAt")
    private String createdAt;
    
    @SerializedName("sender")
    private Sender sender;

    public static class Sender {
        @SerializedName("userId")
        private String userId;
        
        @SerializedName("name")
        private String name;
        
        @SerializedName("avatar")
        private String avatar;

        public String getUserId() { return userId; }
        public String getName() { return name; }
        public String getAvatar() { return avatar; }
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public String getTargetId() { return targetId; }
    public void setTargetId(String targetId) { this.targetId = targetId; }
    
    public String getTargetType() { return targetType; }
    public void setTargetType(String targetType) { this.targetType = targetType; }
    
    public String getTargetSlug() { return targetSlug; }
    public void setTargetSlug(String targetSlug) { this.targetSlug = targetSlug; }
    
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    
    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }
    
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    
    public Sender getSender() { return sender; }
    public void setSender(Sender sender) { this.sender = sender; }
}
