import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../services/ApiService';
import { Recipe, RecipeType } from '../types';
import '../styles/recipeSearch.css';

const STORAGE_KEY = 'cookin_search_state';

interface SearchState {
    selectedIngredients: string[];
    recipes: Recipe[];
    recipeType: RecipeType;
    currentPage: number;
}

const RecipeSearch = () => {
    const navigate = useNavigate();
    const [ingredientText, setIngredientText] = useState('');
    const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [recipeType, setRecipeType] = useState<RecipeType>('korean');
    const [currentPage, setCurrentPage] = useState(1);
    const [isHardSectionExpanded, setIsHardSectionExpanded] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const isRestoredRef = useRef(false);

    // localStorage에서 상태 복원 (한 번만 실행)
    useEffect(() => {
        if (isRestoredRef.current) return;

        const savedState = localStorage.getItem(STORAGE_KEY);
        if (savedState) {
            try {
                const state: SearchState = JSON.parse(savedState);
                if (state.selectedIngredients && state.selectedIngredients.length > 0) {
                    setSelectedIngredients(state.selectedIngredients);
                }
                if (state.recipes && state.recipes.length > 0) {
                    setRecipes(state.recipes);
                }
                if (state.recipeType) {
                    setRecipeType(state.recipeType);
                }
                if (state.currentPage) {
                    setCurrentPage(state.currentPage);
                }
                isRestoredRef.current = true;
            } catch (error) {
                console.error('Failed to restore search state:', error);
                isRestoredRef.current = true;
            }
        } else {
            isRestoredRef.current = true;
        }
    }, []);

    // 상태 변경 시 localStorage에 저장 (복원 완료 후에만)
    useEffect(() => {
        if (!isRestoredRef.current) return;

        const state: SearchState = {
            selectedIngredients,
            recipes,
            recipeType,
            currentPage,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [selectedIngredients, recipes, recipeType, currentPage]);

    const addIngredient = () => {
        const ingredient = ingredientText.trim();
        if (ingredient && !selectedIngredients.includes(ingredient)) {
            setSelectedIngredients([...selectedIngredients, ingredient]);
            setIngredientText('');
            if (inputRef.current) {
                inputRef.current.blur();
            }
        }
    };

    const removeIngredient = (ingredient: string) => {
        setSelectedIngredients(
            selectedIngredients.filter((item) => item !== ingredient)
        );
    };

    const resetSearchState = () => {
        setRecipes([]);
        setIngredientText('');
        setSelectedIngredients([]);
        setIsLoading(false);
        setCurrentPage(1);
        localStorage.removeItem(STORAGE_KEY);
    };

    const handleRecipeTypeChange = (type: RecipeType) => {
        if (recipeType !== type) {
            resetSearchState();
            setRecipeType(type);
        }
    };

    const searchRecipes = async () => {
        if (selectedIngredients.length === 0) {
            alert('재료를 하나 이상 추가해주세요.');
            return;
        }

        setIsLoading(true);
        try {
            const apiService = new ApiService();
            let results: Recipe[] = [];

            if (recipeType === 'western') {
                results = await apiService.searchRecipesByIngredients(
                    selectedIngredients
                );
            } else if (recipeType === 'korean') {
                results = await apiService.searchKoreanRecipesByIngredients(
                    selectedIngredients
                );
            }

            setRecipes(results);
            setCurrentPage(1);
        } catch (error: any) {
            alert(error.message || '레시피를 불러오는데 실패했습니다.');
            setRecipes([]);
            setCurrentPage(1);
        } finally {
            setIsLoading(false);
        }
    };

    const ingredientSynonyms: Record<string, string[]> = {
        소고기: ['쇠고기', '소고기', '소고기살'],
        쇠고기: ['소고기', '쇠고기', '소고기살'],
        양파: ['양파', '양파(중간)', '양파(작은)'],
        당근: ['당근', '당근(중간)', '당근(작은)'],
        감자: ['감자', '감자(중간)', '감자(작은)'],
    };

    const normalizeIngredientName = (name: string): string => {
        let normalized = name.toLowerCase().trim();

        for (const [key, synonyms] of Object.entries(ingredientSynonyms)) {
            if (synonyms.some((syn) => normalized.includes(syn.toLowerCase()))) {
                normalized = key.toLowerCase();
                break;
            }
        }

        normalized = normalized
            .replace(/\([^)]*\)/g, '')
            .replace(/\d+[가-힣a-zA-Z\/]*/g, '')
            .replace(/[가-힣a-zA-Z]*\d+/g, '')
            .trim();

        return normalized;
    };

    const isIngredientMatched = (
        recipeIngredientName: string,
        selectedIngredient: string
    ): boolean => {
        const normalizedRecipe = normalizeIngredientName(recipeIngredientName);
        const normalizedSelected = normalizeIngredientName(selectedIngredient);

        if (normalizedRecipe === normalizedSelected) {
            return true;
        }

        if (normalizedRecipe.includes(normalizedSelected)) {
            const regex = new RegExp(
                `(^|[^가-힣a-zA-Z])${normalizedSelected.replace(
                    /[.*+?^${}()|[\]\\]/g,
                    '\\$&'
                )}([^가-힣a-zA-Z]|$)`,
                'i'
            );
            return regex.test(normalizedRecipe);
        }

        if (normalizedSelected.includes(normalizedRecipe)) {
            const regex = new RegExp(
                `(^|[^가-힣a-zA-Z])${normalizedRecipe.replace(
                    /[.*+?^${}()|[\]\\]/g,
                    '\\$&'
                )}([^가-힣a-zA-Z]|$)`,
                'i'
            );
            return regex.test(normalizedSelected);
        }

        return false;
    };


    // 소스류/조미료 목록 (재료에서 제외)
    const sauceAndSeasoningList = [
        '소금', '간장', '된장', '고추장', '고춧가루', '설탕', '후추', '식초',
        '올리브오일', '식용유', '참기름', '마요네즈', '케첩', '꿀', '물엿',
        '맛술', '미림', '다시마', '멸치', '멸치육수', '다시마육수',
        'salt', 'soy sauce', 'doenjang', 'gochujang', 'red pepper powder',
        'sugar', 'pepper', 'vinegar', 'olive oil', 'cooking oil', 'sesame oil',
        'mayonnaise', 'ketchup', 'honey', 'mirin', 'dashi'
    ];

    // 소스류/조미료인지 확인
    const isSauceOrSeasoning = (ingredientName: string): boolean => {
        const normalized = ingredientName.toLowerCase().trim();
        return sauceAndSeasoningList.some((sauce) => {
            const normalizedSauce = sauce.toLowerCase();
            return normalized.includes(normalizedSauce) || normalizedSauce.includes(normalized);
        });
    };

    const calculateMatchRate = (recipe: Recipe): number => {
        if (!selectedIngredients || selectedIngredients.length === 0) {
            return 0;
        }

        const recipeIngredients =
            recipe.translatedIngredients || recipe.ingredients || [];

        if (recipeIngredients.length === 0) {
            return 0;
        }

        // 소스류/조미료를 제외한 실제 음식 재료만 필터링
        const foodIngredients = recipeIngredients.filter((ingredient) => {
            const ingredientName =
                ingredient.translatedName ||
                ingredient.name ||
                ingredient.originalName ||
                '';
            return !isSauceOrSeasoning(ingredientName);
        });

        if (foodIngredients.length === 0) {
            return 0;
        }

        let matchedCount = 0;

        foodIngredients.forEach((ingredient) => {
            const ingredientName =
                ingredient.translatedName ||
                ingredient.name ||
                ingredient.originalName ||
                '';

            const hasIngredient = selectedIngredients.some((selectedIngredient) => {
                return isIngredientMatched(ingredientName, selectedIngredient);
            });

            if (hasIngredient) {
                matchedCount++;
            }
        });

        const matchRate = (matchedCount / foodIngredients.length) * 100;
        return Math.round(matchRate * 100) / 100;
    };

    // 재료가 레시피에 포함되어 있는지 확인 (소스류 제외)
    const hasAnySelectedIngredient = (recipe: Recipe): boolean => {
        if (!selectedIngredients || selectedIngredients.length === 0) {
            return false;
        }

        const recipeIngredients =
            recipe.translatedIngredients || recipe.ingredients || [];

        if (recipeIngredients.length === 0) {
            return false;
        }

        // 소스류를 제외한 실제 음식 재료만 필터링
        const foodIngredients = recipeIngredients.filter((ingredient) => {
            const ingredientName =
                ingredient.translatedName ||
                ingredient.name ||
                ingredient.originalName ||
                '';
            return !isSauceOrSeasoning(ingredientName);
        });

        // 선택한 재료 중 하나라도 레시피에 포함되어 있으면 true
        return selectedIngredients.some((selectedIngredient) => {
            return foodIngredients.some((ingredient) => {
                const ingredientName =
                    ingredient.translatedName ||
                    ingredient.name ||
                    ingredient.originalName ||
                    '';
                return isIngredientMatched(ingredientName, selectedIngredient);
            });
        });
    };

    // 부족한 재료 개수 계산
    const calculateMissingIngredientCount = (recipe: Recipe): number => {
        if (!selectedIngredients || selectedIngredients.length === 0) {
            const recipeIngredients =
                recipe.translatedIngredients || recipe.ingredients || [];
            const foodIngredients = recipeIngredients.filter((ingredient) => {
                const ingredientName =
                    ingredient.translatedName ||
                    ingredient.name ||
                    ingredient.originalName ||
                    '';
                return !isSauceOrSeasoning(ingredientName);
            });
            return foodIngredients.length;
        }

        const recipeIngredients =
            recipe.translatedIngredients || recipe.ingredients || [];

        if (recipeIngredients.length === 0) {
            return 0;
        }

        // 소스류를 제외한 실제 음식 재료만 필터링
        const foodIngredients = recipeIngredients.filter((ingredient) => {
            const ingredientName =
                ingredient.translatedName ||
                ingredient.name ||
                ingredient.originalName ||
                '';
            return !isSauceOrSeasoning(ingredientName);
        });

        let missingCount = 0;

        foodIngredients.forEach((ingredient) => {
            const ingredientName =
                ingredient.translatedName ||
                ingredient.name ||
                ingredient.originalName ||
                '';

            const hasIngredient = selectedIngredients.some((selectedIngredient) => {
                return isIngredientMatched(ingredientName, selectedIngredient);
            });

            if (!hasIngredient) {
                missingCount++;
            }
        });

        return missingCount;
    };

    // 매칭률에 따라 레시피 분류
    const recipesWithMatchRate = recipes.map((recipe) => ({
        ...recipe,
        matchRate: calculateMatchRate(recipe),
        hasAnyIngredient: hasAnySelectedIngredient(recipe),
        missingIngredientCount: calculateMissingIngredientCount(recipe),
    }));

    // OR 검색: 선택한 재료 중 하나라도 포함된 레시피만 표시
    // 재료 개수에 따라 필터링 전략 변경
    const ingredientCount = selectedIngredients.length;
    const isLowIngredientCount = ingredientCount <= 2; // 재료가 2개 이하일 때

    let filteredRecipes: typeof recipesWithMatchRate;

    if (isLowIngredientCount) {
        // 재료가 적을 때: OR 검색 (선택한 재료 중 하나라도 포함되면 표시)
        filteredRecipes = recipesWithMatchRate.filter((r) => r.hasAnyIngredient);
    } else {
        // 재료가 많을 때: OR 검색 + 매칭률 기준 필터링
        // 선택한 재료 중 하나라도 포함되고, 매칭률이 50% 이상인 레시피만 표시
        filteredRecipes = recipesWithMatchRate.filter((r) => {
            return r.hasAnyIngredient && (r.matchRate || 0) >= 50;
        });
    }

    // 부족한 재료 개수 기준으로 섹션별 분류
    const availableNow = filteredRecipes.filter((r) => r.missingIngredientCount === 0);
    const needFewIngredients = filteredRecipes.filter(
        (r) => r.missingIngredientCount >= 1 && r.missingIngredientCount <= 2
    );
    const needManyIngredients = filteredRecipes.filter((r) => r.missingIngredientCount >= 3);

    // 각 섹션 내에서 부족한 재료 개수 순으로 정렬 (적은 순서대로)
    availableNow.sort((a, b) => a.missingIngredientCount - b.missingIngredientCount);
    needFewIngredients.sort((a, b) => a.missingIngredientCount - b.missingIngredientCount);
    needManyIngredients.sort((a, b) => a.missingIngredientCount - b.missingIngredientCount);

    const allFilteredRecipes = [...availableNow, ...needFewIngredients, ...needManyIngredients];

    const handleRecipeClick = (recipe: Recipe) => {
        // 상태 저장 후 상세 페이지로 이동
        const state: SearchState = {
            selectedIngredients,
            recipes,
            recipeType,
            currentPage,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

        navigate('/detail', {
            state: { recipe, selectedIngredients },
        });
    };

    const handleBackClick = () => {
        navigate('/');
    };

    return (
        <div className="recipe-search-container">
            <div className="recipe-search-content">
                <div className="input-section">
                    <div className="toggle-wrapper">
                        <button className="back-button" onClick={handleBackClick}>
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M19 12H5M12 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div className="toggle-container">
                            <button
                                className={`toggle-button ${recipeType === 'korean' ? 'toggle-button-active' : ''
                                    }`}
                                onClick={() => handleRecipeTypeChange('korean')}
                            >
                                한식
                            </button>
                            <button
                                className={`toggle-button ${recipeType === 'western' ? 'toggle-button-active' : ''
                                    }`}
                                onClick={() => handleRecipeTypeChange('western')}
                            >
                                양식
                            </button>
                        </div>
                    </div>
                    <div className="section-title-row">
                        <h2 className="section-title">
                            음식 재료를 입력하세요({recipeType === 'korean' ? '한식' : '양식'})
                        </h2>
                        {recipeType === 'western' && (
                            <span className="section-title-note">
                                양식은 번역 과정 때문에 로딩 시간이 오래 걸릴 수 있어요
                            </span>
                        )}
                    </div>
                    <div className="input-row">
                        <input
                            ref={inputRef}
                            type="text"
                            className="input"
                            placeholder="예: 양파, 당근, 감자"
                            value={ingredientText}
                            onChange={(e) => setIngredientText(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    addIngredient();
                                }
                            }}
                        />
                        <button className="add-button" onClick={addIngredient}>
                            <svg
                                className="add-button-icon"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                />
                            </svg>
                        </button>
                    </div>

                    {selectedIngredients.length > 0 && (
                        <>
                            <p className="label">선택한 재료:</p>
                            <div className="chip-container">
                                {selectedIngredients.map((ingredient, index) => (
                                    <div key={index} className="chip">
                                        <span className="chip-text">{ingredient}</span>
                                        <button
                                            className="chip-close"
                                            onClick={() => removeIngredient(ingredient)}
                                        >
                                            <svg
                                                width="18"
                                                height="18"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <circle cx="12" cy="12" r="10" />
                                                <path d="M15 9l-6 6M9 9l6 6" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button
                                className={`search-button ${isLoading ? 'disabled' : ''}`}
                                onClick={searchRecipes}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div>로딩 중...</div>
                                ) : (
                                    <>
                                        <svg
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <circle cx="11" cy="11" r="8" />
                                            <path d="m21 21-4.35-4.35" />
                                        </svg>
                                        레시피 찾기
                                    </>
                                )}
                            </button>
                        </>
                    )}
                </div>

                {isLoading && (
                    <div className="loading-container">
                        <div className="capybaraloader">
                            <div className="capybara">
                                <div className="capyhead">
                                    <div className="capyear">
                                        <div className="capyear2"></div>
                                    </div>
                                    <div className="capyear"></div>
                                    <div className="capymouth">
                                        <div className="capylips"></div>
                                        <div className="capylips"></div>
                                    </div>
                                    <div className="capyeye"></div>
                                    <div className="capyeye"></div>
                                </div>
                                <div className="capyleg"></div>
                                <div className="capyleg2"></div>
                                <div className="capyleg2"></div>
                                <div className="capy"></div>
                            </div>
                            <div className="loader">
                                <div className="loaderline"></div>
                            </div>
                        </div>
                        <p className="loading-text">레시피를 찾고 있어요...</p>
                    </div>
                )}

                {!isLoading && allFilteredRecipes.length > 0 && (
                    <div className="results-section">
                        {/* 지금 만들 수 있어요 👍 */}
                        {availableNow.length > 0 && (
                            <div className="recipe-section">
                                <h3 className="section-header">
                                    지금 만들 수 있어요 👍 ({availableNow.length}개)
                                </h3>
                                {availableNow.map((recipe, index) => (
                                    <div
                                        key={`available-${index}`}
                                        className="recipe-card"
                                        onClick={() => handleRecipeClick(recipe)}
                                    >
                                        {recipe.imageUrl && (
                                            <img
                                                src={recipe.imageUrl}
                                                alt={recipe.translatedTitle || recipe.title}
                                                className="recipe-image"
                                            />
                                        )}
                                        <div className="recipe-content">
                                            <div className="recipe-title-row">
                                                <h3 className="recipe-title">
                                                    {recipe.translatedTitle || recipe.title}
                                                </h3>
                                                <div className="recipe-meta">
                                                    <span className="match-rate">
                                                        {Math.round(recipe.matchRate || 0)}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* 재료 1~2개만 추가하면 가능해요 🛒 */}
                        {needFewIngredients.length > 0 && (
                            <div className="recipe-section">
                                <h3 className="section-header">
                                    재료 1~2개만 추가하면 가능해요 🛒 ({needFewIngredients.length}개)
                                </h3>
                                {needFewIngredients.map((recipe, index) => (
                                    <div
                                        key={`few-${index}`}
                                        className="recipe-card"
                                        onClick={() => handleRecipeClick(recipe)}
                                    >
                                        {recipe.imageUrl && (
                                            <img
                                                src={recipe.imageUrl}
                                                alt={recipe.translatedTitle || recipe.title}
                                                className="recipe-image"
                                            />
                                        )}
                                        <div className="recipe-content">
                                            <div className="recipe-title-row">
                                                <h3 className="recipe-title">
                                                    {recipe.translatedTitle || recipe.title}
                                                </h3>
                                                <div className="recipe-meta">
                                                    <span className="match-rate">
                                                        {Math.round(recipe.matchRate || 0)}%
                                                    </span>
                                                    {recipe.missingIngredientCount > 0 && (
                                                        <span className="missing-count">
                                                            부족: {recipe.missingIngredientCount}개
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* 이번엔 어려워요 😅 */}
                        {needManyIngredients.length > 0 && (
                            <div className="recipe-section">
                                <button
                                    className="section-header-toggle"
                                    onClick={() => setIsHardSectionExpanded(!isHardSectionExpanded)}
                                >
                                    <h3 className="section-header">
                                        이번엔 어려워요 😅 ({needManyIngredients.length}개)
                                    </h3>
                                    <svg
                                        className={`expand-icon ${isHardSectionExpanded ? 'expanded' : ''}`}
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path d="M6 9l6 6 6-6" />
                                    </svg>
                                </button>
                                {isHardSectionExpanded && (
                                    <div className="hard-recipes-list">
                                        {needManyIngredients.map((recipe, index) => (
                                            <div
                                                key={`many-${index}`}
                                                className="recipe-card"
                                                onClick={() => handleRecipeClick(recipe)}
                                            >
                                                {recipe.imageUrl && (
                                                    <img
                                                        src={recipe.imageUrl}
                                                        alt={recipe.translatedTitle || recipe.title}
                                                        className="recipe-image"
                                                    />
                                                )}
                                                <div className="recipe-content">
                                                    <div className="recipe-title-row">
                                                        <h3 className="recipe-title">
                                                            {recipe.translatedTitle || recipe.title}
                                                        </h3>
                                                        <div className="recipe-meta">
                                                            <span className="match-rate">
                                                                {Math.round(recipe.matchRate || 0)}%
                                                            </span>
                                                            {recipe.missingIngredientCount > 0 && (
                                                                <span className="missing-count">
                                                                    부족: {recipe.missingIngredientCount}개
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {!isLoading &&
                    allFilteredRecipes.length === 0 &&
                    selectedIngredients.length > 0 && (
                        <div className="empty-container">
                            <p className="empty-text">레시피를 찾을 수 없습니다.</p>
                        </div>
                    )}
            </div>
        </div>
    );
};

export default RecipeSearch;
