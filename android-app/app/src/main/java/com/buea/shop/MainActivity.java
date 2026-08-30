package com.buea.shop;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.graphics.Bitmap;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.View;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;
import android.webkit.CookieManager;
import android.widget.ProgressBar;

public class MainActivity extends Activity {

    private static final String APP_URL = "https://buea-online-shop.vercel.app/";
    private static final String HOST = "buea-online-shop.vercel.app";

    private WebView webView;
    private ProgressBar progressBar;

    private final BroadcastReceiver networkReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            if (isOnline()) {
                // Reconnect automatically when the network comes back.
                if (webView != null) {
                    String url = webView.getUrl();
                    if (url != null && url.startsWith("file:///android_asset/")) {
                        loadApp();
                    } else {
                        webView.reload();
                    }
                }
            }
        }
    };

    private void loadOfflinePage() {
        if (webView == null) return;
        webView.loadUrl("file:///android_asset/offline.html");
    }

    private void loadApp() {
        if (webView == null) return;
        progressBar.setVisibility(View.VISIBLE);
        webView.loadUrl(APP_URL);
    }

    private boolean isOnline() {
        ConnectivityManager cm = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
        if (cm == null) return true;
        NetworkInfo ni = cm.getActiveNetworkInfo();
        return ni != null && ni.isConnected();
    }

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webView);
        progressBar = findViewById(R.id.progressBar);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setSupportZoom(false);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);
        settings.setUserAgentString(settings.getUserAgentString() + " BueaShopApp/1.0");

        CookieManager.getInstance().setAcceptCookie(true);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true);
        }

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri url = request.getUrl();
                String host = url.getHost();
                // Avoid overriding the local offline asset.
                if ("android_asset".equals(host)) return false;
                // Open BUEA links inside the app; everything else (WhatsApp, tel, etc.) in the browser.
                if (host != null && (host.equals(HOST) || host.endsWith("." + HOST))) {
                    return false;
                }
                try {
                    android.content.Intent browserIntent =
                            new android.content.Intent(android.content.Intent.ACTION_VIEW, url);
                    startActivity(browserIntent);
                } catch (Exception ignored) {
                }
                return true;
            }

            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                if (errorCode == WebViewClient.ERROR_HOST_LOOKUP
                        || errorCode == WebViewClient.ERROR_CONNECT
                        || errorCode == WebViewClient.ERROR_TIMEOUT
                        || errorCode == WebViewClient.ERROR_IO
                        || errorCode == WebViewClient.ERROR_FAILED_SSL_HANDSHAKE
                        || errorCode == -1) {
                    loadOfflinePage();
                }
            }

            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                progressBar.setVisibility(View.VISIBLE);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                progressBar.setVisibility(View.GONE);
                view.setVisibility(View.VISIBLE);
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                progressBar.setProgress(newProgress);
                if (newProgress >= 100) {
                    progressBar.setVisibility(View.GONE);
                }
            }
        });

        webView.loadUrl(APP_URL);

        registerReceiver(networkReceiver, new IntentFilter(ConnectivityManager.CONNECTIVITY_ACTION));
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK && webView.canGoBack()) {
            webView.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) {
            webView.onResume();
        }
    }

    @Override
    protected void onPause() {
        if (webView != null) {
            webView.onPause();
        }
        super.onPause();
    }

    @Override
    protected void onDestroy() {
        try {
            unregisterReceiver(networkReceiver);
        } catch (Exception ignored) {
        }
        if (webView != null) {
            webView.destroy();
        }
        super.onDestroy();
    }
}
