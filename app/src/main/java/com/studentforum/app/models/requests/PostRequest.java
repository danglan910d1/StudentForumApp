package com.studentforum.app.models.requests;

import com.google.gson.annotations.SerializedName;
import java.util.List;

public class PostRequest {
    @SerializedName("topicId")
    private String topicId;
    
    @SerializedName("title")
    private String title;
    
    @SerializedName("content")
    private String content;
    
    /**
     * Chứa cả tagId (String) hoặc tag name (String) theo đúng logic transformPostData của FE
     */
    @SerializedName("tags")
    private List<String> tags;

    public PostRequest(String topicId, String title, String content, List<String> tags) {
        this.topicId = topicId;
        this.title = title;
        this.content = content;
        this.tags = tags;
    }

    public String getTopicId() {
        return topicId;
    }

    public void setTopicId(String topicId) {
        this.topicId = topicId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }
}
