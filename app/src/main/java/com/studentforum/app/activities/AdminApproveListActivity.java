package com.studentforum.app.activities;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Toast;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import com.studentforum.app.adapters.PostAdapter;
import com.studentforum.app.api.ApiClient;
import com.studentforum.app.api.ApiService;
import com.studentforum.app.databinding.ActivityAdminApproveListBinding;
import com.studentforum.app.models.Post;
import com.studentforum.app.models.responses.PostResponse;
import com.studentforum.app.utils.AuthManager;
import java.util.ArrayList;
import java.util.List;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class AdminApproveListActivity extends AppCompatActivity {
    private ActivityAdminApproveListBinding binding;
    private PostAdapter postAdapter;
    private List<Post> pendingPosts = new ArrayList<>();
    private ApiService apiService;
    private AuthManager authManager;

    private final ActivityResultLauncher<Intent> detailActivityLauncher = registerForActivityResult(
            new ActivityResultContracts.StartActivityForResult(),
            result -> {
                if (result.getResultCode() == RESULT_OK) {
                    loadPendingPosts();
                }
            }
    );

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityAdminApproveListBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        authManager = new AuthManager(this);
        apiService = ApiClient.getClient(authManager).create(ApiService.class);

        binding.header.btnBack.setOnClickListener(v -> finish());
        binding.header.tvHeaderTitle.setText("Duyệt Bài Viết");

        setupRecyclerView();

        binding.swipeRefreshLayout.setOnRefreshListener(this::loadPendingPosts);

        loadPendingPosts();
    }

    private void setupRecyclerView() {
        binding.rvPendingPosts.setLayoutManager(new LinearLayoutManager(this));
        postAdapter = new PostAdapter(this);
        binding.rvPendingPosts.setAdapter(postAdapter);

        postAdapter.setOnPostClickListener(new PostAdapter.OnPostClickListener() {
            @Override
            public void onPostClick(Post post) {
                Intent intent = new Intent(AdminApproveListActivity.this, AdminApproveDetailActivity.class);
                intent.putExtra("postId", post.getId());
                detailActivityLauncher.launch(intent);
            }

            @Override
            public void onAuthorClick(Post post) {}

            @Override
            public void onLikeClick(Post post, int position) {}
        });
    }

    private void loadPendingPosts() {
        binding.swipeRefreshLayout.setRefreshing(true);
        binding.progressBar.setVisibility(pendingPosts.isEmpty() ? View.VISIBLE : View.GONE);
        binding.tvEmpty.setVisibility(View.GONE);

        // Gọi API lấy danh sách bài chờ duyệt (adminView=true, status="pending")
        apiService.getPostsForAdmin(true, "pending").enqueue(new Callback<PostResponse>() {
            @Override
            public void onResponse(Call<PostResponse> call, Response<PostResponse> response) {
                binding.swipeRefreshLayout.setRefreshing(false);
                binding.progressBar.setVisibility(View.GONE);
                
                if (response.isSuccessful() && response.body() != null) {
                    pendingPosts.clear();
                    pendingPosts.addAll(response.body().getPosts());
                    postAdapter.setPosts(pendingPosts);
                    
                    if (pendingPosts.isEmpty()) {
                        binding.tvEmpty.setVisibility(View.VISIBLE);
                    }
                } else {
                    Toast.makeText(AdminApproveListActivity.this, "Lỗi tải danh sách", Toast.LENGTH_SHORT).show();
                }
            }

                        @Override
            public void onFailure(Call<PostResponse> call, Throwable t) {
                binding.swipeRefreshLayout.setRefreshing(false);
                binding.progressBar.setVisibility(View.GONE);
                Toast.makeText(AdminApproveListActivity.this, "Lỗi mạng", Toast.LENGTH_SHORT).show();
            }
        });
    }
}