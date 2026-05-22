package com.studentforum.app.activities;

import android.os.Bundle;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.studentforum.app.R;
import com.studentforum.app.adapters.PostAdapter;
import com.studentforum.app.api.ApiClient;
import com.studentforum.app.api.ApiService;
import com.studentforum.app.utils.AuthManager;
import com.studentforum.app.viewmodels.PostViewModel;

import androidx.lifecycle.ViewModelProvider;
import com.studentforum.app.viewmodels.ViewModelFactory;

public class ManagePostsActivity extends AppCompatActivity {
    private PostViewModel postViewModel;
    private PostAdapter adapter;
    private AuthManager authManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_manage_posts);

        authManager = new AuthManager(this);
        ApiService apiService = ApiClient.getClient(authManager).create(ApiService.class);

        ViewModelFactory factory = new ViewModelFactory(apiService);
        postViewModel = new ViewModelProvider(this, factory).get(PostViewModel.class);

        adapter = new PostAdapter(this);
        RecyclerView rvMyPosts = findViewById(R.id.rvMyPosts);
        rvMyPosts.setLayoutManager(new LinearLayoutManager(this));
        rvMyPosts.setAdapter(adapter);

        postViewModel.getPosts().observe(this, posts -> adapter.setPosts(posts));
        postViewModel.getError().observe(this, err -> Toast.makeText(this, err, Toast.LENGTH_SHORT).show());

        // Gọi API lấy bài viết của chính mình
        postViewModel.fetchMyPosts("me");
    }
}
