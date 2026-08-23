import { firebaseConfig, isFirebaseConfigured } from './firebase-config.js';

const sdkVersion = '12.18.0';
let servicesPromise;

export function getFirebaseServices() {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase web configuration is not connected yet.');
  }

  servicesPromise ??= Promise.all([
    import(`https://www.gstatic.com/firebasejs/${sdkVersion}/firebase-app.js`),
    import(`https://www.gstatic.com/firebasejs/${sdkVersion}/firebase-auth.js`),
    import(`https://www.gstatic.com/firebasejs/${sdkVersion}/firebase-firestore.js`),
    import(`https://www.gstatic.com/firebasejs/${sdkVersion}/firebase-analytics.js`)
  ]).then(([appSdk, authSdk, firestoreSdk, analyticsSdk]) => {
    const app = appSdk.initializeApp(firebaseConfig);
    return {
      app,
      auth: authSdk.getAuth(app),
      db: firestoreSdk.getFirestore(app),
      analytics: analyticsSdk.getAnalytics(app),
      authSdk,
      firestoreSdk,
      analyticsSdk
    };
  });

  return servicesPromise;
}
