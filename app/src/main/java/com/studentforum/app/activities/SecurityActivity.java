package com.studentforum.app.activities;

import android.os.Bundle;
import android.text.TextUtils;
import android.view.View;
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

        binding.header.btnBack.setOnClickListener(v -> finish());
        binding.header.tvHeaderTitle.setText("Cài đặt bảo mật");

        binding.edtCurrentPassword.addTextChangedListener(new android.text.TextWatcher() {
            @Override public void beforeTextChanged(CharSequence s, int start, int count, int after) {}
            @Override public void onTextChanged(CharSequence s, int start, int before, int count) {}
            @Override public void afterTextChanged(android.text.Editable s) {
                binding.tvErrorCurrentPassword.setVisibility(View.GONE);
                binding.llBackendError.setVisibility(View.GONE);
            }
        });

        binding.edtNewPassword.addTextChangedListener(new android.text.TextWatcher() {
            @Override public void beforeTextChanged(CharSequence s, int start, int count, int after) {}
            @Override public void onTextChanged(CharSequence s, int start, int before, int count) {}
            @Override public void afterTextChanged(android.text.Editable s) {
                binding.tvErrorNewPassword.setVisibility(View.GONE);
                binding.llBackendError.setVisibility(View.GONE);
            }
        });

        binding.edtConfirmPassword.addTextChangedListener(new android.text.TextWatcher() {
            @Override public void beforeTextChanged(CharSequence s, int start, int count, int after) {}
            @Override public void onTextChanged(CharSequence s, int start, int before, int count) {}
            @Override public void afterTextChanged(android.text.Editable s) {
                binding.tvErrorConfirmPassword.setVisibility(View.GONE);
                binding.llBackendError.setVisibility(View.GONE);
            }
        });

        binding.btnChangePassword.setOnClickListener(v -> {
            String currentPassword = binding.edtCurrentPassword.getText().toString();
            String newPassword = binding.edtNewPassword.getText().toString();
            String confirmPassword = binding.edtConfirmPassword.getText().toString();

            boolean isValid = true;
            binding.tvErrorCurrentPassword.setVisibility(View.GONE);
            binding.tvErrorNewPassword.setVisibility(View.GONE);
            binding.tvErrorConfirmPassword.setVisibility(View.GONE);
            binding.llBackendError.setVisibility(View.GONE);

            if (TextUtils.isEmpty(currentPassword)) {
                binding.tvErrorCurrentPassword.setText("Vui lòng nhập mật khẩu hiện tại");
                binding.tvErrorCurrentPassword.setVisibility(View.VISIBLE);
                isValid = false;
            }

            if (TextUtils.isEmpty(newPassword)) {
                binding.tvErrorNewPassword.setText("Vui lòng nhập mật khẩu mới");
                binding.tvErrorNewPassword.setVisibility(View.VISIBLE);
                isValid = false;
            } else if (newPassword.length() < 6) {
                binding.tvErrorNewPassword.setText("Mật khẩu mới phải có ít nhất 6 ký tự");
                binding.tvErrorNewPassword.setVisibility(View.VISIBLE);
                isValid = false;
            }

            if (TextUtils.isEmpty(confirmPassword)) {
                binding.tvErrorConfirmPassword.setText("Vui lòng xác nhận mật khẩu mới");
                binding.tvErrorConfirmPassword.setVisibility(View.VISIBLE);
                isValid = false;
            } else if (!newPassword.equals(confirmPassword)) {
                binding.tvErrorConfirmPassword.setText("Mật khẩu xác nhận không khớp");
                binding.tvErrorConfirmPassword.setVisibility(View.VISIBLE);
                isValid = false;
            }

            if (!isValid) return;

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
                    binding.llBackendError.setVisibility(View.GONE);
                } else {
                    binding.tvBackendError.setText("Đổi mật khẩu thất bại. Kiểm tra lại mật khẩu hiện tại.");
                    binding.llBackendError.setVisibility(View.VISIBLE);
                }
            }

            @Override
            public void onFailure(Call<ResponseBody> call, Throwable t) {
                binding.tvBackendError.setText("Lỗi kết nối đến máy chủ");
                binding.llBackendError.setVisibility(View.VISIBLE);
            }
        });
    }
}