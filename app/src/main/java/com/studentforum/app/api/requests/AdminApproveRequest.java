package com.studentforum.app.api.requests;

import java.util.List;
import com.google.gson.annotations.SerializedName;

public class AdminApproveRequest {
    @SerializedName("newPostStatus")
    private String newPostStatus; // "approved" hoặc "rejected"
    
    @SerializedName("reason")
    private String reason;
    
    @SerializedName("pendingTagActions")
    private List<String> pendingTagActions;
    
    @SerializedName("keepTagIds")
    private List<String> keepTagIds;

    public AdminApproveRequest(String newPostStatus, String reason) {
        this.newPostStatus = newPostStatus;
        this.reason = reason;
    }
    
    // Getters / Setters
}
