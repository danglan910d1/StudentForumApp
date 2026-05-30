package com.studentforum.app.utils;

import android.app.Activity;
import android.content.Intent;
import android.view.View;
import android.widget.ImageView;

import com.bumptech.glide.Glide;
import com.studentforum.app.R;
import com.studentforum.app.activities.MenuActivity;
import com.studentforum.app.activities.SearchActivity;

public class HeaderManager {
    public static void setupHeader(Activity activity, AuthManager authManager, View.OnClickListener onMenuClick) {
        View layoutHeader = activity.findViewById(R.id.layoutHeader);
        if (layoutHeader == null) return;

        // Setup Menu Button
        ImageView btnMenu = layoutHeader.findViewById(R.id.btnMenu);
        if (btnMenu != null && onMenuClick != null) {
            btnMenu.setOnClickListener(onMenuClick);
        }

        // Setup Search Button
        View btnSearchHeader = layoutHeader.findViewById(R.id.btnSearchHeader);
        if (btnSearchHeader != null) {
            btnSearchHeader.setOnClickListener(v -> {
                activity.startActivity(new Intent(activity, SearchActivity.class));
            });
        }

        // Setup Avatar
        ImageView ivUserAvatar = layoutHeader.findViewById(R.id.ivUserAvatar);
        if (ivUserAvatar != null) {
            String avatarUrl = AppUtils.getAssetUrl(authManager.getAvatar());
            if (!avatarUrl.isEmpty()) {
                Glide.with(activity)
                        .load(avatarUrl)
                        .placeholder(R.drawable.ic_profile)
                        .circleCrop()
                        .into(ivUserAvatar);
            } else {
                ivUserAvatar.setImageResource(R.drawable.ic_profile);
            }

            ivUserAvatar.setOnClickListener(v -> {
                activity.startActivity(new Intent(activity, MenuActivity.class));
            });
        }
    }
}
