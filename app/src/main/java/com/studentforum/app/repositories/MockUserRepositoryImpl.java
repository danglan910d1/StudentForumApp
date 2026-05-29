package com.studentforum.app.repositories;

import android.os.Handler;
import android.os.Looper;

import com.studentforum.app.models.UserProfile;

import java.util.Arrays;

public class MockUserRepositoryImpl implements UserRepository {

    @Override
    public void getUserProfile(String userId, OnProfileLoadedListener listener) {
        // Mock a network delay
        new Handler(Looper.getMainLooper()).postDelayed(() -> {
            if ("invalid_id".equals(userId)) {
                listener.onError("User not found");
                return;
            }

            UserProfile profile = new UserProfile();
            profile.setId(userId);
            profile.setName("Đặng Thị Ngọc Lan");
            profile.setRole("user"); // or admin
            profile.setEmail("danglan1934@gmail.com");
            profile.setBio("Sinh viên Khoa Công nghệ Thông tin - Cao đẳng GTVT");
            profile.setAvatar("https://i.pravatar.cc/150?u=" + userId); // placeholder image
            
            profile.setLocation("TP.HCM, Việt Nam");
            profile.setJoinDate("Tháng 9, 2021");
            profile.setPostCount(24);
            profile.setLikeCount(156);
            profile.setCommentCount(89);
            profile.setTrustScore(4.8);
            
            profile.setAboutMe("Đam mê xây dựng các hệ thống Fullstack hiện đại và tối ưu quy trình phát triển phần mềm bằng công nghệ AI. Luôn tìm kiếm cơ hội nghiên cứu về Big Data và ứng dụng dữ liệu trong thực tiễn. Chủ động trong việc chia sẻ kiến thức cộng đồng và không ngừng hoàn thiện kỹ năng lãnh đạo trong các dự án công nghệ.");
            profile.setLinks(Arrays.asList("linkedin.com/in/ngoclandang", "facebook.com/ngoclan.fiu"));
            profile.setAchievementProgress(75.0);

            listener.onSuccess(profile);
        }, 1000); // 1s delay
    }
}
