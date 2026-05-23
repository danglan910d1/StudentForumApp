package com.studentforum.app.adapters;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.studentforum.app.R;
import com.studentforum.app.models.Post;
import java.util.ArrayList;
import java.util.List;

public class SearchAdapter extends RecyclerView.Adapter<SearchAdapter.SearchViewHolder> {
    private List<Post> postList = new ArrayList<>();
    private final Context context;
    private OnPostClickListener listener;

    public interface OnPostClickListener {
        void onPostClick(Post post);
    }

    public SearchAdapter(Context context) {
        this.context = context;
    }

    public void setOnPostClickListener(OnPostClickListener listener) {
        this.listener = listener;
    }

    public void setPosts(List<Post> posts) {
        this.postList = posts;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public SearchViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.item_search_result, parent, false);
        return new SearchViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull SearchViewHolder holder, int position) {
        Post post = postList.get(position);
        holder.tvTitle.setText(post.getTitle());
        holder.tvExcerpt.setText(post.getContent());
        if (post.getTopic() != null) {
            holder.tvTag.setText(post.getTopic().getName().toUpperCase());
        }
        if (post.getAuthor() != null) {
            holder.tvMeta.setText("Đăng bởi: " + post.getAuthor().getName());
        }
        
        holder.itemView.setOnClickListener(v -> {
            if (listener != null) listener.onPostClick(post);
        });
    }

    @Override
    public int getItemCount() {
        return postList.size();
    }

    public static class SearchViewHolder extends RecyclerView.ViewHolder {
        TextView tvTitle, tvExcerpt, tvTag, tvMeta;

        public SearchViewHolder(@NonNull View itemView) {
            super(itemView);
            tvTitle = itemView.findViewById(R.id.tvTitle);
            tvExcerpt = itemView.findViewById(R.id.tvExcerpt);
            tvTag = itemView.findViewById(R.id.tvTag);
            tvMeta = itemView.findViewById(R.id.tvMeta);
        }
    }
}
