// 간단한 번역 서비스 (Google Translate API 사용)
class TranslationService {
  // 영어 → 한국어 번역 (간단한 구현)
  async translateToKorean(text: string): Promise<string> {
    try {
      // Google Translate API 사용 (무료 버전)
      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ko&dt=t&q=${encodeURIComponent(
          text
        )}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data && data[0] && data[0][0] && data[0][0][0]) {
          return data[0][0][0];
        }
      }

      // 번역 실패 시 원문 반환
      return text;
    } catch (error) {
      console.log("번역 실패:", error);
      return text; // 실패하면 원문 반환
    }
  }

  // 여러 문장 한번에 번역
  async translateList(texts: string[]): Promise<string[]> {
    const translated: string[] = [];
    for (const text of texts) {
      if (text && text.trim()) {
        translated.push(await this.translateToKorean(text));
      } else {
        translated.push(text);
      }
    }
    return translated;
  }
}

export default TranslationService;
