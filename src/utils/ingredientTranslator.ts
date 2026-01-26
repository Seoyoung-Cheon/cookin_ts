// 한글 재료명을 영어로 변환하는 유틸리티
class IngredientTranslator {
  // 한글-영어 재료명 매핑
  static ingredientMap: Record<string, string> = {
    // 채소류
    양파: "onion",
    당근: "carrot",
    감자: "potato",
    토마토: "tomato",
    마늘: "garlic",
    파: "green onion",
    대파: "scallion",
    상추: "lettuce",
    배추: "cabbage",
    양배추: "cabbage",
    시금치: "spinach",
    브로콜리: "broccoli",
    오이: "cucumber",
    가지: "eggplant",
    호박: "zucchini",
    고추: "pepper",
    피망: "bell pepper",
    버섯: "mushroom",
    생강: "ginger",
    고구마: "sweet potato",
    옥수수: "corn",
    콩: "bean",
    콩나물: "bean sprout",
    깻잎: "perilla leaf",
    부추: "chive",

    // 육류
    소고기: "beef",
    돼지고기: "pork",
    닭고기: "chicken",
    닭: "chicken",
    오리: "duck",
    양고기: "lamb",
    베이컨: "bacon",
    햄: "ham",
    소시지: "sausage",
    삼겹살: "pork belly",
    치킨: "chicken",
    닭다리: "chicken leg",
    닭가슴살: "chicken breast",

    // 해산물
    생선: "fish",
    연어: "salmon",
    참치: "tuna",
    고등어: "mackerel",
    새우: "shrimp",
    게: "crab",
    오징어: "squid",
    문어: "octopus",
    굴: "oyster",
    홍합: "mussel",
    조개: "clam",
    미역: "seaweed",
    김: "seaweed",

    // 유제품/계란
    계란: "egg",
    달걀: "egg",
    우유: "milk",
    치즈: "cheese",
    버터: "butter",
    요구르트: "yogurt",

    // 곡물/면류
    쌀: "rice",
    밥: "rice",
    국수: "noodle",
    라면: "ramen",
    스파게티: "spaghetti",
    파스타: "pasta",
    면: "noodle",
    떡: "rice cake",
    밀가루: "flour",
    빵: "bread",

    // 조미료/양념
    소금: "salt",
    설탕: "sugar",
    후추: "pepper",
    고춧가루: "red pepper powder",
    고추장: "gochujang",
    된장: "doenjang",
    간장: "soy sauce",
    식초: "vinegar",
    올리브오일: "olive oil",
    식용유: "cooking oil",
    참기름: "sesame oil",
    마요네즈: "mayonnaise",
    케첩: "ketchup",
    꿀: "honey",

    // 과일
    사과: "apple",
    배: "pear",
    딸기: "strawberry",
    바나나: "banana",
    오렌지: "orange",
    레몬: "lemon",
    포도: "grape",
    수박: "watermelon",
    복숭아: "peach",
    키위: "kiwi",
    파인애플: "pineapple",
    망고: "mango",
    아보카도: "avocado",

    // 견과류
    땅콩: "peanut",
    호두: "walnut",
    아몬드: "almond",
    잣: "pine nut",
    밤: "chestnut",

    // 기타
    두부: "tofu",
    순두부: "soft tofu",
  };

  // 한글 재료명을 영어로 변환
  static translateToEnglish(koreanName: string): string {
    const trimmed = koreanName.trim();

    // 정확히 일치하는 경우
    if (this.ingredientMap[trimmed]) {
      return this.ingredientMap[trimmed];
    }

    // 부분 일치 검색 (예: "양파 1개" -> "양파" 찾기)
    for (const key in this.ingredientMap) {
      if (trimmed.includes(key)) {
        return this.ingredientMap[key];
      }
    }

    // 변환할 수 없으면 원래 값 반환 (영어로 입력한 경우 대비)
    return trimmed;
  }

  // 여러 재료명을 한번에 변환
  static translateList(koreanNames: string[]): string[] {
    return koreanNames.map((name) => this.translateToEnglish(name));
  }
}

export default IngredientTranslator;
