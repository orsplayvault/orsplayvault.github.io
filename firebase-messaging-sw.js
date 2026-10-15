/* Firebase Cloud Messaging service worker (VLS-327).
 *
 * Static file — the (public) Firebase web config is passed in the registration
 * query string by @vaulty/core's push controller, so one committed file works
 * across dev/stg/prod with no build-time codegen. Handles background message
 * display + notification-tap deep-linking (posts back to the page → PushTapRouter).
 *
 * Note: on iOS, web push only works for a PWA added to the Home Screen (16.4+),
 * never in a Safari tab — the native app is the real channel for iPhone users.
 */
/* eslint-disable */
importScripts('https://www.gstatic.com/firebasejs/12.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.0.0/firebase-messaging-compat.js');

const params = new URLSearchParams(self.location.search);
firebase.initializeApp({
  apiKey: params.get('apiKey'),
  authDomain: params.get('authDomain'),
  projectId: params.get('projectId'),
  storageBucket: params.get('storageBucket'),
  messagingSenderId: params.get('messagingSenderId'),
  appId: params.get('appId'),
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const n = (payload && payload.notification) || {};
  self.registration.showNotification(n.title || '82-0', {
    body: n.body || '',
    icon: '/favicon-32x32.png',
    data: (payload && payload.data) || {},
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const data = event.notification.data || {};
  const target = data.link || data.route || data.deep_link || '/';
  event.waitUntil(
    (async () => {
      const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of wins) {
        client.postMessage({ type: 'push-tap', data });
        return client.focus();
      }
      return self.clients.openWindow(typeof target === 'string' ? target : '/');
    })(),
  );
});
