import axios from "axios";
import { ApiConstants } from "../utils/constants";
import IngredientTranslator from "../utils/ingredientTranslator";
import TranslationService from "./TranslationService";
import { koreanRecipesData } from "../data/koreanRecipes";
import { Recipe } from "../types";

class ApiService {
    private baseUrl: string;
    private apiKey: string;
    private koreanRecipeBaseUrl: string;
    private koreanRecipeApiKey: string;

    constructor() {
        this.baseUrl = ApiConstants.spoonacularBaseUrl;
        this.apiKey = ApiConstants.spoonacularApiKey;
        this.koreanRecipeBaseUrl = ApiConstants.koreanRecipeBaseUrl;
        this.koreanRecipeApiKey = ApiConstants.koreanRecipeApiKey;
    }

    // 재료로 레시피 검색 (양식 - Spoonacular)
    async searchRecipesByIngredients(
        ingredientNames: string[]
    ): Promise<Recipe[]> {
        try {
            const englishNames =
                IngredientTranslator.translateList(ingredientNames);
            const ingredientsString = englishNames
                .map((name) => encodeURIComponent(name.trim()))
                .join(",");

            const url = `${this.baseUrl}/recipes/findByIngredients?ingredients=${ingredientsString}&apiKey=${this.apiKey}&number=10`;

            const response = await axios.get(url);

            if (response.status === 200) {
                const data = response.data;

                if (!Array.isArray(data) || data.length === 0) {
                    throw new Error(
                        "검색 결과가 없습니다. 다른 재료를 시도해보세요."
                    );
                }

                const recipes: Recipe[] = [];
                const maxRecipes = Math.min(data.length, 10);
                const translationService = new TranslationService();

                for (let i = 0; i < maxRecipes; i++) {
                    const item = data[i];
                    try {
                        const recipeDetail = await this.getRecipeDetail(
                            item.id
                        );
                        if (recipeDetail) {
                            recipeDetail.translatedTitle =
                                await translationService.translateToKorean(
                                    recipeDetail.title || ""
                                );
                            if (recipeDetail.description) {
                                recipeDetail.translatedDescription =
                                    await translationService.translateToKorean(
                                        recipeDetail.description
                                    );
                            }
                            if (
                                recipeDetail.ingredients &&
                                recipeDetail.ingredients.length > 0
                            ) {
                                const names = recipeDetail.ingredients.map(
                                    (ing) => ing.name
                                );
                                const translatedNames =
                                    await translationService.translateList(
                                        names
                                    );
                                recipeDetail.translatedIngredients =
                                    recipeDetail.ingredients.map((ing, idx) => ({
                                        ...ing,
                                        translatedName:
                                            translatedNames[idx] || ing.name,
                                    }));
                            }
                            if (
                                recipeDetail.steps &&
                                recipeDetail.steps.length > 0
                            ) {
                                recipeDetail.translatedSteps =
                                    await translationService.translateList(
                                        recipeDetail.steps
                                    );
                            }
                            recipes.push(recipeDetail);
                        } else {
                            const title = item.title || "레시피";
                            const translatedTitle =
                                await translationService.translateToKorean(
                                    title
                                );
                            recipes.push({
                                id: item.id.toString(),
                                title,
                                translatedTitle,
                                description: "",
                                imageUrl: item.image,
                            });
                        }
                    } catch {
                        try {
                            const title = item.title || "레시피";
                            const translatedTitle =
                                await translationService.translateToKorean(
                                    title
                                );
                            recipes.push({
                                id: item.id.toString(),
                                title,
                                translatedTitle,
                                description: "",
                                imageUrl: item.image,
                            });
                        } catch {
                            recipes.push({
                                id: item.id.toString(),
                                title: item.title || "레시피",
                                translatedTitle: item.title || "레시피",
                                description: "",
                                imageUrl: item.image,
                            });
                        }
                    }
                }

                return recipes;
            }

            throw new Error(
                `레시피 검색에 실패했습니다. (상태 코드: ${response.status})`
            );
        } catch (error: any) {
            if (error.response) {
                const status = error.response.status;
                const errorData = error.response.data;
                if (status === 401) {
                    throw new Error("API 키가 유효하지 않습니다.");
                }
                if (status === 402) {
                    throw new Error("API 사용량 한도를 초과했습니다.");
                }
                if (status === 429) {
                    throw new Error(
                        "너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요."
                    );
                }
                throw new Error(
                    errorData?.message ||
                        `API 오류가 발생했습니다. (상태 코드: ${status})`
                );
            }
            throw new Error(
                error.message || "네트워크 오류가 발생했습니다."
            );
        }
    }

    // 한식 레시피 검색 (식품안전나라 API, 실패 시 로컬 데이터)
    async searchKoreanRecipesByIngredients(
        ingredientNames: string[]
    ): Promise<Recipe[]> {
        try {
            const url = `${this.koreanRecipeBaseUrl}/${this.koreanRecipeApiKey}/COOKRCP01/json/1/100`;

            const response = await axios.get(url, {
                timeout: 10000,
                headers: { Accept: "application/json" },
            });

            if (response.status !== 200) {
                throw new Error(
                    `한식 레시피 검색에 실패했습니다. (상태 코드: ${response.status})`
                );
            }

            const data = response.data;

            if (!data?.COOKRCP01) {
                throw new Error("API 응답 형식이 올바르지 않습니다.");
            }

            if (
                data.COOKRCP01.RESULT &&
                data.COOKRCP01.RESULT.CODE !== "INFO-000"
            ) {
                throw new Error(
                    data.COOKRCP01.RESULT.MSG || "알 수 없는 오류"
                );
            }

            const rows = data.COOKRCP01.row;
            if (!Array.isArray(rows) || rows.length === 0) {
                throw new Error(
                    "검색 결과가 없습니다. 다른 재료를 시도해보세요."
                );
            }

            const filteredRecipes = rows.filter((recipe: any) => {
                const recipeIngredients = recipe.RCP_PARTS_DTLS || "";
                return ingredientNames.some((ingredient: string) =>
                    recipeIngredients.includes(ingredient)
                );
            });

            const finalRecipes =
                filteredRecipes.length > 0 ? filteredRecipes : rows.slice(0, 10);

            const convertedRecipes: Recipe[] = finalRecipes.map(
                (recipe: any) => {
                    const steps: string[] = [];
                    for (let i = 1; i <= 20; i++) {
                        const manualKey = `MANUAL${String(i).padStart(2, "0")}`;
                        if (recipe[manualKey]?.trim()) {
                            steps.push(recipe[manualKey]);
                        }
                    }

                    const ingredients: { name: string; originalName?: string; amount?: string; unit?: string }[] = [];
                    if (recipe.RCP_PARTS_DTLS) {
                        const parts = recipe.RCP_PARTS_DTLS.split(/[,;\n\r]+/)
                            .map((part: string) => part.trim())
                            .filter((part: string) => part.length > 0);

                        parts.forEach((part: string) => {
                            const cleanName = part
                                .replace(/\([^)]*\)/g, "")
                                .replace(/\d+[가-힣a-zA-Z]*/g, "")
                                .trim();
                            ingredients.push({
                                name: cleanName || part,
                                originalName: part,
                                amount: "",
                                unit: "",
                            });
                        });
                    }

                    return {
                        id: recipe.RCP_SEQ || "",
                        title: recipe.RCP_NM || "레시피",
                        translatedTitle: recipe.RCP_NM || "레시피",
                        description: recipe.HASH_TAG || "",
                        translatedDescription: recipe.HASH_TAG || "",
                        imageUrl:
                            recipe.ATT_FILE_NO_MK ||
                            recipe.ATT_FILE_NO_MAIN ||
                            "",
                        cookingTime: 0,
                        servingSize: 1,
                        ingredients,
                        translatedIngredients: ingredients,
                        steps,
                        translatedSteps: steps,
                        recipeType: recipe.RCP_PAT2 || "",
                        recipeMethod: recipe.RCP_WAY2 || "",
                        calories: recipe.INFO_ENG || 0,
                        weight: recipe.INFO_WGT || "",
                    };
                }
            );

            return convertedRecipes;
        } catch (error: any) {
            if (error.response) {
                const status = error.response.status;
                const errorData = error.response.data;
                if (status === 503) {
                    throw new Error(
                        "서버가 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요."
                    );
                }
                if (status === 401 || status === 403) {
                    throw new Error("한식 API 인증키가 유효하지 않습니다.");
                }
                if (status === 429) {
                    throw new Error(
                        "너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요."
                    );
                }
                if (
                    typeof errorData === "string" &&
                    errorData.includes("<html>")
                ) {
                    throw new Error(
                        `서버 오류가 발생했습니다. (상태 코드: ${status})`
                    );
                }
                throw new Error(
                    errorData?.message ||
                        `한식 API 오류가 발생했습니다. (상태 코드: ${status})`
                );
            }
            if (error.code === "ECONNABORTED") {
                throw new Error(
                    "요청 시간이 초과되었습니다. 네트워크 연결을 확인해주세요."
                );
            }

            // API 실패 시 로컬 한식 데이터 사용
            const filteredRecipes = koreanRecipesData.filter((recipe) => {
                const recipeIngredients =
                    recipe.ingredients?.map((ing) =>
                        ing.name.toLowerCase()
                    ) || [];
                return ingredientNames.some((ingredient) =>
                    recipeIngredients.some(
                        (ri) =>
                            ri.includes(ingredient.toLowerCase()) ||
                            ingredient.toLowerCase().includes(ri)
                    )
                );
            });

            return filteredRecipes.length > 0
                ? filteredRecipes
                : koreanRecipesData.slice(0, 6);
        }
    }

    // 레시피 상세 정보 (Spoonacular)
    async getRecipeDetail(recipeId: number): Promise<Recipe | null> {
        try {
            const url = `${this.baseUrl}/recipes/${recipeId}/information?apiKey=${this.apiKey}`;
            const response = await axios.get(url);

            if (response.status === 200) {
                const data = response.data;
                return {
                    id: data.id?.toString() || "",
                    title: data.title || "레시피",
                    description: data.summary
                        ? data.summary
                              .replace(/<[^>]*>/g, "")
                              .substring(0, 200)
                        : "",
                    imageUrl: data.image,
                    cookingTime: data.readyInMinutes || 0,
                    servingSize: data.servings || 1,
                    ingredients:
                        data.extendedIngredients?.map((ing: any) => ({
                            name: ing.name || ing.nameClean || "",
                            amount: ing.amount,
                            unit: ing.unit,
                        })) || [],
                    steps:
                        data.analyzedInstructions?.[0]?.steps?.map(
                            (step: any) => step.step
                        ) || [],
                };
            }
            return null;
        } catch {
            return null;
        }
    }
}

export default ApiService;
