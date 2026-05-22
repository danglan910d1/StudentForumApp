package com.studentforum.app.api;

import okhttp3.Interceptor;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
import com.studentforum.app.utils.AuthManager;

public class ApiClient {
    // Sử dụng 10.0.2.2 cho Android Emulator (tương đương localhost)
    private static final String BASE_URL = "http://10.0.2.2:5000/api/";
    private static Retrofit retrofit = null;

    public static Retrofit getClient(AuthManager authManager) {
        OkHttpClient client = new OkHttpClient.Builder().addInterceptor(chain -> {
            Request.Builder requestBuilder = chain.request().newBuilder();
            String token = authManager.getToken();
            if (token != null && !token.isEmpty()) {
                requestBuilder.addHeader("Authorization", "Bearer " + token);
            }
            return chain.proceed(requestBuilder.build());
        }).build();

        if (retrofit == null) {
            retrofit = new Retrofit.Builder()
                    .client(client)
                    .baseUrl(BASE_URL)
                    .addConverterFactory(GsonConverterFactory.create())
                    .build();
        }
        return retrofit;
    }
}
