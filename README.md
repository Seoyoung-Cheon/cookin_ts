# COOKIN - 레시피 검색 웹 애플리케이션

TypeScript와 React로 구현된 레시피 검색 웹 애플리케이션입니다.

## 기능

- 🏠 홈 화면
- 🔍 재료 기반 레시피 검색 (한식/양식)
- 📖 레시피 상세 정보 보기
- ✅ 재료 보유 여부 확인

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 에셋 파일 복사

`c:\Cookin2\recipe_app\assets` 폴더에서 다음 파일들을 복사하세요:

- `Leeseoyun.ttf` → `public/assets/Leeseoyun.ttf`
- `logo (3).png` → `public/assets/logo (3).png`

Windows PowerShell에서:
```powershell
Copy-Item "c:\Cookin2\recipe_app\assets\Leeseoyun.ttf" -Destination "public\assets\Leeseoyun.ttf"
Copy-Item "c:\Cookin2\recipe_app\assets\logo (3).png" -Destination "public\assets\logo (3).png"
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173`을 열어 확인하세요.

## 빌드

프로덕션 빌드:

```bash
npm run build
```

빌드된 파일은 `dist` 폴더에 생성됩니다.

## 프로젝트 구조

```
cookin-web/
├── public/
│   └── assets/          # 폰트 및 이미지 파일
├── src/
│   ├── components/      # React 컴포넌트
│   │   ├── Home.tsx
│   │   ├── RecipeSearch.tsx
│   │   └── RecipeDetail.tsx
│   ├── data/           # 데이터 파일
│   │   └── koreanRecipes.ts
│   ├── services/       # API 서비스
│   │   ├── ApiService.ts
│   │   └── TranslationService.ts
│   ├── styles/         # CSS 스타일
│   │   ├── global.css
│   │   ├── home.css
│   │   ├── recipeSearch.css
│   │   └── recipeDetail.css
│   ├── types/          # TypeScript 타입 정의
│   │   └── index.ts
│   ├── utils/          # 유틸리티 함수
│   │   ├── constants.ts
│   │   └── ingredientTranslator.ts
│   ├── App.tsx         # 메인 App 컴포넌트
│   └── main.tsx        # 진입점
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 기술 스택

- **React 18** - UI 라이브러리
- **TypeScript** - 타입 안정성
- **Vite** - 빌드 도구
- **React Router** - 라우팅
- **Axios** - HTTP 클라이언트

## 디자인

원본 React Native 앱의 CSS 디자인을 웹에 맞게 변환했습니다:

- 배경색: `#ffe6d8`, `#FFF8F6`
- 버튼 색상: `#645559`, `#ff6b35`
- 텍스트 색상: `#56423d`, `#333`, `#666`
- 폰트: LeeSeoYun (커스텀 폰트)

## 라이선스

Private
