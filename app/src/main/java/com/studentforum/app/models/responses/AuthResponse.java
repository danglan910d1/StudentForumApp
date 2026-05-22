package com.studentforum.app.models.responses;

import com.google.gson.annotations.SerializedName;
import com.studentforum.app.models.User;

public class AuthResponse extends User {
    @SerializedName("token")
    private String token;
    
    public String getToken() { return token; }
    
    // Trả về chính đối tượng này vì nó đã kế thừa toàn bộ thuộc tính của User
    public User getUser() { return this; }
}
