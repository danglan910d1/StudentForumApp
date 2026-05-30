package com.studentforum.app.activities;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.view.GravityCompat;
import androidx.drawerlayout.widget.DrawerLayout;

import com.bumptech.glide.Glide;
import com.google.android.material.navigation.NavigationView;
import com.studentforum.app.R;
import com.studentforum.app.utils.AppUtils;
import com.studentforum.app.utils.AuthManager;

public abstract class BaseActivity extends AppCompatActivity {
    protected DrawerLayout drawerLayout;
    protected NavigationView navView;
    protected AuthManager authManager;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        authManager = new AuthManager(this);
    }

    protected void setupDrawer(int currentNavId) {
        drawerLayout = findViewById(R.id.drawerLayout);
        navView = findViewById(R.id.navView);

        if (drawerLayout == null || navView == null) {
            return;
        }

        View headerView = navView.getHeaderView(0);
        
        TextView tvDrawerName = headerView.findViewById(R.id.tvDrawerName);
        TextView tvDrawerEmail = headerView.findViewById(R.id.tvDrawerEmail);
        ImageView ivDrawerAvatar = headerView.findViewById(R.id.ivDrawerAvatar);

        tvDrawerName.setText(authManager.getName());
        tvDrawerEmail.setText(authManager.getEmail());
        
        String avatarNavUrl = AppUtils.getAssetUrl(authManager.getAvatar());
        if (!avatarNavUrl.isEmpty()) {
            Glide.with(this).load(avatarNavUrl).circleCrop().into(ivDrawerAvatar);
        } else {
            ivDrawerAvatar.setImageResource(R.drawable.ic_profile);
        }

        View.OnClickListener profileClickListener = v -> {
            drawerLayout.closeDrawer(GravityCompat.START);
            if (this instanceof ProfileActivity) {
                String currentUserId = getIntent().getStringExtra("USER_ID");
                if (authManager.getUserId().equals(currentUserId)) {
                    return;
                }
            }
            Intent intent = new Intent(this, ProfileActivity.class);
            intent.putExtra("USER_ID", authManager.getUserId());
            startActivity(intent);
        };
        headerView.setOnClickListener(profileClickListener);
        ivDrawerAvatar.setOnClickListener(profileClickListener);
        tvDrawerName.setOnClickListener(profileClickListener);

        navView.setCheckedItem(currentNavId);

        navView.setNavigationItemSelectedListener(item -> {
            drawerLayout.closeDrawer(GravityCompat.START);
            int id = item.getItemId();
            if (id == R.id.nav_profile) {
                if (this instanceof ProfileActivity) {
                    String currentUserId = getIntent().getStringExtra("USER_ID");
                    if (authManager.getUserId().equals(currentUserId)) {
                        return true;
                    }
                }
                Intent intent = new Intent(this, ProfileActivity.class);
                intent.putExtra("USER_ID", authManager.getUserId());
                startActivity(intent);
                return true;
            }
            if (id == currentNavId) {
                return true;
            }
            if (id == R.id.nav_home) {
                startActivity(new Intent(this, HomeActivity.class));
            } else if (id == R.id.nav_topics) {
                startActivity(new Intent(this, TopicActivity.class));
            }
            return true;
        });

        // Use HeaderManager for the current activity
        com.studentforum.app.utils.HeaderManager.setupHeader(this, authManager, v -> {
            drawerLayout.openDrawer(GravityCompat.START);
        });
    }

    protected void setupFooter(int currentNavId) {
        com.google.android.material.bottomnavigation.BottomNavigationView bottomNav = findViewById(R.id.layoutFooter);
        if (bottomNav == null) return;

        bottomNav.setSelectedItemId(currentNavId);
        bottomNav.setOnItemSelectedListener(item -> {
            int itemId = item.getItemId();
            if (itemId == currentNavId) {
                return true;
            }
            if (itemId == R.id.nav_home) {
                Intent intent = new Intent(this, HomeActivity.class);
                intent.addFlags(Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
                startActivity(intent);
                finish();
                return true;
            } else if (itemId == R.id.nav_topics) {
                Intent intent = new Intent(this, TopicActivity.class);
                startActivity(intent);
                finish();
                return true;
            } else if (itemId == R.id.nav_profile) {
                Intent intent = new Intent(this, ProfileActivity.class);
                intent.putExtra("USER_ID", authManager.getUserId());
                startActivity(intent);
                finish();
                return true;
            }
            return false;
        });
    }
}
