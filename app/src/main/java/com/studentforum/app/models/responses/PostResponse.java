package com.studentforum.app.models.responses;

import com.google.gson.annotations.SerializedName;
import com.studentforum.app.models.Post;
import com.studentforum.app.models.Tag;
import com.studentforum.app.models.Topic;
import java.util.List;

public class PostResponse {
    @SerializedName("identity")
    private Identity identity;

    @SerializedName("posts")
    private List<Post> posts;
    
    @SerializedName("pagination")
    private Pagination pagination;

    public Identity getIdentity() { return identity; }
    public List<Post> getPosts() { return posts; }
    public Pagination getPagination() { return pagination; }

    public static class Identity {
        @SerializedName("topic")
        private Topic topic;
        @SerializedName("tag")
        private Tag tag;

        public Topic getTopic() { return topic; }
        public Tag getTag() { return tag; }
    }

    public static class Pagination {
        @SerializedName("totalItems")
        private int totalItems;
        @SerializedName("totalPages")
        private int totalPages;
        @SerializedName("currentPage")
        private int currentPage;
        @SerializedName("limit")
        private int limit;
        
        public int getTotalItems() { return totalItems; }
        public int getTotalPages() { return totalPages; }
        public int getCurrentPage() { return currentPage; }
        public int getLimit() { return limit; }
    }
}
