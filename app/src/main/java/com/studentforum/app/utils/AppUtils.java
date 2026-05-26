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

    public static String getTimeAgo(String dateString) {
        if (dateString == null || dateString.isEmpty()) return "";
        try {
            long time;
            try {
                // Thử parse bằng Instant (chuẩn UTC, ví dụ 2026-05-26T13:29:52Z hoặc 2026-05-26T13:29:52.000Z)
                java.time.Instant instant = java.time.Instant.parse(dateString);
                time = instant.toEpochMilli();
            } catch (Exception e) {
                // Thử parse bằng OffsetDateTime (nếu có timezone offset khác UTC)
                java.time.OffsetDateTime odt = java.time.OffsetDateTime.parse(dateString);
                time = odt.toInstant().toEpochMilli();
            }

            long now = System.currentTimeMillis();
            long diff = now - time;

            if (diff < 0) {
                return "Vừa xong";
            }

            if (diff < 60000) {
                return "Vừa xong";
            } else if (diff < 3600000) {
                return (diff / 60000) + " phút trước";
            } else if (diff < 86400000) {
                return (diff / 3600000) + " giờ trước";
            } else {
                return (diff / 86400000) + " ngày trước";
            }
        } catch (Exception e) {
            return dateString;
        }
    }

    public static String formatDate(String dateString) {
        if (dateString == null || dateString.isEmpty()) return "";
        try {
            java.time.OffsetDateTime odt = java.time.OffsetDateTime.parse(dateString);
            java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("d 'tháng' M, yyyy");
            return odt.format(formatter);
        } catch (Exception e) {
            return dateString;
        }
    }
}
