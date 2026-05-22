package com.studentforum.app.viewmodels;

import androidx.annotation.NonNull;
import androidx.lifecycle.ViewModel;
import androidx.lifecycle.ViewModelProvider;

import com.studentforum.app.api.ApiService;

public class ViewModelFactory implements ViewModelProvider.Factory {
    private final ApiService apiService;

    public ViewModelFactory(ApiService apiService) {
        this.apiService = apiService;
    }

    @NonNull
    @Override
    @SuppressWarnings("unchecked")
    public <T extends ViewModel> T create(@NonNull Class<T> modelClass) {
        if (modelClass.isAssignableFrom(AuthViewModel.class)) {
            return (T) new AuthViewModel(apiService);
        } else if (modelClass.isAssignableFrom(PostViewModel.class)) {
            return (T) new PostViewModel(apiService);
        } else if (modelClass.isAssignableFrom(AdminViewModel.class)) {
            return (T) new AdminViewModel(apiService);
        }
        throw new IllegalArgumentException("Unknown ViewModel class: " + modelClass.getName());
    }
}
