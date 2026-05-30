package com.studentforum.app.components;

import android.content.Context;
import android.content.Intent;
import android.util.AttributeSet;
import android.view.LayoutInflater;
import android.widget.FrameLayout;
import com.bumptech.glide.Glide;
import com.google.android.material.imageview.ShapeableImageView;
import com.studentforum.app.R;
import com.studentforum.app.activities.ProfileActivity;
import com.studentforum.app.models.User;
import com.studentforum.app.utils.AppUtils;

public class AuthorAvatarView extends FrameLayout {
    public static final String KEY_USER_ID = "USER_ID";
    
    private ShapeableImageView ivAvatar;

    public AuthorAvatarView(Context context) {
        super(context);
        init(context);
    }

    public AuthorAvatarView(Context context, AttributeSet attrs) {
        super(context, attrs);
        init(context);
    }

    public AuthorAvatarView(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init(context);
    }

    private void init(Context context) {
        LayoutInflater.from(context).inflate(R.layout.view_author_avatar, this, true);
        ivAvatar = findViewById(R.id.ivAvatar);
    }

    public void setAuthor(User author) {
        if (author == null) {
            setVisibility(GONE);
            return;
        }

        setVisibility(VISIBLE);

        String avatarUrl = AppUtils.getAssetUrl(author.getAvatar());
        if (!avatarUrl.isEmpty()) {
            Glide.with(getContext())
                 .load(avatarUrl)
                 .placeholder(R.drawable.ic_profile)
                 .circleCrop()
                 .into(ivAvatar);
        } else {
            ivAvatar.setImageResource(R.drawable.ic_profile);
        }

        // Auto add click listener to open profile
        setOnClickListener(v -> {
            Intent intent = new Intent(getContext(), ProfileActivity.class);
            intent.putExtra(KEY_USER_ID, author.getId());
            getContext().startActivity(intent);
        });
    }
}