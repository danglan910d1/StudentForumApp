package com.studentforum.app.models;

import com.google.gson.annotations.SerializedName;
import java.io.Serializable;

public class Topic implements Serializable {
    @SerializedName(value = "topicId", alternate = {"_id"})
    private String id;
    @SerializedName("name")
    private String name;
    @SerializedName("description")
    private String description;
    @SerializedName("post_count")
    private int postCount;

    public String getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public int getPostCount() { return postCount; }
}
