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

public class PostTagAdapter extends RecyclerView.Adapter<PostTagAdapter.TagViewHolder> {

    private List<Tag> tagList = new ArrayList<>();
    private final OnTagClickListener listener;

    public interface OnTagClickListener {
        void onTagClick(Tag tag);
    }

    public PostTagAdapter(OnTagClickListener listener) {
        this.listener = listener;
    }

    public void setTags(List<Tag> tags) {
        this.tagList = tags;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public TagViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_tag, parent, false);
        return new TagViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull TagViewHolder holder, int position) {
        Tag tag = tagList.get(position);
        holder.tvTagName.setText(tag.getName());
        holder.itemView.setOnClickListener(v -> {
            if (listener != null) {
                listener.onTagClick(tag);
            }
        });
    }

    @Override
    public int getItemCount() {
        return tagList == null ? 0 : tagList.size();
    }

    static class TagViewHolder extends RecyclerView.ViewHolder {
        TextView tvTagName;

        public TagViewHolder(@NonNull View itemView) {
            super(itemView);
            tvTagName = itemView.findViewById(R.id.tvTagName);
        }
    }
}
