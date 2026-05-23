package com.studentforum.app.utils;

import android.content.Context;
import android.content.SharedPreferences;

public class AuthManager {
    private static final String PREF_NAME = "AuthPrefs";
    private SharedPreferences prefs;

    public AuthManager(Context context) {
        prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
    }

    public void saveSession(String token, String role, String userId, String name, String email, String avatar) {
        prefs.edit()
            .putString("TOKEN", token)
            .putString("ROLE", role)
            .putString("USER_ID", userId)
            .putString("NAME", name)
            .putString("EMAIL", email)
            .putString("AVATAR", avatar)
            .apply();
    }

    public String getToken() { return prefs.getString("TOKEN", null); }
    public String getRole() { return prefs.getString("ROLE", "user"); }
    public String getUserId() { return prefs.getString("USER_ID", null); }
    public String getName() { return prefs.getString("NAME", "Tên người dùng"); }
    public String getEmail() { return prefs.getString("EMAIL", "email@studentforum.com"); }
    public String getAvatar() { return prefs.getString("AVATAR", ""); }
    
    public boolean isAdmin() { return "admin".equals(getRole()); }
    public boolean isLoggedIn() { return getToken() != null; }
    
    public void logout() { prefs.edit().clear().apply(); }
}
