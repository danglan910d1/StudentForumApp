package com.studentforum.app.activities;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.bumptech.glide.Glide;
import com.studentforum.app.R;
import com.studentforum.app.api.ApiClient;
import com.studentforum.app.api.ApiService;
import com.studentforum.app.databinding.ActivityEditProfileBinding;
import com.studentforum.app.models.User;
import com.studentforum.app.models.UserProfile;
import com.studentforum.app.utils.AppUtils;
import com.studentforum.app.utils.AuthManager;

import java.util.HashMap;
import java.util.Map;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class EditProfileActivity extends AppCompatActivity {
    private static final String TAG = "EditProfileActivity";
    private ActivityEditProfileBinding binding;
    private AuthManager authManager;
    private ApiService apiService;
    private Uri selectedImageUri = null;
    private String currentAvatarUrl = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityEditProfileBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        authManager = new AuthManager(this);
        apiService = ApiClient.getClient(authManager).create(ApiService.class);

        setupUI();
        loadCurrentProfile();
    }

    private void setupUI() {
        binding.btnBack.setOnClickListener(v -> finish());
        
        binding.tvChangeAvatar.setOnClickListener(v -> pickImage());

        binding.btnSave.setOnClickListener(v -> saveProfile());
    }
    
    private void pickImage() {
        Intent intent = new Intent(Intent.ACTION_PICK, android.provider.MediaStore.Images.Media.EXTERNAL_CONTENT_URI);
        startActivityForResult(intent, 100);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == 100 && resultCode == RESULT_OK && data != null) {
            selectedImageUri = data.getData();
            binding.ivAvatarPreview.setImageURI(selectedImageUri);
        }
    }
    
    private void updateAvatarPreview(String url) {
        if (url != null && !url.trim().isEmpty()) {
            Glide.with(this)
                 .load(AppUtils.getAssetUrl(url))
                 .placeholder(R.drawable.ic_profile)
                 .error(R.drawable.ic_profile)
                 .circleCrop()
                 .into(binding.ivAvatarPreview);
        } else {
            binding.ivAvatarPreview.setImageResource(R.drawable.ic_profile);
        }
    }

    private void loadCurrentProfile() {
        apiService.getMyProfile().enqueue(new Callback<User>() {
            @Override
            public void onResponse(Call<User> call, Response<User> response) {
                if (response.isSuccessful() && response.body() != null) {
                    User profile = response.body();
                    binding.etName.setText(profile.getName());
                    binding.etEmail.setText(profile.getEmail());
                    currentAvatarUrl = profile.getAvatar();
                    updateAvatarPreview(currentAvatarUrl);
                } else {
                    Toast.makeText(EditProfileActivity.this, "Không thể tải hồ sơ!", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<User> call, Throwable t) {
                Log.e(TAG, "Error fetching profile", t);
                Toast.makeText(EditProfileActivity.this, "Lỗi kết nối", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void saveProfile() {
        String name = binding.etName.getText().toString().trim();
        String email = binding.etEmail.getText().toString().trim();

        if (name.isEmpty() || email.isEmpty()) {
            Toast.makeText(this, "Vui lòng nhập đầy đủ thông tin", Toast.LENGTH_SHORT).show();
            return;
        }

        binding.btnSave.setEnabled(false);
        binding.btnSave.setText("Đang lưu...");

        okhttp3.RequestBody nameBody = okhttp3.RequestBody.create(name, okhttp3.MediaType.parse("text/plain"));
        okhttp3.MultipartBody.Part avatarPart = null;
        
        if (selectedImageUri != null) {
            try {
                java.io.InputStream is = getContentResolver().openInputStream(selectedImageUri);
                byte[] bytes = new byte[is.available()];
                is.read(bytes);
                okhttp3.RequestBody requestFile = okhttp3.RequestBody.create(bytes, okhttp3.MediaType.parse("image/jpeg"));
                avatarPart = okhttp3.MultipartBody.Part.createFormData("avatar", "avatar.jpg", requestFile);
            } catch (Exception e) {
                e.printStackTrace();
            }
        } else {
            // Không đổi ảnh, hoặc truyền null string
            // Vì hiện tại API FE yêu cầu gửi "null" để xóa, ta bỏ qua không gửi để giữ nguyên
        }

        apiService.updateProfile(nameBody, avatarPart).enqueue(new Callback<User>() {
            @Override
            public void onResponse(Call<User> call, Response<User> response) {
                binding.btnSave.setEnabled(true);
                binding.btnSave.setText("Lưu thay đổi");
                if (response.isSuccessful() && response.body() != null) {
                    Toast.makeText(EditProfileActivity.this, "Cập nhật thành công!", Toast.LENGTH_SHORT).show();
                    finish(); // Quay lại ProfileActivity
                } else {
                    Toast.makeText(EditProfileActivity.this, "Cập nhật thất bại!", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<User> call, Throwable t) {
                binding.btnSave.setEnabled(true);
                binding.btnSave.setText("Lưu thay đổi");
                Log.e(TAG, "Update failed", t);
                Toast.makeText(EditProfileActivity.this, "Lỗi kết nối", Toast.LENGTH_SHORT).show();
            }
        });
    }
}