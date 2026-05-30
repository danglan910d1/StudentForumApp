package com.studentforum.app.activities;

import android.content.Intent;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.widget.EditText;
import android.widget.Toast;

import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.studentforum.app.R;
import com.studentforum.app.adapters.TopicAdapter;
import com.studentforum.app.api.ApiClient;
import com.studentforum.app.api.ApiService;
import com.studentforum.app.models.Topic;
import com.studentforum.app.models.responses.TopicResponse;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

import com.studentforum.app.models.TopicWithTags;

public class TopicActivity extends BaseActivity implements TopicAdapter.OnTopicItemClickListener {

    private TopicAdapter adapter;
    private List<TopicWithTags> allTopics = new ArrayList<>();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_topic);

        setupDrawer(R.id.nav_topics);
        setupFooter(R.id.nav_topics);

        RecyclerView rvTopics = findViewById(R.id.rvTopics);
        rvTopics.setLayoutManager(new androidx.recyclerview.widget.LinearLayoutManager(this));
        adapter = new TopicAdapter(this);
        rvTopics.setAdapter(adapter);

        EditText etSearchTopic = findViewById(R.id.etSearchTopic);
        etSearchTopic.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}
            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {}
            @Override
            public void afterTextChanged(Editable s) {
                filterTopics(s.toString());
            }
        });

        loadTopicsAndTags();
    }



    private void loadTopicsAndTags() {
        ApiService apiService = ApiClient.getClient(authManager).create(ApiService.class);
        
        apiService.getTopics().enqueue(new Callback<TopicResponse>() {
            @Override
            public void onResponse(Call<TopicResponse> call, Response<TopicResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    List<Topic> topics = response.body().getTopics();
                    if (topics != null) {
                        fetchTagsAndMerge(apiService, topics);
                    }
                } else {
                    Toast.makeText(TopicActivity.this, "Lỗi khi tải chủ đề", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<TopicResponse> call, Throwable t) {
                Toast.makeText(TopicActivity.this, "Lỗi kết nối", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void fetchTagsAndMerge(ApiService apiService, List<Topic> topics) {
        // Assume getTags() without topicId returns all tags, or we can just fetch tags if backend supports it.
        // Actually since we don't have an getAllTags endpoint defined, we fetch all tags with topicId null
        apiService.getTags(null).enqueue(new Callback<com.studentforum.app.models.responses.TagResponse>() {
            @Override
            public void onResponse(Call<com.studentforum.app.models.responses.TagResponse> call, Response<com.studentforum.app.models.responses.TagResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    List<com.studentforum.app.models.Tag> tags = response.body().getTags();
                    if (tags != null) {
                        mergeTopicsAndTags(topics, tags);
                    }
                } else {
                    Toast.makeText(TopicActivity.this, "Lỗi khi tải thẻ", Toast.LENGTH_SHORT).show();
                }
            }
            @Override
            public void onFailure(Call<com.studentforum.app.models.responses.TagResponse> call, Throwable t) {
                Toast.makeText(TopicActivity.this, "Lỗi kết nối thẻ", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void mergeTopicsAndTags(List<Topic> topics, List<com.studentforum.app.models.Tag> tags) {
        List<com.studentforum.app.models.TopicWithTags> mergedList = new ArrayList<>();
        for (Topic topic : topics) {
            com.studentforum.app.models.TopicWithTags twt = new com.studentforum.app.models.TopicWithTags(topic);
            for (com.studentforum.app.models.Tag tag : tags) {
                if (tag.getTopic() != null && topic.getId() != null && topic.getId().equals(tag.getTopic().getId())) {
                    twt.addTag(tag);
                }
            }
            if (!twt.getTags().isEmpty()) {
                mergedList.add(twt);
            }
        }
        allTopics = mergedList;
        adapter.setTopics(allTopics);
    }

    private void filterTopics(String query) {
        if (query.isEmpty()) {
            adapter.setTopics(allTopics);
        } else {
            List<com.studentforum.app.models.TopicWithTags> filtered = new ArrayList<>();
            for (com.studentforum.app.models.TopicWithTags twt : allTopics) {
                com.studentforum.app.models.TopicWithTags filteredTwt = new com.studentforum.app.models.TopicWithTags(twt.getTopic());
                for (com.studentforum.app.models.Tag tag : twt.getTags()) {
                    if (tag.getName() != null && tag.getName().toLowerCase().contains(query.toLowerCase())) {
                        filteredTwt.addTag(tag);
                    }
                }
                if (!filteredTwt.getTags().isEmpty()) {
                    filtered.add(filteredTwt);
                }
            }
            adapter.setTopics(filtered);
        }
    }

    @Override
    public void onTagClick(com.studentforum.app.models.Tag tag) {
        // Handle tag click.
        Intent intent = new Intent(this, SearchActivity.class);
        intent.putExtra("SEARCH_QUERY", tag.getName());
        startActivity(intent);
    }
}
