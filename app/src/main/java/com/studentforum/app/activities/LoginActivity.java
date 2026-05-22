package com.studentforum.app.activities;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.databinding.DataBindingUtil;
import androidx.lifecycle.ViewModelProvider;
import com.studentforum.app.R;
import com.studentforum.app.api.ApiClient;
import com.studentforum.app.api.ApiService;
import android.widget.Button;
import android.widget.EditText;
import com.studentforum.app.utils.AuthManager;
import com.studentforum.app.viewmodels.AuthViewModel;
import com.studentforum.app.viewmodels.ViewModelFactory;

public class LoginActivity extends AppCompatActivity {
    private AuthViewModel authViewModel;
    private AuthManager authManager;
    private EditText etEmail, etPassword;
    private Button btnLogin;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        authManager = new AuthManager(this);
        authViewModel = new ViewModelProvider(this, new ViewModelFactory(ApiClient.getClient(authManager).create(ApiService.class)))
                .get(AuthViewModel.class);

        etEmail = findViewById(R.id.etEmail);
        etPassword = findViewById(R.id.etPassword);
        btnLogin = findViewById(R.id.btnLogin);

        // Sự kiện nhấn nút
        btnLogin.setOnClickListener(v -> {
            String email = etEmail.getText().toString().trim();
            String pwd = etPassword.getText().toString().trim();
            if(!email.isEmpty() && !pwd.isEmpty()) {
                authViewModel.login(email, pwd);
            } else {
                Toast.makeText(this, "Vui lòng nhập đủ thông tin", Toast.LENGTH_SHORT).show();
            }
        });

        // Sự kiện chuyển sang Đăng ký
        findViewById(R.id.tvRegister).setOnClickListener(v -> {
            startActivity(new Intent(this, RegisterActivity.class));
        });

        // Lắng nghe trạng thái
        authViewModel.getLoading().observe(this, loading -> btnLogin.setEnabled(!loading));

        authViewModel.getError().observe(this, errorMsg -> {
            if(errorMsg != null) Toast.makeText(this, errorMsg, Toast.LENGTH_SHORT).show();
        });

        authViewModel.getAuthResult().observe(this, authResponse -> {
            authManager.saveSession(authResponse.getToken(), authResponse.getUser().getRole(), authResponse.getUser().getId());
            startActivity(new Intent(this, HomeActivity.class));
            finish();
        });
    }
}