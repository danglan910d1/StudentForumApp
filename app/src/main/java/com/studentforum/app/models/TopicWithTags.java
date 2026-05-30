package com.studentforum.app.models;

import java.util.List;
import java.util.ArrayList;

public class TopicWithTags {
    private Topic topic;
    private List<Tag> tags;

    public TopicWithTags(Topic topic) {
        this.topic = topic;
        this.tags = new ArrayList<>();
    }

    public Topic getTopic() {
        return topic;
    }

    public List<Tag> getTags() {
        return tags;
    }

    public void setTags(List<Tag> tags) {
        this.tags = tags;
    }

    public void addTag(Tag tag) {
        this.tags.add(tag);
    }
}
