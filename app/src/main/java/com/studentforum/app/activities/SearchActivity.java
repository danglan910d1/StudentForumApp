package com.studentforum.app.activities;

import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.View;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.studentforum.app.R;

public class SearchActivity extends AppCompatActivity {

    private EditText edtSearch;
    private ImageView btnClear, btnBack;
    private View layoutHelp;
    private View rvSearchResults;
    
    // Handler cho Debounce
    private final Handler debounceHandler = new Handler(Looper.getMainLooper());
    private Runnable searchRunnable;
    private final long DEBOUNCE_DELAY = 500; // 500ms

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_search);

        edtSearch = findViewById(R.id.edtSearch);
        btnClear = findViewById(R.id.btnClear);
        btnBack = findViewById(R.id.btnBack);
        layoutHelp = findViewById(R.id.layoutHelp);
        rvSearchResults = findViewById(R.id.rvSearchResults);

        btnBack.setOnClickListener(v -> onBackPressed());

        btnClear.setOnClickListener(v -> {
            edtSearch.setText("");
            showHelp();
        });

        edtSearch.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                if (s.length() > 0) {
                    btnClear.setVisibility(View.VISIBLE);
                } else {
                    btnClear.setVisibility(View.GONE);
                    showHelp();
                }
            }

            @Override
            public void afterTextChanged(Editable s) {
                // Xoá task cũ nếu người dùng vẫn đang gõ
                if (searchRunnable != null) {
                    debounceHandler.removeCallbacks(searchRunnable);
                }

                String query = s.toString().trim();
                if (query.isEmpty()) return;

                // Tạo task mới sẽ chạy sau 500ms
                searchRunnable = () -> performSearch(query);
                debounceHandler.postDelayed(searchRunnable, DEBOUNCE_DELAY);
            }
        });
    }

    private void performSearch(String query) {
        layoutHelp.setVisibility(View.GONE);
        rvSearchResults.setVisibility(View.VISIBLE);

        // Phân tích cú pháp (giống logic FE)
        boolean isTagSearch = query.startsWith("[") && query.endsWith("]");
        boolean isTopicSearch = query.startsWith("topic:");
        
        String cleanQuery = query;
        if (isTagSearch) {
            cleanQuery = query.substring(1, query.length() - 1);
            Toast.makeText(this, "Đang tìm Tag: " + cleanQuery, Toast.LENGTH_SHORT).show();
        } else if (isTopicSearch) {
            cleanQuery = query.replace("topic:", "").trim();
            Toast.makeText(this, "Đang tìm Topic: " + cleanQuery, Toast.LENGTH_SHORT).show();
        } else {
            Toast.makeText(this, "Đang tìm kiếm: " + cleanQuery, Toast.LENGTH_SHORT).show();
        }

        // TODO: Gọi ApiService: apiService.search(cleanQuery, type) -> Cập nhật RecyclerView Adapter
    }
    
    private void showHelp() {
        layoutHelp.setVisibility(View.VISIBLE);
        rvSearchResults.setVisibility(View.GONE);
        if (searchRunnable != null) {
            debounceHandler.removeCallbacks(searchRunnable);
        }
    }
}
