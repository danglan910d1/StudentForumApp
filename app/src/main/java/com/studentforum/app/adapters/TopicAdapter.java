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
        void onTopicClick(TopicWithTags topic);
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
        androidx.viewpager2.widget.ViewPager2 vpTags;
        View headerView; // Assuming we can make the header clickable
        
        View layoutPagination;
        TextView tvPageInfo;
        View btnPrevPage;
        View btnNextPage;

        public TopicSectionViewHolder(@NonNull View itemView) {
            super(itemView);
            tvTopicSectionName = itemView.findViewById(R.id.tvTopicSectionName);
            tvTopicTagCount = itemView.findViewById(R.id.tvTopicTagCount);
            vpTags = itemView.findViewById(R.id.vpTags);
            headerView = itemView.findViewById(R.id.llHeader); // Will check xml to ensure this ID exists
            
            layoutPagination = itemView.findViewById(R.id.layoutPagination);
            tvPageInfo = itemView.findViewById(R.id.tvPageInfo);
            btnPrevPage = itemView.findViewById(R.id.btnPrevPage);
            btnNextPage = itemView.findViewById(R.id.btnNextPage);
        }

        public void bind(TopicWithTags topicWithTags) {
            tvTopicSectionName.setText(topicWithTags.getTopic().getName());
            tvTopicTagCount.setText(String.valueOf(topicWithTags.getTags().size()));
            
            if (headerView != null) {
                headerView.setOnClickListener(v -> {
                    if (listener != null) {
                        listener.onTopicClick(topicWithTags);
                    }
                });
            } else {
                tvTopicSectionName.setOnClickListener(v -> {
                    if (listener != null) {
                        listener.onTopicClick(topicWithTags);
                    }
                });
            }
            
            TagPagerAdapter tagAdapter = new TagPagerAdapter(topicWithTags.getTags(), tag -> {
                if (listener != null) {
                    listener.onTagClick(tag);
                }
            });
            vpTags.setAdapter(tagAdapter);
            
            int totalPages = tagAdapter.getPagesCount();
            if (totalPages <= 1) {
                if (layoutPagination != null) layoutPagination.setVisibility(View.GONE);
            } else {
                if (layoutPagination != null) layoutPagination.setVisibility(View.VISIBLE);
                updatePaginationInfo(vpTags.getCurrentItem(), totalPages);
                
                if (btnPrevPage != null) {
                    btnPrevPage.setOnClickListener(v -> {
                        int current = vpTags.getCurrentItem();
                        if (current > 0) vpTags.setCurrentItem(current - 1);
                    });
                }
                if (btnNextPage != null) {
                    btnNextPage.setOnClickListener(v -> {
                        int current = vpTags.getCurrentItem();
                        if (current < totalPages - 1) vpTags.setCurrentItem(current + 1);
                    });
                }
                
                vpTags.registerOnPageChangeCallback(new androidx.viewpager2.widget.ViewPager2.OnPageChangeCallback() {
                    @Override
                    public void onPageSelected(int position) {
                        updatePaginationInfo(position, totalPages);
                    }
                });
            }
        }
        
        private void updatePaginationInfo(int current, int total) {
            if (tvPageInfo != null) {
                tvPageInfo.setText((current + 1) + " / " + total);
            }
        }
    }
}
