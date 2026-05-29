package com.studentforum.app.models;

import java.io.Serializable;
import java.util.List;

public class UserProfile extends User implements Serializable {
    private String location;
    private String joinDate;
    private int postCount;
    private int likeCount;
    private int commentCount;
    private double trustScore;
    private String aboutMe;
    private List<String> links;
    private double achievementProgress;

    // Getters and Setters
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    
    public String getJoinDate() { return joinDate; }
    public void setJoinDate(String joinDate) { this.joinDate = joinDate; }
    
    public int getPostCount() { return postCount; }
    public void setPostCount(int postCount) { this.postCount = postCount; }
    
    public int getLikeCount() { return likeCount; }
    public void setLikeCount(int likeCount) { this.likeCount = likeCount; }
    
    public int getCommentCount() { return commentCount; }
    public void setCommentCount(int commentCount) { this.commentCount = commentCount; }
    
    public double getTrustScore() { return trustScore; }
    public void setTrustScore(double trustScore) { this.trustScore = trustScore; }
    
    public String getAboutMe() { return aboutMe; }
    public void setAboutMe(String aboutMe) { this.aboutMe = aboutMe; }
    
    public List<String> getLinks() { return links; }
    public void setLinks(List<String> links) { this.links = links; }
    
    public double getAchievementProgress() { return achievementProgress; }
    public void setAchievementProgress(double achievementProgress) { this.achievementProgress = achievementProgress; }
}
