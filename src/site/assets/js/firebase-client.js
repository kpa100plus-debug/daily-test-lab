import {
  appCheckConfig,
  firebaseConfig,
  isAppCheckConfigured,
  isFirebaseConfigured
} from './firebase-config.js';

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
  ]).then(async ([appSdk, authSdk, firestoreSdk, analyticsSdk]) => {
    const app = appSdk.initializeApp(firebaseConfig);
    const appCheckSdk = isAppCheckConfigured()
      ? await import(`https://www.gstatic.com/firebasejs/${sdkVersion}/firebase-app-check.js`)
      : null;
    const appCheck = appCheckSdk
      ? appCheckSdk.initializeAppCheck(app, {
        provider: new appCheckSdk.ReCaptchaEnterpriseProvider(appCheckConfig.siteKey),
        isTokenAutoRefreshEnabled: true
      })
      : null;
    const analytics = await analyticsSdk.isSupported()
      .then((supported) => supported ? analyticsSdk.getAnalytics(app) : null)
      .catch(() => null);
    return {
      app,
      appCheck,
      auth: authSdk.getAuth(app),
      db: firestoreSdk.getFirestore(app),
      analytics,
      appCheckSdk,
      authSdk,
      firestoreSdk,
      analyticsSdk
    };
  });

  return servicesPromise;
}
