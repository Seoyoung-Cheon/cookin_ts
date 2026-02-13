# Assets 폴더

이 폴더에 다음 파일들을 복사해주세요:

1. **Leeseoyun.ttf** - 폰트 파일
   - 원본 위치: `c:\Cookin2\recipe_app\assets\Leeseoyun.ttf`
   - 복사 위치: `public/assets/Leeseoyun.ttf`

2. **logo (3).png** - 로고 이미지
   - 원본 위치: `c:\Cookin2\recipe_app\assets\logo (3).png`
   - 복사 위치: `public/assets/logo (3).png`

3. **1.jpg ~ 4.jpg** - 메인 화면 배경 슬라이드 (선택)
   - 메인 화면 가운데에서 천천히 전환·루프되는 배경 이미지 4장
   - 복사 위치: `public/assets/1.jpg`, `2.jpg`, `3.jpg`, `4.jpg`
   - 없으면 해당 영역만 비어 보일 수 있음

## 복사 방법

Windows PowerShell에서:
```powershell
# 프로젝트 루트에서 실행
Copy-Item "c:\Cookin2\recipe_app\assets\Leeseoyun.ttf" -Destination "public\assets\Leeseoyun.ttf"
Copy-Item "c:\Cookin2\recipe_app\assets\logo (3).png" -Destination "public\assets\logo (3).png"
```

또는 파일 탐색기에서 직접 복사하세요.
