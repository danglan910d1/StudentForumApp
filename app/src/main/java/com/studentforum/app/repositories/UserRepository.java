package com.studentforum.app.repositories;

import com.studentforum.app.models.UserProfile;

public interface UserRepository {
    interface OnProfileLoadedListener {
        void onSuccess(UserProfile profile);
        void onError(String message);
    }

    void getUserProfile(String userId, OnProfileLoadedListener listener);
}
