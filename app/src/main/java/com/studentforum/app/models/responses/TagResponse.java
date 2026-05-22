package com.studentforum.app.models.responses;

import com.google.gson.annotations.SerializedName;
import com.studentforum.app.models.Tag;
import java.util.List;

public class TagResponse {
    @SerializedName("tags")
    private List<Tag> tags;
    
    @SerializedName("pagination")
    private PostResponse.Pagination pagination;

    public List<Tag> getTags() { return tags; }
    public PostResponse.Pagination getPagination() { return pagination; }
}
