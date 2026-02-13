// 외부 API 설정 (프론트에서 직접 호출)
export const ApiConstants = {
  spoonacularBaseUrl: "https://api.spoonacular.com",
  spoonacularApiKey:
    import.meta.env.VITE_SPOONACULAR_API_KEY || "",
  koreanRecipeBaseUrl: "https://openapi.foodsafetykorea.go.kr/api",
  koreanRecipeApiKey:
    import.meta.env.VITE_KOREAN_RECIPE_API_KEY || "",
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
