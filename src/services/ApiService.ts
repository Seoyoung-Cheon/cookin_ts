import axios from "axios";
import { Recipe } from "../types";

class ApiService {
    private backendBaseUrl: string;

    constructor() {
        // 백엔드 API 기본 URL (환경 변수 또는 기본값 사용)
        this.backendBaseUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";
    }

    // 재료로 레시피 검색 (백엔드 API 호출)
    async searchRecipesByIngredients(ingredientNames: string[]): Promise<Recipe[]> {
        try {
            console.log("🔍 검색할 재료:", ingredientNames);

            const url = `${this.backendBaseUrl}/api/recipes/search`;
            const response = await axios.post(url, { ingredients: ingredientNames });

            if (response.status === 200 && response.data.success) {
                console.log(`✅ ${response.data.data.length}개의 레시피를 찾았습니다.`);
                return response.data.data;
            } else {
                throw new Error(response.data.error || "레시피 검색에 실패했습니다.");
            }
        } catch (error: any) {
            console.log("❌ API 호출 에러:", error);
            
            if (error.response) {
                const status = error.response.status;
                const errorData = error.response.data;

                if (status === 400) {
                    throw new Error(errorData.error || "잘못된 요청입니다.");
                } else if (status === 500) {
                    throw new Error(errorData.error || "서버 오류가 발생했습니다.");
                } else {
                    throw new Error(
                        errorData.error ||
                        `API 오류가 발생했습니다. (상태 코드: ${status})`
                    );
                }
            }

            throw new Error(error.message || "네트워크 오류가 발생했습니다.");
        }
    }

    // 한식 레시피 검색 (백엔드 API 호출)
    async searchKoreanRecipesByIngredients(
        ingredientNames: string[]
    ): Promise<Recipe[]> {
        try {
            console.log("🔍 한식 레시피 검색 - 재료:", ingredientNames);

            const url = `${this.backendBaseUrl}/api/recipes/search-korean`;
            const response = await axios.post(url, { ingredients: ingredientNames });

            if (response.status === 200 && response.data.success) {
                console.log(`✅ ${response.data.data.length}개의 한식 레시피를 찾았습니다.`);
                return response.data.data;
            } else {
                throw new Error(response.data.error || "한식 레시피 검색에 실패했습니다.");
            }
        } catch (error: any) {
            console.log("❌ 한식 API 호출 에러:", error);

            if (error.response) {
                const status = error.response.status;
                const errorData = error.response.data;

                if (status === 400) {
                    throw new Error(errorData.error || "잘못된 요청입니다.");
                } else if (status === 500) {
                    throw new Error(errorData.error || "서버 오류가 발생했습니다.");
                } else {
                    throw new Error(
                        errorData.error ||
                        `한식 API 오류가 발생했습니다. (상태 코드: ${status})`
                    );
                }
            }

            throw new Error(error.message || "네트워크 오류가 발생했습니다.");
        }
    }

    // 레시피 상세 정보 가져오기 (백엔드 API 호출)
    async getRecipeDetail(recipeId: number): Promise<Recipe | null> {
        try {
            const url = `${this.backendBaseUrl}/api/recipes/detail/${recipeId}`;
            const response = await axios.get(url);

            if (response.status === 200 && response.data.success) {
                return response.data.data;
            }
            return null;
        } catch (error) {
            console.log("레시피 상세 정보 가져오기 실패:", error);
            return null;
        }
    }
}

export default ApiService;
