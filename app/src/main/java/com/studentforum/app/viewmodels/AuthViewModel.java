package com.studentforum.app.viewmodels;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;
import com.studentforum.app.api.ApiService;
import com.studentforum.app.models.responses.AuthResponse;
import java.util.HashMap;
import java.util.Map;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class AuthViewModel extends ViewModel {
    private final ApiService apiService;
    private final MutableLiveData<AuthResponse> authResult = new MutableLiveData<>();
    private final MutableLiveData<String> error = new MutableLiveData<>();
    private final MutableLiveData<Boolean> loading = new MutableLiveData<>();

    public AuthViewModel(ApiService apiService) {
        this.apiService = apiService;
    }

    public LiveData<AuthResponse> getAuthResult() { return authResult; }
    public LiveData<String> getError() { return error; }
    public LiveData<Boolean> getLoading() { return loading; }

    public void login(String email, String password) {
        loading.setValue(true);
        Map<String, String> body = new HashMap<>();
        body.put("email", email);
        body.put("password", password);

        apiService.login(body).enqueue(new Callback<AuthResponse>() {
            @Override
            public void onResponse(Call<AuthResponse> call, Response<AuthResponse> response) {
                loading.setValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    // Kiểm tra User null để không crash ở Activity
                    if (response.body().getUser() != null) {
                        authResult.setValue(response.body());
                    } else {
                        error.setValue("Dữ liệu tài khoản không hợp lệ!");
                    }
                } else {
                    error.setValue("Sai email hoặc mật khẩu.");
                }
            }
            @Override
            public void onFailure(Call<AuthResponse> call, Throwable t) {
                loading.setValue(false);
                error.setValue("Lỗi mạng: " + t.getMessage());
            }
        });
    }
    public void register(String name, String email, String password) {
        loading.setValue(true);
        Map<String, String> body = new HashMap<>();
        body.put("name", name);
        body.put("email", email);
        body.put("password", password);

        apiService.register(body).enqueue(new Callback<AuthResponse>() {
            @Override
            public void onResponse(Call<AuthResponse> call, Response<AuthResponse> response) {
                loading.setValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    authResult.setValue(response.body());
                } else {
                    error.setValue("Đăng ký thất bại. Email có thể đã tồn tại.");
                }
            }

            @Override
            public void onFailure(Call<AuthResponse> call, Throwable t) {
                loading.setValue(false);
                error.setValue("Lỗi kết nối: " + t.getMessage());
            }
        });
    }
}
