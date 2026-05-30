package com.studentforum.app.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.studentforum.app.R;
import com.studentforum.app.models.Tag;

import java.util.ArrayList;
import java.util.List;

public class TagPagerAdapter extends RecyclerView.Adapter<TagPagerAdapter.TagPageViewHolder> {

    private List<List<Tag>> tagPages = new ArrayList<>();
    private TopicTagAdapter.OnTagClickListener listener;

    public TagPagerAdapter(List<Tag> tags, TopicTagAdapter.OnTagClickListener listener) {
        this.listener = listener;
        setTags(tags);
    }

    public void setTags(List<Tag> tags) {
        this.tagPages.clear();
        int pageSize = 6;
        for (int i = 0; i < tags.size(); i += pageSize) {
            int end = Math.min(i + pageSize, tags.size());
            tagPages.add(new ArrayList<>(tags.subList(i, end)));
        }
        notifyDataSetChanged();
    }

    public int getPagesCount() {
        return tagPages.size();
    }

    @NonNull
    @Override
    public TagPageViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        RecyclerView rv = new RecyclerView(parent.getContext());
        rv.setLayoutParams(new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
        ));
        rv.setLayoutManager(new GridLayoutManager(parent.getContext(), 2));
        rv.setNestedScrollingEnabled(false);
        return new TagPageViewHolder(rv);
    }

    @Override
    public void onBindViewHolder(@NonNull TagPageViewHolder holder, int position) {
        TopicTagAdapter adapter = new TopicTagAdapter(listener);
        adapter.setTags(tagPages.get(position));
        holder.rvTags.setAdapter(adapter);
    }

    @Override
    public int getItemCount() {
        return tagPages.size();
    }

    static class TagPageViewHolder extends RecyclerView.ViewHolder {
        RecyclerView rvTags;

        public TagPageViewHolder(@NonNull View itemView) {
            super(itemView);
            rvTags = (RecyclerView) itemView;
        }
    }
}
