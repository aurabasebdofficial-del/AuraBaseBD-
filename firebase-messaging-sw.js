// firebase-messaging-sw.js  (v20 â€” unchanged from v17/v18/v19)
// Firebase Cloud Messaging Service Worker for AuraBaseBD
// -------------------------------------------------------
// SETUP: Replace the firebaseConfig values below with your
// actual Firebase project configuration before deploying.
//
// This file MUST be served from the SAME ORIGIN as the app:
//   https://yourdomain.com/firebase-messaging-sw.js
//
// How to get these values:
//   Firebase Console â†’ Your Project â†’ Project Settings â†’ General
//   â†’ Your apps â†’ Web app â†’ firebaseConfig
//
// âš ï¸ REPLACE ALL "YOUR_*" PLACEHOLDERS BELOW WITH REAL VALUES

importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// âš ï¸ REPLACE THESE WITH YOUR REAL FIREBASE CONFIG VALUES
const firebaseConfig = {
    apiKey:            "AIzaSyA-x-PteML4COBu7N5O19TJLjPZ9R1mG6s",
    authDomain:        "aurabasebd-3e62d.firebaseapp.com",
    projectId:         "aurabasebd-3e62d",
    storageBucket:     "aurabasebd-3e62d.firebasestorage.app",
    messagingSenderId: "406789546473",
    appId:             "1:406789546473:web:554fd21cc6f9a937ff2b78"
};

// Guard against duplicate app init (safe for SW lifecycle)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const messaging = firebase.messaging();

// -------------------------------------------------------
// Background push handler
// Called when the app is closed or in the background.
// The browser shows the notification automatically.
// -------------------------------------------------------
messaging.onBackgroundMessage(function(payload) {
    console.log('[firebase-messaging-sw.js] Background message received:', payload);

    const notification = payload.notification || {};
    const data         = payload.data         || {};

    const title = notification.title || data.title || 'AuraBaseBD';
    const body  = notification.body  || data.body  || 'à¦†à¦ªà¦¨à¦¾à¦° à¦à¦•à¦Ÿà¦¿ à¦¨à¦¤à§à¦¨ à¦¨à§‹à¦Ÿà¦¿à¦«à¦¿à¦•à§‡à¦¶à¦¨ à¦†à¦›à§‡à¥¤';
    // v17 FEATURE 3: brand logo is sent as the icon in the FCM payload (data.icon / notification.icon).
    const icon  = notification.icon  || data.icon  || '/icon-192.png';
    const badge = notification.badge || data.badge || '/badge-72.png';
    // v17 FEATURE 1/2/4: big banner image + redirect URL + action button.
    const image = notification.image || data.image || data.banner || '';
    const url   = data.redirectUrl || data.url || data.click_action || '/';
    const actionText = data.actionText || '';

    const options = {
        body:    body,
        icon:    icon,
        badge:   badge,
        tag:     'aurabasebd-' + Date.now(),   // unique tag prevents duplicate stacking
        renotify: false,
        requireInteraction: false,
        data:    { url: url }
    };
    // v17 FEATURE 2: show banner image if provided.
    if (image) { options.image = image; }
    // v17 FEATURE 1: show an action button if action text provided.
    if (actionText) { options.actions = [{ action: 'open', title: actionText }]; }

    return self.registration.showNotification(title, options);
});

// -------------------------------------------------------
// Notification click handler
// Opens the app (or focuses an existing tab) when the
// user taps the push notification.
// -------------------------------------------------------
self.addEventListener('notificationclick', function(event) {
    event.notification.close();

    const targetUrl = (event.notification.data && event.notification.data.url)
        ? event.notification.data.url
        : '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
            // Focus an existing tab if one is open
            for (var i = 0; i < clientList.length; i++) {
                var client = clientList[i];
                if (client.url && client.url.includes(self.location.origin) && 'focus' in client) {
                    return client.focus();
                }
            }
            // Otherwise open a new window
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});

// -------------------------------------------------------
// Service Worker lifecycle
// -------------------------------------------------------
self.addEventListener('install', function(event) {
    console.log('[firebase-messaging-sw.js] Service Worker installed');
    self.skipWaiting();
});

self.addEventListener('activate', function(event) {
    console.log('[firebase-messaging-sw.js] Service Worker activated');
    event.waitUntil(clients.claim());
});
