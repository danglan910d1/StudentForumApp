package com.studentforum.app.models.responses;

import com.google.gson.annotations.SerializedName;
import com.studentforum.app.models.Comment;
import java.util.List;

public class CommentResponse {
    @SerializedName("comments")
    private List<Comment> comments;

    public List<Comment> getComments() {
        return comments;
    }

    public void setComments(List<Comment> comments) {
        this.comments = comments;
    }
}
