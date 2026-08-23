// Firebase Console > Project settings > Your apps > SDK setup and configuration 값을 입력합니다.
// 이 웹 설정 객체는 공개 식별자입니다. 서비스 계정 JSON이나 Admin SDK 비밀키는 넣지 않습니다.
export const firebaseConfig = Object.freeze({
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
  measurementId: ''
});

export function isFirebaseConfigured() {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
  );
}

