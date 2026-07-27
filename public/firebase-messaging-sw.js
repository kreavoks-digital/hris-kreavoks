importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

// Config should match the one in .env
const firebaseConfig = {
  apiKey: "AIzaSyACKduxPSD22ycXl9DKg_o82fRnGWTro4s",
  authDomain: "kvhris-e6613.firebaseapp.com",
  projectId: "kvhris-e6613",
  storageBucket: "kvhris-e6613.firebasestorage.app",
  messagingSenderId: "929078935954",
  appId: "1:929078935954:web:a86aa024de971ef5f8414b"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/favicon.ico'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
