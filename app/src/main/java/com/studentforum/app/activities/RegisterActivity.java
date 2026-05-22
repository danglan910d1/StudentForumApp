package com.studentforum.app.activities;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import com.studentforum.app.R;
import com.studentforum.app.api.ApiClient;
import com.studentforum.app.api.ApiService;
import com.studentforum.app.utils.AuthManager;
import com.studentforum.app.viewmodels.AuthViewModel;

import androidx.lifecycle.ViewModelProvider;
import com.studentforum.app.viewmodels.ViewModelFactory;

public class RegisterActivity extends AppCompatActivity {
    private AuthViewModel authViewModel;
    private AuthManager authManager;
    private EditText etName, etEmail, etPassword;
    private Button btnRegister;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_register);

        authManager = new AuthManager(this);
        ApiService apiService = ApiClient.getClient(authManager).create(ApiService.class);

        ViewModelFactory factory = new ViewModelFactory(apiService);
        authViewModel = new ViewModelProvider(this, factory).get(AuthViewModel.class);

        // Ánh xạ View
        etName = findViewById(R.id.etName);
        etEmail = findViewById(R.id.etEmail);
        etPassword = findViewById(R.id.etPassword);
        btnRegister = findViewById(R.id.btnRegister);

        // Sự kiện chuyển sang Đăng nhập
        findViewById(R.id.tvLogin).setOnClickListener(v -> {
            startActivity(new Intent(this, LoginActivity.class));
            finish();
        });

        // Lắng nghe dữ liệu trả về từ ViewModel
        authViewModel.getAuthResult().observe(this, authResponse -> {
            authManager.saveSession(
                    authResponse.getToken(),
                    authResponse.getUser().getRole(),
                    authResponse.getUser().getId()
            );
            Toast.makeText(this, "Đăng ký thành công!", Toast.LENGTH_SHORT).show();
            startActivity(new Intent(this, HomeActivity.class));
            finish();
        });

        authViewModel.getError().observe(this, errorMsg -> {
            Toast.makeText(this, errorMsg, Toast.LENGTH_LONG).show();
        });

        // Bắt sự kiện Click
        btnRegister.setOnClickListener(v -> {
            String name = etName.getText().toString().trim();
            String email = etEmail.getText().toString().trim();
            String pwd = etPassword.getText().toString().trim();

            if(!name.isEmpty() && !email.isEmpty() && !pwd.isEmpty()) {
                authViewModel.register(name, email, pwd);
            } else {
                Toast.makeText(this, "Vui lòng nhập đủ các trường", Toast.LENGTH_SHORT).show();
            }
        });
    }
}
