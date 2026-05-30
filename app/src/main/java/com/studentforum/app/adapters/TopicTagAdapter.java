package com.studentforum.app.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.studentforum.app.R;
import com.studentforum.app.models.Tag;

import java.util.ArrayList;
import java.util.List;

public class TopicTagAdapter extends RecyclerView.Adapter<TopicTagAdapter.TagViewHolder> {

    private List<Tag> tagList = new ArrayList<>();
    private OnTagClickListener listener;

    public interface OnTagClickListener {
        void onTagClick(Tag tag);
    }

    public TopicTagAdapter(OnTagClickListener listener) {
        this.listener = listener;
    }

    public void setTags(List<Tag> tags) {
        this.tagList = tags;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public TagViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_topic_card, parent, false);
        return new TagViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull TagViewHolder holder, int position) {
        Tag tag = tagList.get(position);
        holder.bind(tag);
    }

    @Override
    public int getItemCount() {
        return tagList.size();
    }

    class TagViewHolder extends RecyclerView.ViewHolder {
        TextView tvTopicName;
        TextView tvPostCount;

        public TagViewHolder(@NonNull View itemView) {
            super(itemView);
            // Reusing item_topic_card.xml
            tvTopicName = itemView.findViewById(R.id.tvTopicName);
            tvPostCount = itemView.findViewById(R.id.tvPostCount);
        }

        public void bind(Tag tag) {
            tvTopicName.setText(tag.getName());
            tvPostCount.setText("Thẻ"); // Ideally you show post count for tag, but tag doesn't have it in your current model
            itemView.setOnClickListener(v -> {
                if (listener != null) {
                    listener.onTagClick(tag);
                }
            });
        }
    }
}
