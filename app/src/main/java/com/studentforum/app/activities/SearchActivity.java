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
import com.studentforum.app.api.ApiClient;
import com.studentforum.app.api.ApiService;
import com.studentforum.app.utils.AuthManager;
import com.studentforum.app.viewmodels.PostViewModel;
import com.studentforum.app.viewmodels.ViewModelFactory;

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
                    postViewModel.fetchFeed(1, s.toString());
                } else {
                    btnClear.setVisibility(View.GONE);
                    searchAdapter.setPosts(new java.util.ArrayList<>()); // Clear results
                }
            }

            @Override
            public void afterTextChanged(Editable s) {}
        });

        btnClear.setOnClickListener(v -> {
            edtSearch.setText("");
        });

        postViewModel.getPosts().observe(this, posts -> {
            if (edtSearch.getText().length() > 0) {
                searchAdapter.setPosts(posts);
            }
        });

        View layoutLoading = findViewById(R.id.layoutLoading);
        postViewModel.getLoading().observe(this, isLoading -> {
            if (layoutLoading != null) {
                layoutLoading.setVisibility(isLoading ? View.VISIBLE : View.GONE);
            }
        });
    }
}
