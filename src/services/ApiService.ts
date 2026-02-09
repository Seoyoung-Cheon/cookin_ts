import axios from "axios";
import { Recipe } from "../types";

class ApiService {
    private spoonacularBaseUrl = "https://api.spoonacular.com";
    private spoonacularApiKey = import.meta.env.VITE_SPOONACULAR_API_KEY;

    // 재료로 레시피 검색
    async searchRecipesByIngredients(
        ingredientNames: string[]
    ): Promise<Recipe[]> {
        try {
            const response = await axios.get(
                `${this.spoonacularBaseUrl}/recipes/complexSearch`,
                {
                    params: {
                        apiKey: this.spoonacularApiKey,
                        includeIngredients: ingredientNames.join(","),
                        number: 20,
                    },
                }
            );

            return response.data.results;
        } catch (error) {
            console.error("❌ 레시피 검색 실패:", error);
            throw new Error("레시피 검색에 실패했습니다.");
        }
    }

    // 한식 레시피 검색
    async searchKoreanRecipesByIngredients(
        ingredientNames: string[]
    ): Promise<Recipe[]> {
        try {
            const response = await axios.get(
                `${this.spoonacularBaseUrl}/recipes/complexSearch`,
                {
                    params: {
                        apiKey: this.spoonacularApiKey,
                        includeIngredients: ingredientNames.join(","),
                        cuisine: "Korean",
                        number: 20,
                    },
                }
            );

            return response.data.results;
        } catch (error) {
            console.error("❌ 한식 레시피 검색 실패:", error);
            throw new Error("한식 레시피 검색에 실패했습니다.");
        }
    }

    // 레시피 상세 조회
    async getRecipeDetail(recipeId: number): Promise<Recipe> {
        try {
            const response = await axios.get(
                `${this.spoonacularBaseUrl}/recipes/${recipeId}/information`,
                {
                    params: {
                        apiKey: this.spoonacularApiKey,
                    },
                }
            );

            return response.data;
        } catch (error) {
            console.error("❌ 레시피 상세 조회 실패:", error);
            throw new Error("레시피 상세 정보를 불러오지 못했습니다.");
        }
    }
}

export default ApiService;
