package com.studentforum.app.activities;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;

import com.bumptech.glide.Glide;
import com.studentforum.app.R;
import com.studentforum.app.adapters.PostAdapter;
import com.studentforum.app.databinding.ActivityProfileBinding;
import com.studentforum.app.models.Post;
import com.studentforum.app.models.responses.PostResponse;
import com.studentforum.app.models.UserProfile;
import com.studentforum.app.repositories.MockUserRepositoryImpl;
import com.studentforum.app.repositories.UserRepository;
import com.studentforum.app.utils.AuthManager;
import com.studentforum.app.api.ApiClient;
import com.studentforum.app.api.ApiService;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ProfileActivity extends BaseActivity {
    private static final String TAG = "ProfileActivity";
    private ActivityProfileBinding binding;
    private UserRepository userRepository;
    private PostAdapter postAdapter;
    private List<Post> postList = new ArrayList<>();
    private String currentPostFilter = "ALL";

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
        setupRecyclerView();
        loadProfileData();
        loadUserPosts();
    }

    private void setupUI() {
        setupDrawer(R.id.nav_profile);


        com.google.android.material.bottomnavigation.BottomNavigationView bottomNav = binding.getRoot().findViewById(R.id.layoutFooter);
        if (bottomNav != null) {
            bottomNav.setOnItemSelectedListener(item -> {
                int itemId = item.getItemId();
                if (itemId == R.id.nav_home) {
                    Intent intent = new Intent(ProfileActivity.this, HomeActivity.class);
                    intent.addFlags(Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
                    startActivity(intent);
                    return false;
                } else if (itemId == R.id.nav_profile) {
                    if (currentMode == ProfileMode.MY_PROFILE) return true;
                    Intent intent = new Intent(ProfileActivity.this, ProfileActivity.class);
                    intent.putExtra("USER_ID", authManager.getUserId());
                    startActivity(intent);
                    finish();
                    return true;
                }
                return false;
            });
            
            if (currentMode == ProfileMode.MY_PROFILE) {
                bottomNav.setSelectedItemId(R.id.nav_profile);
            } else {
                bottomNav.getMenu().setGroupCheckable(0, false, true);
            }
        }

        if (currentMode == ProfileMode.OTHER_PROFILE) {
            binding.btnEditProfile.setVisibility(View.GONE);
            com.google.android.material.tabs.TabLayout tabLayout = findViewById(R.id.tabLayout);
            if (tabLayout != null) tabLayout.setVisibility(View.GONE);
        } else {
            binding.btnEditProfile.setVisibility(View.VISIBLE);
            binding.btnEditProfile.setOnClickListener(v -> {
                Intent intent = new Intent(ProfileActivity.this, EditProfileActivity.class);
                startActivity(intent);
            });
            
            com.google.android.material.tabs.TabLayout tabLayout = findViewById(R.id.tabLayout);
            if (tabLayout != null) {
                tabLayout.setVisibility(View.VISIBLE);
                if (tabLayout.getTabCount() == 0) {
                    tabLayout.addTab(tabLayout.newTab().setText("Tất cả"));
                    tabLayout.addTab(tabLayout.newTab().setText("Đã duyệt"));
                    tabLayout.addTab(tabLayout.newTab().setText("Đang đợi"));
                    tabLayout.addTab(tabLayout.newTab().setText("Từ chối"));
                }
                
                tabLayout.addOnTabSelectedListener(new com.google.android.material.tabs.TabLayout.OnTabSelectedListener() {
                    @Override
                    public void onTabSelected(com.google.android.material.tabs.TabLayout.Tab tab) {
                        switch (tab.getPosition()) {
                            case 0: currentPostFilter = "ALL"; break;
                            case 1: currentPostFilter = "APPROVED"; break;
                            case 2: currentPostFilter = "PENDING"; break;
                            case 3: currentPostFilter = "REJECTED"; break;
                        }
                        processPosts(postList);
                    }

                    @Override
                    public void onTabUnselected(com.google.android.material.tabs.TabLayout.Tab tab) {}

                    @Override
                    public void onTabReselected(com.google.android.material.tabs.TabLayout.Tab tab) {}
                });
            }
        }
    }

    private void setupRecyclerView() {
        postAdapter = new PostAdapter(this);
        postAdapter.setOnPostClickListener(new PostAdapter.OnPostClickListener() {
            @Override
            public void onPostClick(Post post) {
                Intent intent = new Intent(ProfileActivity.this, PostDetailActivity.class);
                intent.putExtra("POST_ID", post.getId());
                startActivity(intent);
            }

            @Override
            public void onAuthorClick(Post post) {
                // Do nothing, already in profile
            }
            
            @Override
            public void onLikeClick(Post post, int position) {
                // Do nothing for now
            }
        });
        binding.rvPosts.setLayoutManager(new LinearLayoutManager(this));
        binding.rvPosts.setAdapter(postAdapter);
    }

    private void loadProfileData() {
        if (targetUserId == null) {
            showError("User ID bị thiếu!");
            return;
        }

        ApiService apiService = ApiClient.getClient(authManager).create(ApiService.class);
        
        Callback<com.studentforum.app.models.User> callback = new Callback<com.studentforum.app.models.User>() {
            @Override
            public void onResponse(Call<com.studentforum.app.models.User> call, Response<com.studentforum.app.models.User> response) {
                if (response.isSuccessful() && response.body() != null) {
                    com.studentforum.app.models.User user = response.body();
                    UserProfile profile = new UserProfile();
                    profile.setId(user.getId());
                    profile.setName(user.getName());
                    profile.setEmail(user.getEmail());
                    profile.setRole(user.getRole());
                    profile.setAvatar(user.getAvatar());
                    profile.setStatus(user.getStatus());
                    profile.setBio(user.getBio());
                    
                    profile.setLocation("Việt Nam"); // FE doesn't have location
                    
                    String joinStr = "N/A";
                    if (user.getCreatedAt() != null && !user.getCreatedAt().isEmpty()) {
                        try {
                            String dateStr = user.getCreatedAt().split("T")[0]; // e.g. 2021-09-01
                            String[] parts = dateStr.split("-");
                            if (parts.length == 3) {
                                joinStr = "Tháng " + parts[1] + ", " + parts[0];
                            }
                        } catch (Exception e) {}
                    }
                    profile.setJoinDate(joinStr);
                    
                    bindProfileData(profile);
                } else {
                    Log.d(TAG, "API failed, fallback to mock data");
                    loadMockData();
                }
            }

            @Override
            public void onFailure(Call<com.studentforum.app.models.User> call, Throwable t) {
                Log.d(TAG, "API failed, fallback to mock data");
                loadMockData();
            }
        };

        if (currentMode == ProfileMode.MY_PROFILE) {
            apiService.getMyProfile().enqueue(callback);
        } else {
            apiService.getUserProfile(targetUserId).enqueue(callback);
        }
    }

    private void loadMockData() {
        userRepository.getUserProfile(targetUserId, new UserRepository.OnProfileLoadedListener() {
            @Override
            public void onSuccess(UserProfile profile) {
                bindProfileData(profile);
            }

            @Override
            public void onError(String message) {
                showError(message);
            }
        });
    }

    private void bindProfileData(UserProfile profile) {
        binding.llErrorState.setVisibility(View.GONE);
        binding.nsvContent.setVisibility(View.VISIBLE);

        binding.tvName.setText(profile.getName());
        binding.tvEmail.setText(profile.getEmail() != null ? profile.getEmail() : "Không có email");
        
        /* // Removed these from XML design for now
        // Match FE role logic
        if ("admin".equals(profile.getRole())) {
            binding.tvRole.setText("QUẢN TRỊ VIÊN");
            binding.tvRole.setBackgroundResource(R.drawable.bg_chip_category); // You might want to style it differently for admin
        } else {
            binding.tvRole.setText("THÀNH VIÊN");
        }

        // Location & Join Date
        if (profile.getJoinDate() != null) {
            binding.tvJoinDate.setText("Tham gia " + profile.getJoinDate());
        }
        if (profile.getLocation() != null) {
            binding.tvLocation.setText(profile.getLocation());
        }
        */

        String avatarUrl = com.studentforum.app.utils.AppUtils.getAssetUrl(profile.getAvatar());
        if (!avatarUrl.isEmpty()) {
            Glide.with(this)
                 .load(avatarUrl)
                 .placeholder(R.drawable.ic_profile)
                 .error(R.drawable.ic_profile)
                 .circleCrop()
                 .into(binding.ivAvatar);
        } else {
            binding.ivAvatar.setImageResource(R.drawable.ic_profile);
        }
    }

    private void loadUserPosts() {
        if (targetUserId == null) return;

        ApiService apiService = ApiClient.getClient(authManager).create(ApiService.class);
        boolean isMyProfile = (currentMode == ProfileMode.MY_PROFILE);
        apiService.getMyPosts(targetUserId, isMyProfile, null).enqueue(new Callback<PostResponse>() {
            @Override
            public void onResponse(Call<PostResponse> call, Response<PostResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    postList = response.body().getPosts();
                    processPosts(postList);
                }
            }

            @Override
            public void onFailure(Call<PostResponse> call, Throwable t) {
                Log.e(TAG, "Error fetching user posts", t);
            }
        });
    }

    private void processPosts(List<Post> posts) {
        if (posts == null) return;

        int approved = 0;
        int pending = 0;
        
        List<Post> filteredList = new ArrayList<>();

        for (Post post : posts) {
            String status = post.getStatus() != null ? post.getStatus() : "APPROVED";
            if ("APPROVED".equalsIgnoreCase(status)) {
                approved++;
            } else if ("PENDING".equalsIgnoreCase(status)) {
                pending++;
            }
            
            if ("ALL".equals(currentPostFilter)) {
                if ("APPROVED".equalsIgnoreCase(status)) {
                    filteredList.add(post);
                } else if (currentMode == ProfileMode.MY_PROFILE && ("PENDING".equalsIgnoreCase(status) || "REJECTED".equalsIgnoreCase(status))) {
                    filteredList.add(post);
                }
            } else if (currentPostFilter.equalsIgnoreCase(status)) {
                if ("APPROVED".equalsIgnoreCase(status) || currentMode == ProfileMode.MY_PROFILE) {
                    filteredList.add(post);
                }
            }
        }

        if (currentMode == ProfileMode.MY_PROFILE && pending > 0) {
            binding.llPendingStat.setVisibility(View.VISIBLE);
            binding.tvPendingCount.setText(String.valueOf(pending));
        } else {
            binding.llPendingStat.setVisibility(View.GONE);
        }

        binding.tvApprovedCount.setText(String.valueOf(posts.size()));

        android.widget.TextView tvTabPostCount = binding.getRoot().findViewById(R.id.tvTabPostCount);
        if (tvTabPostCount != null) {
            if (currentMode == ProfileMode.MY_PROFILE) {
                tvTabPostCount.setVisibility(View.VISIBLE);
                tvTabPostCount.setText("Hiển thị " + filteredList.size() + " bài viết");
            } else {
                tvTabPostCount.setVisibility(View.GONE);
            }
        }

        postAdapter.setPosts(filteredList);
    }

    private void showError(String message) {
        binding.llErrorState.setVisibility(View.VISIBLE);
        binding.nsvContent.setVisibility(View.GONE);
        binding.tvErrorMessage.setText(message);
    }
    
    @Override
    protected void onResume() {
        super.onResume();
        if (currentMode == ProfileMode.MY_PROFILE) {
            loadProfileData();
        }
    }
    
    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        targetUserId = intent.getStringExtra("USER_ID");
        if (targetUserId == null || targetUserId.equals(authManager.getUserId())) {
            currentMode = ProfileMode.MY_PROFILE;
            targetUserId = authManager.getUserId();
        } else {
            currentMode = ProfileMode.OTHER_PROFILE;
        }
        setupUI();
        loadProfileData();
        loadUserPosts();
    }
}