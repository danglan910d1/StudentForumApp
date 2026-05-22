package com.studentforum.app.utils;

public class AppUtils {
    public static String getAssetUrl(String path) {
        if (path == null || path.isEmpty()) return "";

        // Nếu đường dẫn là dạng http đầy đủ
        if (path.startsWith("http")) {
            // Thay localhost:3000 hoặc localhost:5000 thành 10.0.2.2:5000 cho máy ảo Android
            return path.replace("localhost:3000", "10.0.2.2:5000")
                       .replace("localhost:5000", "10.0.2.2:5000");
        }

        // Nếu là path tương đối (ví dụ /uploads/...)
        String backendBase = "http://10.0.2.2:5000";
        return backendBase + (path.startsWith("/") ? "" : "/") + path;
    }
}
