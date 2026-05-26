package com.studentforum.app.models.responses;

import com.google.gson.annotations.SerializedName;
import com.studentforum.app.models.Topic;
import java.util.List;

public class TopicResponse {
    @SerializedName("topics")
    private List<Topic> topics;

    public List<Topic> getTopics() {
        return topics;
    }

    public void setTopics(List<Topic> topics) {
        this.topics = topics;
    }
}
