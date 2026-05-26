package com.studentforum.app.models;

import com.google.gson.annotations.SerializedName;
import java.io.Serializable;

public class Comment implements Serializable {
    @SerializedName(value = "commentId", alternate = {"_id"})
    private String id;
    
    @SerializedName("content")
    private String content;
    
    @SerializedName("user")
    private User author;
    
    @SerializedName("postId")
    private String postId;
    
    @SerializedName("parentId")
    private String parentId; 
    
    @SerializedName("likes_count")
    private int likesCount;
    
    @SerializedName("replies_count")
    private int repliesCount;
    
    @SerializedName("is_liked_by_current_user")
    private boolean isLikedByCurrentUser;
    
    @SerializedName("createdAt")
    private String createdAt;

    // Thuộc tính UI dành riêng cho Android (Không liên quan API)
    private transient int viewLevel = 0; // Để lùi lề (margin/padding) trong Adapter

    public String getId() { return id; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public User getAuthor() { return author; }
    public String getPostId() { return postId; }
    public String getParentId() { return parentId; }
    public int getLikesCount() { return likesCount; }
    public void setLikesCount(int likesCount) { this.likesCount = likesCount; }
    public int getRepliesCount() { return repliesCount; }
    public void setRepliesCount(int repliesCount) { this.repliesCount = repliesCount; }
    public boolean isLikedByCurrentUser() { return isLikedByCurrentUser; }
    public void setLikedByCurrentUser(boolean isLiked) { this.isLikedByCurrentUser = isLiked; }
    public String getCreatedAt() { return createdAt; }

    public int getViewLevel() { return viewLevel; }
    public void setViewLevel(int viewLevel) { this.viewLevel = viewLevel; }
}
