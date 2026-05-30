package com.studentforum.app.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.studentforum.app.R;
import com.studentforum.app.models.Tag;
import com.studentforum.app.models.TopicWithTags;

import java.util.ArrayList;
import java.util.List;

public class TopicAdapter extends RecyclerView.Adapter<RecyclerView.ViewHolder> {

    private List<TopicWithTags> topicList = new ArrayList<>();
    private OnTopicItemClickListener listener;

    public interface OnTopicItemClickListener {
        void onTagClick(Tag tag);
    }

    public TopicAdapter(OnTopicItemClickListener listener) {
        this.listener = listener;
    }

    public void setTopics(List<TopicWithTags> topics) {
        this.topicList = topics;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public RecyclerView.ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_topic_section, parent, false);
        return new TopicSectionViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull RecyclerView.ViewHolder holder, int position) {
        TopicWithTags topic = topicList.get(position);
        ((TopicSectionViewHolder) holder).bind(topic);
    }

    @Override
    public int getItemCount() {
        return topicList.size();
    }

    class TopicSectionViewHolder extends RecyclerView.ViewHolder {
        TextView tvTopicSectionName;
        TextView tvTopicTagCount;
        RecyclerView rvTags;

        public TopicSectionViewHolder(@NonNull View itemView) {
            super(itemView);
            tvTopicSectionName = itemView.findViewById(R.id.tvTopicSectionName);
            tvTopicTagCount = itemView.findViewById(R.id.tvTopicTagCount);
            rvTags = itemView.findViewById(R.id.rvTags);
            // Setup grid for tags
            rvTags.setLayoutManager(new GridLayoutManager(itemView.getContext(), 2));
        }

        public void bind(TopicWithTags topicWithTags) {
            tvTopicSectionName.setText(topicWithTags.getTopic().getName());
            tvTopicTagCount.setText(String.valueOf(topicWithTags.getTags().size()));
            
            TopicTagAdapter tagAdapter = new TopicTagAdapter(tag -> {
                if (listener != null) {
                    listener.onTagClick(tag);
                }
            });
            tagAdapter.setTags(topicWithTags.getTags());
            rvTags.setAdapter(tagAdapter);
        }
    }
}
