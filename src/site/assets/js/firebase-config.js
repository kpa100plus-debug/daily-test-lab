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

export function isFirebaseConfigured() {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
  );
}
