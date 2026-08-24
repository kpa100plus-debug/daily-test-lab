// Firebase Console > Project settings > Your apps > SDK setup and configuration 값을 입력합니다.
// 이 웹 설정 객체는 공개 식별자입니다. 서비스 계정 JSON이나 Admin SDK 비밀키는 넣지 않습니다.
export const firebaseConfig = Object.freeze({
  apiKey: 'AIzaSyBjABhwO5BjZ3d_BwDTjqpjiM33VR7Ds3Q',
  authDomain: 'daily-test-lab.firebaseapp.com',
  projectId: 'daily-test-lab',
  storageBucket: 'daily-test-lab.firebasestorage.app',
  messagingSenderId: '208972694806',
  appId: '1:208972694806:web:e53b05b2e26e863d2dfc37',
  measurementId: 'G-XPC0DQYN83'
});

// Firebase Console에서 App Check 웹 앱 등록을 끝낸 뒤 공개 사이트 키만 입력합니다.
// 빈 값인 동안에는 App Check가 초기화되지 않으며 강제 적용도 하지 않습니다.
export const appCheckConfig = Object.freeze({
  provider: 'recaptcha-enterprise',
  siteKey: '',
  enforcement: 'monitoring'
});

export function isFirebaseConfigured() {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
  );
}

export function isAppCheckConfigured() {
  return appCheckConfig.provider === 'recaptcha-enterprise'
    && /^[A-Za-z0-9_-]{20,}$/.test(appCheckConfig.siteKey);
}
