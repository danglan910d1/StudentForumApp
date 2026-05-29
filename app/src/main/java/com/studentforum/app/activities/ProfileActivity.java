package com.studentforum.app.activities;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.bumptech.glide.Glide;
import com.studentforum.app.R;
import com.studentforum.app.databinding.ActivityProfileBinding;
import com.studentforum.app.models.UserProfile;
import com.studentforum.app.repositories.MockUserRepositoryImpl;
import com.studentforum.app.repositories.UserRepository;
import com.studentforum.app.utils.AuthManager;

public class ProfileActivity extends AppCompatActivity {
    private static final String TAG = "ProfileActivity";
    private ActivityProfileBinding binding;
    private AuthManager authManager;
    private UserRepository userRepository;

    public enum ProfileMode {
        MY_PROFILE,
        OTHER_PROFILE
    }

    private ProfileMode currentMode;
    private String targetUserId;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityProfileBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        authManager = new AuthManager(this);
        userRepository = new MockUserRepositoryImpl();

        targetUserId = getIntent().getStringExtra("USER_ID");
        Log.d(TAG, "Loading profile for: " + targetUserId);

        if (targetUserId == null || targetUserId.equals(authManager.getUserId())) {
            currentMode = ProfileMode.MY_PROFILE;
            targetUserId = authManager.getUserId();
        } else {
            currentMode = ProfileMode.OTHER_PROFILE;
        }

        setupUI();
        loadProfileData();
    }

    private void setupUI() {
        binding.ivBack.setOnClickListener(v -> finish());
        
        if (currentMode == ProfileMode.OTHER_PROFILE) {
            binding.btnEditProfile.setVisibility(View.GONE);
            binding.llEmail.setVisibility(View.GONE); // Hide sensitive data
        } else {
            binding.btnEditProfile.setVisibility(View.VISIBLE);
            binding.llEmail.setVisibility(View.VISIBLE);
            
            binding.btnEditProfile.setOnClickListener(v -> {
                Toast.makeText(this, "Chức năng sửa hồ sơ đang cập nhật", Toast.LENGTH_SHORT).show();
            });
        }
    }

    private void loadProfileData() {
        if (targetUserId == null) {
            showError("User ID bị thiếu!");
            return;
        }

        userRepository.getUserProfile(targetUserId, new UserRepository.OnProfileLoadedListener() {
            @Override
            public void onSuccess(UserProfile profile) {
                binding.llErrorState.setVisibility(View.GONE);
                binding.nsvContent.setVisibility(View.VISIBLE);
                binding.appBarLayout.setVisibility(View.VISIBLE);

                binding.tvName.setText(profile.getName());
                binding.tvBio.setText(profile.getBio());
                binding.tvEmail.setText(profile.getEmail());
                binding.tvLocation.setText(profile.getLocation());
                binding.tvJoinDate.setText(profile.getJoinDate());

                binding.tvPostCount.setText(String.valueOf(profile.getPostCount()));
                binding.tvLikeCount.setText(String.valueOf(profile.getLikeCount()));
                binding.tvCommentCount.setText(String.valueOf(profile.getCommentCount()));
                binding.tvTrustScore.setText(String.valueOf(profile.getTrustScore()));

                binding.tvAboutMe.setText(profile.getAboutMe());

                Glide.with(ProfileActivity.this)
                     .load(profile.getAvatar())
                     .placeholder(R.drawable.ic_profile)
                     .error(R.drawable.ic_profile)
                     .into(binding.ivAvatar);
                     
                binding.pbAchievement.setProgress((int) profile.getAchievementProgress());
            }

            @Override
            public void onError(String message) {
                showError(message);
            }
        });
    }

    private void showError(String message) {
        binding.llErrorState.setVisibility(View.VISIBLE);
        binding.nsvContent.setVisibility(View.GONE);
        binding.appBarLayout.setVisibility(View.GONE);
        binding.tvErrorMessage.setText(message);
    }
}
