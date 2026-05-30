package com.studentforum.app.activities;

import android.content.Intent;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.View;
import android.widget.EditText;
import android.widget.ImageView;
import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.studentforum.app.R;
import com.studentforum.app.adapters.SearchAdapter;
import com.studentforum.app.adapters.TagAdapter;
import com.studentforum.app.api.ApiClient;
import com.studentforum.app.api.ApiService;
import com.studentforum.app.models.Post;
import com.studentforum.app.models.Topic;
import com.studentforum.app.models.responses.PostResponse;
import com.studentforum.app.models.responses.TopicResponse;
import com.studentforum.app.utils.AuthManager;
import com.studentforum.app.viewmodels.PostViewModel;
import com.studentforum.app.viewmodels.ViewModelFactory;
import java.util.List;

public class SearchActivity extends AppCompatActivity {
    private PostViewModel postViewModel;
    private SearchAdapter searchAdapter;
    private EditText edtSearch;
    private ImageView btnClear, btnBack;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_search);

        ApiService apiService = ApiClient.getClient(new AuthManager(this)).create(ApiService.class);
        postViewModel = new ViewModelProvider(this, new ViewModelFactory(apiService)).get(PostViewModel.class);

        edtSearch = findViewById(R.id.edtSearch);
        btnClear = findViewById(R.id.btnClear);
        btnBack = findViewById(R.id.btnBack);
        
        btnBack.setOnClickListener(v -> finish());

        RecyclerView rvSearchResults = findViewById(R.id.rvSearchResults);
        rvSearchResults.setLayoutManager(new LinearLayoutManager(this));
        searchAdapter = new SearchAdapter(this);
        rvSearchResults.setAdapter(searchAdapter);

        RecyclerView rvTags = findViewById(R.id.rvTags);
        TagAdapter tagAdapter = new TagAdapter();
        rvTags.setAdapter(tagAdapter);
        List<String> tags = java.util.Arrays.asList("Tất cả", "Nghiên cứu", "Tin tức", "Ngoại ngữ", "Thảo luận", "Hỏi đáp");
        tagAdapter.setTags(tags);

        searchAdapter.setOnPostClickListener(post -> {
            Intent intent = new Intent(SearchActivity.this, PostDetailActivity.class);
            intent.putExtra("POST_ID", post.getId());
            startActivity(intent);
        });

        edtSearch.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                if (s.length() > 0) {
                    btnClear.setVisibility(View.VISIBLE);
                    // Call search API when user types
                    postViewModel.setQuery(s.toString());
                } else {
                    btnClear.setVisibility(View.GONE);
                    // Khi xóa trắng tìm kiếm, tải lại danh sách cơ bản
                    postViewModel.setQuery(null);
                }
            }

            @Override
            public void afterTextChanged(Editable s) {}
        });

        btnClear.setOnClickListener(v -> {
            edtSearch.setText("");
        });

        postViewModel.getPosts().observe(this, posts -> {
            searchAdapter.setPosts(posts);
        });

        // Xóa block layoutLoading do không tồn tại id này trong layout

        // 1. Fetch some basic posts
        postViewModel.setQuery(null);

        // 2. Load real Hot Topics
        apiService.getTopics().enqueue(new retrofit2.Callback<TopicResponse>() {
            @Override
            public void onResponse(retrofit2.Call<TopicResponse> call, retrofit2.Response<TopicResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    List<Topic> topics = response.body().getTopics();
                    // Sort by postCount descending
                    if (topics != null) {
                        java.util.Collections.sort(topics, (t1, t2) -> Integer.compare(t2.getPostCount(), t1.getPostCount()));
                        android.widget.LinearLayout llHotTopics = findViewById(R.id.llHotTopics);
                        if (llHotTopics != null) {
                            for (int i = 0; i < Math.min(5, topics.size()); i++) {
                                Topic topic = topics.get(i);
                                android.widget.TextView tv = new android.widget.TextView(SearchActivity.this);
                                tv.setText("• " + topic.getName());
                                tv.setTextSize(13);
                                tv.setPadding(0, (int)(8 * getResources().getDisplayMetrics().density), 0, 0);
                                tv.setTextColor(android.graphics.Color.parseColor("#374151"));
                                tv.setOnClickListener(v -> edtSearch.setText(topic.getName()));
                                llHotTopics.addView(tv);
                            }
                        }
                    }
                    
                    android.widget.TextView tvHotTopicsTitle = findViewById(R.id.tvHotTopicsTitle);
                    if (tvHotTopicsTitle != null) {
                        tvHotTopicsTitle.setText("Chủ đề có nhiều bài viết nhất");
                    }
                }
            }
            @Override
            public void onFailure(retrofit2.Call<TopicResponse> call, Throwable t) {}
        });
    }
}
