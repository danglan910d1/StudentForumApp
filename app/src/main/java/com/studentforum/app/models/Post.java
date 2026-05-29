package com.studentforum.app.models;

import com.google.gson.annotations.SerializedName;
import java.io.Serializable;
import java.util.List;

public class Post implements Serializable {
    @SerializedName(value = "postId", alternate = {"_id"})
    private String id;
    @SerializedName("title")
    private String title;
    @SerializedName("content")
    private String content;
    @SerializedName(value = "user", alternate = {"userId", "author"})
    private User author;
    @SerializedName(value = "topic", alternate = {"topicId"})
    private Topic topic;
    @SerializedName("tags")
    private List<Tag> tags;
    @SerializedName("pending_tags")
    private List<Tag> pendingTags;
    @SerializedName("status")
    private String status;
    @SerializedName("views_count")
    private int viewsCount;
    @SerializedName("likes_count")
    private int likesCount;
    @SerializedName("comments_count")
    private int commentsCount;
    @SerializedName("cover_image")
    private String coverImage;
    @SerializedName("is_liked_by_current_user")
    private boolean isLikedByCurrentUser;
    @SerializedName("slug")
    private String slug;
    
    @SerializedName("createdAt")
    private String createdAt;

    public String getId() { return id; }
    public String getTitle() { return title; }
    public String getSlug() { return slug != null ? slug : id; }
    public String getContent() { return content; }
    public User getAuthor() { return author; }
    public Topic getTopic() { return topic; }
    public List<Tag> getTags() { return tags; }
    public List<Tag> getPendingTags() { return pendingTags; }
    public String getStatus() { return status; }
    public int getViewsCount() { return viewsCount; }
    public int getLikesCount() { return likesCount; }
    public void setLikesCount(int likesCount) { this.likesCount = likesCount; }
    public int getCommentsCount() { return commentsCount; }
    public String getCoverImage() { return coverImage; }
    public boolean isLikedByCurrentUser() { return isLikedByCurrentUser; }
    public void setLikedByCurrentUser(boolean liked) { this.isLikedByCurrentUser = liked; }
    public String getCreatedAt() { return createdAt; }
}
