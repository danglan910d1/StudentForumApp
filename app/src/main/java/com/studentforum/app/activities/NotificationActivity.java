package com.studentforum.app.activities;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.ProgressBar;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.studentforum.app.R;
import com.studentforum.app.adapters.NotificationAdapter;
import com.studentforum.app.api.ApiClient;
import com.studentforum.app.api.ApiService;
import com.studentforum.app.models.Notification;
import com.studentforum.app.models.responses.NotificationResponse;
import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import java.util.List;

public class NotificationActivity extends AppCompatActivity implements NotificationAdapter.OnNotificationClickListener {

    private RecyclerView rvNotifications;
    private NotificationAdapter adapter;
    private ProgressBar progressBar;
    private View layoutEmptyState;
    private ApiService apiService;
    
    private int currentPage = 1;
    private int totalPages = 1;
    private boolean isLoading = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_notification);

        apiService = ApiClient.getClient(new com.studentforum.app.utils.AuthManager(this)).create(ApiService.class);

        rvNotifications = findViewById(R.id.rvNotifications);
        progressBar = findViewById(R.id.progressBar);
        layoutEmptyState = findViewById(R.id.layoutEmptyState);

        findViewById(R.id.btnBack).setOnClickListener(v -> finish());

        setupRecyclerView();
        loadNotifications(1);
    }

    private void setupRecyclerView() {
        adapter = new NotificationAdapter(this, this);
        LinearLayoutManager layoutManager = new LinearLayoutManager(this);
        rvNotifications.setLayoutManager(layoutManager);
        rvNotifications.setAdapter(adapter);

        rvNotifications.addOnScrollListener(new RecyclerView.OnScrollListener() {
            @Override
            public void onScrolled(RecyclerView recyclerView, int dx, int dy) {
                if (dy > 0 && !isLoading && currentPage < totalPages) {
                    int visibleItemCount = layoutManager.getChildCount();
                    int totalItemCount = layoutManager.getItemCount();
                    int pastVisibleItems = layoutManager.findFirstVisibleItemPosition();

                    if ((visibleItemCount + pastVisibleItems) >= totalItemCount) {
                        loadNotifications(currentPage + 1);
                    }
                }
            }
        });
    }

    private void loadNotifications(int page) {
        isLoading = true;
        if (page == 1) {
            progressBar.setVisibility(View.VISIBLE);
        }

        apiService.getNotifications(page, 15).enqueue(new Callback<NotificationResponse>() {
            @Override
            public void onResponse(Call<NotificationResponse> call, Response<NotificationResponse> response) {
                isLoading = false;
                progressBar.setVisibility(View.GONE);

                if (response.isSuccessful() && response.body() != null) {
                    List<Notification> data = response.body().getData();
                    totalPages = response.body().getPagination().getTotalPages();
                    currentPage = page;

                    if (page == 1) {
                        if (data == null || data.isEmpty()) {
                            layoutEmptyState.setVisibility(View.VISIBLE);
                            rvNotifications.setVisibility(View.GONE);
                        } else {
                            layoutEmptyState.setVisibility(View.GONE);
                            rvNotifications.setVisibility(View.VISIBLE);
                            adapter.setNotifications(data);
                        }
                    } else {
                        adapter.addNotifications(data);
                    }
                } else {
                    Toast.makeText(NotificationActivity.this, "Không thể tải thông báo", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<NotificationResponse> call, Throwable t) {
                isLoading = false;
                progressBar.setVisibility(View.GONE);
                Toast.makeText(NotificationActivity.this, "Lỗi kết nối", Toast.LENGTH_SHORT).show();
            }
        });
    }

    @Override
    public void onNotificationClick(Notification notification, int position) {
        // Đánh dấu đã đọc
        if (!notification.isRead()) {
            apiService.markNotificationAsRead(notification.getId()).enqueue(new Callback<ResponseBody>() {
                @Override
                public void onResponse(Call<ResponseBody> call, Response<ResponseBody> response) {
                    if (response.isSuccessful()) {
                        adapter.markAsRead(position);
                    }
                }
                @Override
                public void onFailure(Call<ResponseBody> call, Throwable t) {}
            });
        }

        // Chuyển hướng
        if ("post".equals(notification.getTargetType()) || "comment".equals(notification.getTargetType())) {
            if (notification.getTargetId() != null) {
                Intent intent = new Intent(this, PostDetailActivity.class);
                intent.putExtra("POST_ID", notification.getTargetId());
                startActivity(intent);
            } else {
                // Trong trường hợp comment không được populate slug ở backend
                // Cần dùng Target ID, nhưng hiện tại backend notificationPipeline trả về targetSlug cho cả comment nếu join đúng.
                Toast.makeText(this, "Chưa hỗ trợ mở liên kết này", Toast.LENGTH_SHORT).show();
            }
        }
    }
}
