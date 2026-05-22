package com.studentforum.app.models;

import com.google.gson.annotations.SerializedName;
import java.io.Serializable;

public class Tag implements Serializable {
    @SerializedName(value = "tagId", alternate = {"_id"})
    private String id;
    @SerializedName("name")
    private String name;
    @SerializedName("slug")
    private String slug;

    public String getId() { return id; }
    public String getName() { return name; }
    public String getSlug() { return slug; }
}
