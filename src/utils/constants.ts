// 백엔드 API URL (환경 변수 또는 기본값 사용)
export const ApiConstants = {
  backendBaseUrl: import.meta.env.VITE_BACKEND_URL || "http://localhost:3001",
};

// 앱 색상
export const Colors = {
  primary: "#ff6b35",
  background: "#FFF8F6",
  text: "#333",
  textSecondary: "#666",
  white: "#fff",
};

// 앱 설정
export const AppConfig = {
  appName: "COOKIN",
  version: "1.0.0",
};
