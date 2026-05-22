package com.studentforum.app.models;

import com.google.gson.annotations.SerializedName;
import java.io.Serializable;

public class User implements Serializable {
    @SerializedName(value = "_id", alternate = {"userId"})
    private String id;
    @SerializedName("name")
    private String name;
    @SerializedName("email")
    private String email;
    @SerializedName("role")
    private String role;
    @SerializedName(value = "avatar", alternate = {"profilePicture", "profile_picture", "avatarUrl"})
    private String avatar;
    @SerializedName("status")
    private String status;
    @SerializedName("bio")
    private String bio;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
}
