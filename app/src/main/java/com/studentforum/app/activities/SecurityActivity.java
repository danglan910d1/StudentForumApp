package com.studentforum.app.activities;

import android.os.Bundle;
import android.text.TextUtils;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import com.studentforum.app.api.ApiClient;
import com.studentforum.app.api.ApiService;
import com.studentforum.app.utils.AuthManager;
import com.studentforum.app.databinding.ActivitySecurityBinding;
import java.util.HashMap;
import java.util.Map;
import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class SecurityActivity extends AppCompatActivity {
    private ActivitySecurityBinding binding;
    private AuthManager authManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivitySecurityBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        binding.ivBack.setOnClickListener(v -> finish());

        binding.btnChangePassword.setOnClickListener(v -> {
            String currentPassword = binding.edtCurrentPassword.getText().toString();
            String newPassword = binding.edtNewPassword.getText().toString();
            String confirmPassword = binding.edtConfirmPassword.getText().toString();

            if (TextUtils.isEmpty(currentPassword) || TextUtils.isEmpty(newPassword) || TextUtils.isEmpty(confirmPassword)) {
                Toast.makeText(this, "Vui lòng nhập đầy đủ thông tin", Toast.LENGTH_SHORT).show();
                return;
            }

            if (!newPassword.equals(confirmPassword)) {
                Toast.makeText(this, "Mật khẩu xác nhận không khớp", Toast.LENGTH_SHORT).show();
                return;
            }

            if (newPassword.length() < 6) {
                Toast.makeText(this, "Mật khẩu mới phải có ít nhất 6 ký tự", Toast.LENGTH_SHORT).show();
                return;
            }

            changePassword(currentPassword, newPassword);
        });
    }

    private void changePassword(String currentPassword, String newPassword) {
        Map<String, String> data = new HashMap<>();
        data.put("currentPassword", currentPassword);
        data.put("newPassword", newPassword);

        authManager = new AuthManager(this);
        ApiService apiService = ApiClient.getClient(authManager).create(ApiService.class);

        apiService.changePassword(data).enqueue(new Callback<ResponseBody>() {
            @Override
            public void onResponse(Call<ResponseBody> call, Response<ResponseBody> response) {
                if (response.isSuccessful()) {
                    Toast.makeText(SecurityActivity.this, "Đổi mật khẩu thành công!", Toast.LENGTH_SHORT).show();
                    binding.edtCurrentPassword.setText("");
                    binding.edtNewPassword.setText("");
                    binding.edtConfirmPassword.setText("");
                } else {
                    Toast.makeText(SecurityActivity.this, "Đổi mật khẩu thất bại. Kiểm tra lại mật khẩu hiện tại.", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<ResponseBody> call, Throwable t) {
                Toast.makeText(SecurityActivity.this, "Lỗi kết nối", Toast.LENGTH_SHORT).show();
            }
        });
    }
}
