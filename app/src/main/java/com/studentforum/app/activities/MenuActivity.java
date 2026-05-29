package com.studentforum.app.activities;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import androidx.appcompat.app.AppCompatActivity;
import com.bumptech.glide.Glide;
import com.studentforum.app.R;
import com.studentforum.app.databinding.ActivityMenuBinding;
import com.studentforum.app.utils.AppUtils;
import com.studentforum.app.utils.AuthManager;

public class MenuActivity extends AppCompatActivity {
    private ActivityMenuBinding binding;
    private AuthManager authManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityMenuBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        authManager = new AuthManager(this);

        // Load Header Info
        binding.tvName.setText(authManager.getName());
        binding.tvEmail.setText(authManager.getEmail());
        String avatarUrl = AppUtils.getAssetUrl(authManager.getAvatar());
        if (!avatarUrl.isEmpty()) {
            Glide.with(this).load(avatarUrl).circleCrop().into(binding.ivAvatar);
        } else {
            binding.ivAvatar.setImageResource(R.drawable.ic_profile);
        }

        // Handle Role Visibility
        if (authManager.isAdmin()) {
            binding.llAdminApprove.setVisibility(View.VISIBLE);
            binding.vAdminDivider.setVisibility(View.VISIBLE);
            binding.llSystemConfig.setVisibility(View.VISIBLE);
            binding.vSystemConfigDivider.setVisibility(View.VISIBLE);
        } else {
            binding.llAdminApprove.setVisibility(View.GONE);
            binding.vAdminDivider.setVisibility(View.GONE);
            binding.llSystemConfig.setVisibility(View.GONE);
            binding.vSystemConfigDivider.setVisibility(View.GONE);
        }

        // Click Listeners
        binding.ivBack.setOnClickListener(v -> finish());
        
        binding.llSecurity.setOnClickListener(v -> {
            startActivity(new Intent(MenuActivity.this, SecurityActivity.class));
        });

        binding.llSystemConfig.setOnClickListener(v -> {
            // Placeholder for SystemConfigActivity
        });

        binding.ivAvatar.setOnClickListener(v -> {
            Intent intent = new Intent(MenuActivity.this, ProfileActivity.class);
            intent.putExtra("USER_ID", authManager.getUserId());
            startActivity(intent);
        });

        binding.llAdminApprove.setOnClickListener(v -> {
            startActivity(new Intent(MenuActivity.this, AdminApproveListActivity.class));
        });

        binding.llLogout.setOnClickListener(v -> {
            authManager.logout();
            Intent intent = new Intent(MenuActivity.this, LoginActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            startActivity(intent);
            finish();
        });
    }
}

