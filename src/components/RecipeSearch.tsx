import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../services/ApiService';
import { Recipe, RecipeType } from '../types';
import '../styles/recipeSearch.css';

const RecipeSearch = () => {
  const navigate = useNavigate();
  const [ingredientText, setIngredientText] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recipeType, setRecipeType] = useState<RecipeType>('korean');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const inputRef = useRef<HTMLInputElement>(null);

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

  const hasAllSelectedIngredients = (recipe: Recipe): boolean => {
    if (!selectedIngredients || selectedIngredients.length === 0) {
      return false;
    }

    const recipeIngredients =
      recipe.translatedIngredients || recipe.ingredients || [];

    if (recipeIngredients.length === 0) {
      return false;
    }

    return selectedIngredients.every((selectedIngredient) => {
      return recipeIngredients.some((ingredient) => {
        const ingredientName =
          ingredient.translatedName ||
          ingredient.name ||
          ingredient.originalName ||
          '';
        return isIngredientMatched(ingredientName, selectedIngredient);
      });
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

    let matchedCount = 0;

    recipeIngredients.forEach((ingredient) => {
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

    const matchRate = (matchedCount / recipeIngredients.length) * 100;
    return Math.round(matchRate * 100) / 100;
  };

  const filteredRecipes = recipes
    .filter(hasAllSelectedIngredients)
    .map((recipe) => ({
      ...recipe,
      matchRate: calculateMatchRate(recipe),
    }))
    .sort((a, b) => (b.matchRate || 0) - (a.matchRate || 0));

  const totalPages = Math.ceil(filteredRecipes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRecipes = filteredRecipes.slice(startIndex, endIndex);
  const hasNextPage = currentPage < totalPages;

  const handleNextPage = () => {
    if (hasNextPage) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleRecipeClick = (recipe: Recipe) => {
    navigate('/detail', {
      state: { recipe, selectedIngredients },
    });
  };

  return (
    <div className="recipe-search-container">
      <div className="recipe-search-content">
        <div className="input-section">
          <div className="toggle-container">
            <button
              className={`toggle-button ${
                recipeType === 'korean' ? 'toggle-button-active' : ''
              }`}
              onClick={() => handleRecipeTypeChange('korean')}
            >
              한식
            </button>
            <button
              className={`toggle-button ${
                recipeType === 'western' ? 'toggle-button-active' : ''
              }`}
              onClick={() => handleRecipeTypeChange('western')}
            >
              양식
            </button>
          </div>
          <h2 className="section-title">
            음식 재료를 입력하세요({recipeType === 'korean' ? '한식' : '양식'})
          </h2>
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
            <div>로딩 중...</div>
            <p className="loading-text">레시피를 찾고 있어요...</p>
          </div>
        )}

        {!isLoading && filteredRecipes.length > 0 && (
          <div className="results-section">
            <h2 className="results-title">
              검색 결과 ({filteredRecipes.length}개)
            </h2>
            {currentRecipes.map((recipe, index) => (
              <div
                key={startIndex + index}
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
                  <h3 className="recipe-title">
                    {recipe.translatedTitle || recipe.title}
                  </h3>
                  {(recipe.translatedDescription || recipe.description) && (
                    <p className="recipe-description">
                      {recipe.translatedDescription || recipe.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {hasNextPage && (
              <button className="next-page-button" onClick={handleNextPage}>
                다음 페이지 ({currentPage + 1}/{totalPages})
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            )}
            {totalPages > 1 && (
              <p className="page-info">
                {currentPage} / {totalPages} 페이지
              </p>
            )}
          </div>
        )}

        {!isLoading &&
          filteredRecipes.length === 0 &&
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
