package com.studentforum.app.models;

import com.google.gson.annotations.SerializedName;
import java.io.Serializable;

public class Notification implements Serializable {
    @SerializedName("_id")
    private String id;
    @SerializedName("type")
    private String type;
    @SerializedName("content")
    private String content;
    @SerializedName("is_read")
    private boolean isRead;
    @SerializedName("createdAt")
    private String createdAt;

    public String getId() { return id; }
    public String getType() { return type; }
    public String getContent() { return content; }
    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }
    public String getCreatedAt() { return createdAt; }
}
