package com.studentforum.app.api.requests;

import java.util.List;
import com.google.gson.annotations.SerializedName;

public class AdminApproveRequest {
    @SerializedName("newPostStatus")
    private String newPostStatus; // "approved" hoặc "rejected"
    
    @SerializedName("reason")
    private String reason;
    
    @SerializedName("pendingTagActions")
    private List<PendingTagAction> pendingTagActions;
    
    @SerializedName("keepTagIds")
    private List<String> keepTagIds;

    public AdminApproveRequest(String newPostStatus, String reason, List<PendingTagAction> pendingTagActions, List<String> keepTagIds) {
        this.newPostStatus = newPostStatus;
        this.reason = reason;
        this.pendingTagActions = pendingTagActions;
        this.keepTagIds = keepTagIds;
    }

    public AdminApproveRequest(String newPostStatus, String reason) {
        this.newPostStatus = newPostStatus;
        this.reason = reason;
        this.pendingTagActions = new java.util.ArrayList<>();
        this.keepTagIds = new java.util.ArrayList<>();
    }
    
    public static class PendingTagAction {
        @SerializedName("tagId")
        private String tagId;

        @SerializedName("action")
        private String action;

        public PendingTagAction(String tagId, String action) {
            this.tagId = tagId;
            this.action = action;
        }

        public String getTagId() { return tagId; }
        public String getAction() { return action; }
    }
}
