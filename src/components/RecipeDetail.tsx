import { useLocation, useNavigate } from 'react-router-dom';
import { Recipe } from '../types';
import '../styles/recipeDetail.css';

const RecipeDetail = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { recipe, selectedIngredients = [] } = (location.state as {
        recipe: Recipe;
        selectedIngredients: string[];
    }) || {};

    if (!recipe) {
        return (
            <div className="recipe-detail-container">
                <div className="error-container">
                    <p className="error-text">레시피 정보를 불러올 수 없습니다.</p>
                    <button onClick={() => navigate('/')}>홈으로 돌아가기</button>
                </div>
            </div>
        );
    }

    const checkIngredientAvailability = (ingredientName: string): boolean => {
        if (selectedIngredients.length === 0) {
            return false;
        }

        const normalizedRecipeIngredient = ingredientName.toLowerCase().trim();
        const recipeWords = normalizedRecipeIngredient
            .split(/[,\s]+/)
            .map((word) => word.trim())
            .filter((word) => word.length > 0);

        return selectedIngredients.some((selectedIngredient) => {
            const normalizedSelected = selectedIngredient.toLowerCase().trim();
            const selectedWords = normalizedSelected
                .split(/[,\s]+/)
                .map((word) => word.trim())
                .filter((word) => word.length > 0);

            if (normalizedRecipeIngredient === normalizedSelected) {
                return true;
            }

            const hasMatchingWord = recipeWords.some((recipeWord) => {
                return (
                    recipeWord === normalizedSelected ||
                    selectedWords.some((selectedWord) => recipeWord === selectedWord)
                );
            });

            if (hasMatchingWord) {
                return true;
            }

            if (normalizedRecipeIngredient.includes(normalizedSelected)) {
                const regex = new RegExp(
                    `(^|[,\\s])${normalizedSelected.replace(
                        /[.*+?^${}()|[\]\\]/g,
                        '\\$&'
                    )}([,\\s]|$)`,
                    'i'
                );
                return regex.test(normalizedRecipeIngredient);
            }

            return false;
        });
    };

    const handleBackClick = () => {
        // 검색 화면으로 명시적으로 이동 (상태는 localStorage에서 복원됨)
        navigate('/search');
    };

    return (
        <div className="recipe-detail-container">
            <div className="recipe-detail-header">
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
                <h1 className="recipe-title">
                    {recipe.translatedTitle || recipe.title}
                </h1>
            </div>
            <div className="recipe-detail-content">
                {recipe.imageUrl && (
                    <img
                        src={recipe.imageUrl}
                        alt={recipe.translatedTitle || recipe.title}
                        className="recipe-image"
                    />
                )}
                {(recipe.translatedDescription || recipe.description) && (
                    <p className="recipe-description">
                        {recipe.translatedDescription || recipe.description}
                    </p>
                )}

                {recipe.ingredients && recipe.ingredients.length > 0 && (
                    <>
                        <h2 className="section-title">필요한 재료</h2>
                        {(recipe.translatedIngredients || recipe.ingredients).map(
                            (ingredient, index) => {
                                const displayName =
                                    ingredient.translatedName || ingredient.name;
                                const hasIngredient = checkIngredientAvailability(displayName);

                                return (
                                    <div
                                        key={index}
                                        className={`ingredient-row ${!hasIngredient ? 'missing' : ''}`}
                                    >
                                        <svg
                                            className="ingredient-icon"
                                            viewBox="0 0 24 24"
                                            fill={hasIngredient ? '#4caf50' : '#f44336'}
                                        >
                                            {hasIngredient ? (
                                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                            ) : (
                                                <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
                                            )}
                                        </svg>
                                        <span
                                            className={`ingredient-text ${!hasIngredient ? 'missing' : ''}`}
                                        >
                                            {displayName}
                                            {ingredient.amount &&
                                                ingredient.unit &&
                                                ` (${ingredient.amount} ${ingredient.unit})`}
                                        </span>
                                        {!hasIngredient && (
                                            <div className="missing-badge">
                                                <span className="missing-badge-text">필요</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            }
                        )}
                    </>
                )}
                {recipe.steps && recipe.steps.length > 0 && (
                    <>
                        <h2 className="section-title">조리 방법</h2>
                        {(recipe.translatedSteps || recipe.steps).map((step, index) => (
                            <div key={index} className="step-row">
                                <div className="step-number">
                                    <span className="step-number-text">{index + 1}</span>
                                </div>
                                <p className="step-text">{step}</p>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
};

export default RecipeDetail;
