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
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    
    // FCM otomatis menampilkan notifikasi jika payload berisi objek 'notification'.
    // Jadi kita hanya perlu menampilkan notifikasi manual jika payload hanya berisi 'data' (data-only).
    if (payload.data && !payload.notification) {
        const notificationTitle = payload.data.title || 'Notifikasi Baru';
        const notificationOptions = {
            body: payload.data.body || '',
            icon: '/favicon.ico'
        };
        self.registration.showNotification(notificationTitle, notificationOptions);
    }
});
