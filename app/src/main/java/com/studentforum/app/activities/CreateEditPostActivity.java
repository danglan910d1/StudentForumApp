package com.studentforum.app.activities;

import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModel;
import androidx.lifecycle.ViewModelProvider;

import com.google.android.material.chip.Chip;
import com.studentforum.app.api.ApiClient;
import com.studentforum.app.api.ApiService;
import com.studentforum.app.databinding.ActivityCreateEditPostBinding;
import com.studentforum.app.models.Tag;
import com.studentforum.app.models.Topic;
import com.studentforum.app.utils.AuthManager;

import java.util.ArrayList;
import java.util.List;

public class CreateEditPostActivity extends AppCompatActivity {
    private ActivityCreateEditPostBinding binding;
    private CreateEditPostViewModel viewModel;
    
    private String postId;
    private boolean isEditMode = false;

    private List<Topic> topicsList = new ArrayList<>();
    private ArrayAdapter<String> topicAdapter;
    private ArrayAdapter<String> tagAdapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityCreateEditPostBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        if (getIntent() != null && getIntent().hasExtra("POST_ID")) {
            postId = getIntent().getStringExtra("POST_ID");
            isEditMode = true;
        }

        ApiService apiService = ApiClient.getClient(new AuthManager(this)).create(ApiService.class);
        viewModel = new ViewModelProvider(this, new ViewModelProvider.Factory() {
            @NonNull
            @Override
            public <T extends ViewModel> T create(@NonNull Class<T> modelClass) {
                return (T) new CreateEditPostViewModel(apiService);
            }
        }).get(CreateEditPostViewModel.class);

        initViews();
        setupMode();
        observeViewModel();
        
        viewModel.fetchTopics();
    }

    private void initViews() {
        topicAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item, new ArrayList<>());
        topicAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        binding.spinnerTopic.setAdapter(topicAdapter);

        tagAdapter = new ArrayAdapter<>(this, android.R.layout.simple_dropdown_item_1line, new ArrayList<>());
        binding.edtTagsInput.setAdapter(tagAdapter);
        binding.edtTagsInput.setEnabled(false);

        binding.edtTagsInput.setOnClickListener(v -> binding.edtTagsInput.showDropDown());
        binding.edtTagsInput.setOnFocusChangeListener((v, hasFocus) -> {
            if (hasFocus) {
                binding.edtTagsInput.showDropDown();
            }
        });

        binding.edtTagsInput.setOnItemClickListener((parent, view, position, id) -> {
            String selectedTag = tagAdapter.getItem(position);
            if (selectedTag != null) {
                addChipToGroup(selectedTag);
            }
            binding.edtTagsInput.setText("");
        });

        binding.edtTagsInput.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {}

            @Override
            public void afterTextChanged(Editable s) {
                String text = s.toString();
                if (text.endsWith(" ")) {
                    String newTag = text.trim();
                    if (!newTag.isEmpty()) {
                        addChipToGroup(newTag);
                    }
                    binding.edtTagsInput.setText("");
                }
            }
        });

        binding.spinnerTopic.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                if (!topicsList.isEmpty()) {
                    String topicId = topicsList.get(position).getId();
                    binding.edtTagsInput.setEnabled(true);
                    binding.edtTagsInput.setHint("Nhập thẻ cho " + topicsList.get(position).getName());
                    viewModel.fetchTags(topicId);
                }
            }
            @Override
            public void onNothingSelected(AdapterView<?> parent) {}
        });

        binding.btnBack.setOnClickListener(v -> finish());
        binding.btnCancel.setOnClickListener(v -> finish());
        binding.btnSave.setOnClickListener(v -> validateAndSavePost());
        
        binding.btnDeletePost.setOnClickListener(v -> {
            Toast.makeText(this, "Chức năng xóa chưa được cập nhật", Toast.LENGTH_SHORT).show();
        });
        
        binding.btnUploadImage.setOnClickListener(v -> {
            Toast.makeText(this, "Tính năng tải ảnh đang cập nhật...", Toast.LENGTH_SHORT).show();
        });
    }

    private void addChipToGroup(String text) {
        if (binding.chipGroupTags.getChildCount() >= 5) {
            Toast.makeText(this, "Chỉ được nhập tối đa 5 thẻ!", Toast.LENGTH_SHORT).show();
            return;
        }

        for (int i = 0; i < binding.chipGroupTags.getChildCount(); i++) {
            Chip chip = (Chip) binding.chipGroupTags.getChildAt(i);
            if (chip.getText().toString().equalsIgnoreCase(text)) {
                return; // Ngăn trùng lặp
            }
        }

        Chip chip = new Chip(this);
        chip.setText(text);
        chip.setCloseIconVisible(true);
        chip.setOnCloseIconClickListener(v -> binding.chipGroupTags.removeView(chip));
        binding.chipGroupTags.addView(chip);
    }

    private void setupMode() {
        if (isEditMode) {
            binding.tvHeaderTitle.setText("Chỉnh sửa bài viết");
            binding.btnDeletePost.setVisibility(View.VISIBLE);
            viewModel.fetchPostData(postId);
        } else {
            binding.tvHeaderTitle.setText("Tạo bài viết mới");
            binding.btnDeletePost.setVisibility(View.GONE);
        }
    }

    private void observeViewModel() {
        viewModel.getTopicsResult().observe(this, topics -> {
            topicsList = topics;
            topicAdapter.clear();
            for (Topic t : topics) {
                topicAdapter.add(t.getName());
            }
            topicAdapter.notifyDataSetChanged();
        });

        viewModel.getTagsResult().observe(this, tags -> {
            tagAdapter.clear();
            for (Tag t : tags) {
                tagAdapter.add(t.getName());
            }
            tagAdapter.notifyDataSetChanged();
        });

        viewModel.getPostResult().observe(this, post -> {
            binding.edtTitle.setText(post.getTitle());
            binding.edtContent.setText(post.getContent());
            
            if (post.getTags() != null) {
                binding.chipGroupTags.removeAllViews();
                for (Tag tag : post.getTags()) {
                    addChipToGroup(tag.getName());
                }
            }
            
            if (post.getTopic() != null) {
                for (int i = 0; i < topicsList.size(); i++) {
                    if (topicsList.get(i).getId().equals(post.getTopic().getId())) {
                        binding.spinnerTopic.setSelection(i);
                        break;
                    }
                }
            }
        });

        viewModel.getSaveSuccess().observe(this, success -> {
            if (success) {
                Toast.makeText(this, "Cập nhật bài viết thành công", Toast.LENGTH_SHORT).show();
                finish();
            }
        });

        viewModel.getErrorMessage().observe(this, msg -> {
            if (msg != null && !msg.isEmpty()) {
                Toast.makeText(this, msg, Toast.LENGTH_SHORT).show();
                viewModel.clearError();
            }
        });
    }

    private void validateAndSavePost() {
        String title = binding.edtTitle.getText().toString().trim();
        String content = binding.edtContent.getText().toString().trim();

        if (title.isEmpty() || content.isEmpty() || topicsList.isEmpty()) {
            Toast.makeText(this, "Vui lòng nhập đủ Tiêu đề, Nội dung và Chủ đề", Toast.LENGTH_SHORT).show();
            return;
        }

        String topicId = topicsList.get(binding.spinnerTopic.getSelectedItemPosition()).getId();
        
        List<String> finalTags = new ArrayList<>();
        for (int i = 0; i < binding.chipGroupTags.getChildCount(); i++) {
            Chip chip = (Chip) binding.chipGroupTags.getChildAt(i);
            finalTags.add(chip.getText().toString());
        }

        viewModel.savePost(title, content, topicId, finalTags, isEditMode, postId);
    }
}
