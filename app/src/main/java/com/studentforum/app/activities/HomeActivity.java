package com.studentforum.app.activities;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;
import android.widget.PopupMenu;
import android.widget.ScrollView;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.view.GravityCompat;
import androidx.drawerlayout.widget.DrawerLayout;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.google.android.material.navigation.NavigationView;
import com.studentforum.app.R;
import com.studentforum.app.adapters.PostAdapter;
import com.studentforum.app.api.ApiClient;
import com.studentforum.app.api.ApiService;
import com.studentforum.app.utils.AuthManager;
import com.studentforum.app.viewmodels.PostViewModel;

import androidx.lifecycle.ViewModelProvider;
import com.studentforum.app.viewmodels.ViewModelFactory;

public class HomeActivity extends AppCompatActivity {
    private PostViewModel postViewModel;
    private AuthManager authManager;
    private PostAdapter adapter;
    private DrawerLayout drawerLayout;
    private int currentPage = 1;
    private int totalPages = 1;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_home);

        authManager = new AuthManager(this);
        drawerLayout = findViewById(R.id.drawerLayout);

        setupHeader();

        ApiService apiService = ApiClient.getClient(authManager).create(ApiService.class);

        ViewModelFactory factory = new ViewModelFactory(apiService);
        postViewModel = new ViewModelProvider(this, factory).get(PostViewModel.class);

        RecyclerView rvPosts = findViewById(R.id.rvPosts);
        rvPosts.setLayoutManager(new LinearLayoutManager(this));
        rvPosts.setItemAnimator(null);
        adapter = new PostAdapter(this);
        
        adapter.setOnPostClickListener(new PostAdapter.OnPostClickListener() {
            @Override
            public void onPostClick(com.studentforum.app.models.Post post) {
                Intent intent = new Intent(HomeActivity.this, PostDetailActivity.class);
                intent.putExtra("POST_ID", post.getId());
                startActivity(intent);
            }

            @Override
            public void onAuthorClick(com.studentforum.app.models.Post post) {
                if (post.getAuthor() != null) {
                    Toast.makeText(HomeActivity.this, "Chuyển sang Profile: " + post.getAuthor().getName(), Toast.LENGTH_SHORT).show();
                    // Intent intent = new Intent(HomeActivity.this, ProfileActivity.class);
                    // intent.putExtra("USER_ID", post.getAuthor().getId());
                    // startActivity(intent);
                }
            }

            @Override
            public void onLikeClick(com.studentforum.app.models.Post post, int position) {
                // Gọi tới backend qua ApiService thay vì Toast
                com.studentforum.app.api.ApiService api = com.studentforum.app.api.ApiClient.getClient(new AuthManager(HomeActivity.this)).create(com.studentforum.app.api.ApiService.class);
                api.toggleLikePost(post.getId()).enqueue(new retrofit2.Callback<okhttp3.ResponseBody>() {
                    @Override
                    public void onResponse(retrofit2.Call<okhttp3.ResponseBody> call, retrofit2.Response<okhttp3.ResponseBody> response) {
                        if (!response.isSuccessful()) {
                            Toast.makeText(HomeActivity.this, "Lỗi khi thả tim", Toast.LENGTH_SHORT).show();
                            // Rollback
                            boolean originalLiked = !post.isLikedByCurrentUser();
                            int originalCount = post.getLikesCount() + (originalLiked ? 1 : -1);
                            com.studentforum.app.viewmodels.PostViewModel.postLikeEventBus.postValue(
                                new com.studentforum.app.viewmodels.PostViewModel.PostLikeEvent(post.getId(), originalLiked, originalCount)
                            );
                        }
                    }
                    @Override
                    public void onFailure(retrofit2.Call<okhttp3.ResponseBody> call, Throwable t) {
                        Toast.makeText(HomeActivity.this, "Lỗi mạng", Toast.LENGTH_SHORT).show();
                        // Rollback
                        boolean originalLiked = !post.isLikedByCurrentUser();
                        int originalCount = post.getLikesCount() + (originalLiked ? 1 : -1);
                        com.studentforum.app.viewmodels.PostViewModel.postLikeEventBus.postValue(
                            new com.studentforum.app.viewmodels.PostViewModel.PostLikeEvent(post.getId(), originalLiked, originalCount)
                        );
                    }
                });
            }
        });

        rvPosts.setAdapter(adapter);

        // Đăng ký nhận sự kiện Like để đồng bộ giữa các màn hình
        com.studentforum.app.viewmodels.PostViewModel.postLikeEventBus.observe(this, likeEvent -> {
            if (likeEvent != null) {
                if (adapter != null) {
                    adapter.updatePostLikeStatus(likeEvent.postId, likeEvent.isLiked, likeEvent.likesCount);
                }
                com.studentforum.app.viewmodels.PostViewModel.updateCacheLikeStatus(likeEvent.postId, likeEvent.isLiked, likeEvent.likesCount);
            }
        });

        // Nút thêm bài viết
        View fabCreate = findViewById(R.id.fabCreatePost);
        fabCreate.setOnClickListener(v -> {
            startActivity(new Intent(this, CreateEditPostActivity.class));
        });

        // Phân trang
        View btnPrevPage = findViewById(R.id.btnPrevPage);
        View btnNextPage = findViewById(R.id.btnNextPage);
        if (btnPrevPage != null) {
            btnPrevPage.setOnClickListener(v -> {
                if (currentPage > 1) {
                    currentPage--;
                    postViewModel.fetchFeed(currentPage);
                }
            });
        }
        if (btnNextPage != null) {
            btnNextPage.setOnClickListener(v -> {
                if (currentPage < totalPages) {
                    currentPage++;
                    postViewModel.fetchFeed(currentPage);
                }
            });
        }

        // Logic Role-Based: Nếu là Admin, hiện nút đi đến AdminModerationActivity
        // (Bạn có thể thêm 1 nút Admin Dashboard lên Toolbar hoặc FAB)
        if (authManager.isAdmin()) {
            Toast.makeText(this, "Chào mừng Admin!", Toast.LENGTH_SHORT).show();
            // Thêm logic chuyển sang AdminModerationActivity tại đây nếu cần
        }

        // Lắng nghe dữ liệu
        postViewModel.getPosts().observe(this, posts -> {
            adapter.setPosts(posts);
            androidx.core.widget.NestedScrollView scrollView = findViewById(R.id.scrollView);
            if (scrollView != null) {
                scrollView.smoothScrollTo(0, 0);
            }
            // Cập nhật Xu hướng (Popular Tag) từ Client-side
            if (posts != null && !posts.isEmpty()) {
                java.util.List<com.studentforum.app.models.Tag> popularTags = getPopularTags(posts);
                if (!popularTags.isEmpty()) {
                    TextView tvPopularTag = findViewById(R.id.tvPopularTag);
                    tvPopularTag.setText("#" + popularTags.get(0).getName());
                }
            }
        });
        
        // Observe Pagination để cập nhật UI Total Posts và Total Pages
        postViewModel.getPagination().observe(this, pagination -> {
            if (pagination != null) {
                this.totalPages = pagination.getTotalPages();
                TextView tvTotalPosts = findViewById(R.id.tvTotalPosts);
                if (tvTotalPosts != null) {
                    tvTotalPosts.setText(String.valueOf(pagination.getTotalItems()));
                }
                renderPagination();
            }
        });

        postViewModel.getError().observe(this, error -> {
            Toast.makeText(this, error, Toast.LENGTH_SHORT).show();
        });

        // Observe loading state
        View layoutLoading = findViewById(R.id.layoutLoading);
        postViewModel.getLoading().observe(this, isLoading -> {
            if (layoutLoading != null) {
                layoutLoading.setVisibility(isLoading ? View.VISIBLE : View.GONE);
            }
        });

        // Fetch Data lần đầu
        postViewModel.fetchFeed(currentPage);
    }
    
    private void renderPagination() {
        android.widget.LinearLayout llPageNumbers = findViewById(R.id.llPageNumbers);
        if (llPageNumbers == null) return;
        llPageNumbers.removeAllViews();

        int maxPagesToShow = 5; 
        int startPage = Math.max(1, currentPage - 2);
        int endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
        
        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        for (int i = startPage; i <= endPage; i++) {
            TextView tvPage = new TextView(this);
            android.widget.LinearLayout.LayoutParams params = new android.widget.LinearLayout.LayoutParams(
                    (int) (36 * getResources().getDisplayMetrics().density),
                    (int) (36 * getResources().getDisplayMetrics().density));
            params.setMarginStart((int) (8 * getResources().getDisplayMetrics().density));
            tvPage.setLayoutParams(params);
            tvPage.setGravity(android.view.Gravity.CENTER);
            tvPage.setText(String.valueOf(i));
            tvPage.setTextSize(14f);

            if (i == currentPage) {
                tvPage.setTextColor(android.graphics.Color.WHITE);
                tvPage.setTypeface(null, android.graphics.Typeface.BOLD);
                tvPage.setBackgroundResource(R.drawable.bg_pagination_active);
            } else {
                tvPage.setTextColor(android.graphics.Color.parseColor("#111827"));
                tvPage.setBackgroundResource(R.drawable.bg_pagination_item);
                int pageToLoad = i;
                tvPage.setOnClickListener(v -> {
                    currentPage = pageToLoad;
                    postViewModel.fetchFeed(currentPage);
                });
            }
            llPageNumbers.addView(tvPage);
        }
    }
    
    // Hàm trích xuất Tag xuất hiện nhiều nhất
    private java.util.List<com.studentforum.app.models.Tag> getPopularTags(java.util.List<com.studentforum.app.models.Post> posts) {
        java.util.Map<String, Integer> tagCountMap = new java.util.HashMap<>();
        java.util.Map<String, com.studentforum.app.models.Tag> tagObjMap = new java.util.HashMap<>();

        for (com.studentforum.app.models.Post post : posts) {
            if (post.getTags() != null) {
                for (com.studentforum.app.models.Tag tag : post.getTags()) {
                    tagCountMap.put(tag.getId(), tagCountMap.getOrDefault(tag.getId(), 0) + 1);
                    tagObjMap.putIfAbsent(tag.getId(), tag);
                }
            }
        }
        
        java.util.List<java.util.Map.Entry<String, Integer>> entries = new java.util.ArrayList<>(tagCountMap.entrySet());
        entries.sort((a, b) -> b.getValue().compareTo(a.getValue())); // Descending

        java.util.List<com.studentforum.app.models.Tag> result = new java.util.ArrayList<>();
        for (int i = 0; i < Math.min(5, entries.size()); i++) {
            result.add(tagObjMap.get(entries.get(i).getKey()));
        }
        return result;
    }
    
    private void setupHeader() {
        // Nút Hamburger mở Drawer
        ImageView btnMenu = findViewById(R.id.btnMenu);
        btnMenu.setOnClickListener(v -> drawerLayout.openDrawer(GravityCompat.START));

        NavigationView navView = findViewById(R.id.navView);
        View headerView = navView.getHeaderView(0);
        
        TextView tvDrawerName = headerView.findViewById(R.id.tvDrawerName);
        TextView tvDrawerEmail = headerView.findViewById(R.id.tvDrawerEmail);
        ImageView ivDrawerAvatar = headerView.findViewById(R.id.ivDrawerAvatar);

        tvDrawerName.setText(authManager.getName());
        tvDrawerEmail.setText(authManager.getEmail());
        
        String avatarNavUrl = com.studentforum.app.utils.AppUtils.getAssetUrl(authManager.getAvatar());
        if (!avatarNavUrl.isEmpty()) {
            com.bumptech.glide.Glide.with(this).load(avatarNavUrl).circleCrop().into(ivDrawerAvatar);
        } else {
            ivDrawerAvatar.setImageResource(R.drawable.ic_profile);
        }

        navView.setNavigationItemSelectedListener(item -> {
            drawerLayout.closeDrawer(GravityCompat.START);
            return true;
        });

        // Nút Search mở SearchActivity
        View btnSearchHeader = findViewById(R.id.btnSearchHeader);
        btnSearchHeader.setOnClickListener(v -> {
            startActivity(new Intent(HomeActivity.this, SearchActivity.class));
        });

        // Nút Avatar mở PopupMenu
        ImageView ivUserAvatar = findViewById(R.id.ivUserAvatar);
        String avatarUrl = com.studentforum.app.utils.AppUtils.getAssetUrl(authManager.getAvatar());
        if (!avatarUrl.isEmpty()) {
            com.bumptech.glide.Glide.with(this)
                    .load(avatarUrl)
                    .placeholder(R.drawable.ic_profile)
                    .circleCrop()
                    .into(ivUserAvatar);
        } else {
            ivUserAvatar.setImageResource(R.drawable.ic_profile);
        }
        
        ivUserAvatar.setOnClickListener(v -> {
            PopupMenu popupMenu = new PopupMenu(HomeActivity.this, ivUserAvatar);
            popupMenu.getMenu().add("Trang cá nhân");
            popupMenu.getMenu().add("Đăng xuất");
            
            popupMenu.setOnMenuItemClickListener(item -> {
                if (item.getTitle().equals("Trang cá nhân")) {
                    Toast.makeText(HomeActivity.this, "Đang mở Profile...", Toast.LENGTH_SHORT).show();
                } else if (item.getTitle().equals("Đăng xuất")) {
                    authManager.logout();
                    startActivity(new Intent(HomeActivity.this, LoginActivity.class));
                    finish();
                }
                return true;
            });
            popupMenu.show();
        });
    }
}
