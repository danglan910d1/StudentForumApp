package com.studentforum.app.activities;

import android.os.Bundle;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.google.android.material.tabs.TabLayout;
import com.studentforum.app.R;
import com.studentforum.app.adapters.PostAdapter;
import com.studentforum.app.api.ApiClient;
import com.studentforum.app.api.ApiService;
import com.studentforum.app.utils.AuthManager;
import com.studentforum.app.viewmodels.AdminViewModel;

import androidx.lifecycle.ViewModelProvider;
import com.studentforum.app.viewmodels.ViewModelFactory;

public class AdminModerationActivity extends AppCompatActivity {
    private AdminViewModel adminViewModel;
    private PostAdapter adapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_admin_moderation);

        AuthManager authManager = new AuthManager(this);
        ApiService apiService = ApiClient.getClient(authManager).create(ApiService.class);

        ViewModelFactory factory = new ViewModelFactory(apiService);
        adminViewModel = new ViewModelProvider(this, factory).get(AdminViewModel.class);

        adapter = new PostAdapter(this);
        RecyclerView rvAdminPosts = findViewById(R.id.rvAdminPosts);
        rvAdminPosts.setLayoutManager(new LinearLayoutManager(this));
        rvAdminPosts.setAdapter(adapter);

        TabLayout tabLayout = findViewById(R.id.tabLayout);
        tabLayout.addOnTabSelectedListener(new TabLayout.OnTabSelectedListener() {
            @Override
            public void onTabSelected(TabLayout.Tab tab) {
                String status = "pending";
                if (tab.getPosition() == 1) status = "approved";
                else if (tab.getPosition() == 2) status = "rejected";
                adminViewModel.fetchPostsByStatus(status);
            }
            @Override public void onTabUnselected(TabLayout.Tab tab) {}
            @Override public void onTabReselected(TabLayout.Tab tab) {}
        });

        adminViewModel.getAdminPosts().observe(this, posts -> adapter.setPosts(posts));

        adminViewModel.getError().observe(this, err ->
                Toast.makeText(this, err, Toast.LENGTH_SHORT).show()
        );

        // Fetch mặc định pending
        adminViewModel.fetchPostsByStatus("pending");
    }
}
