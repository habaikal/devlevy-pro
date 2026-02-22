# DevLevy Pro (개발부담금 자동 산정 및 AI 분석 플랫폼)

DevLevy Pro는 복잡한 개발부담금 산정 과정을 자동화하고, 32가지 토지 특성 변수를 기반으로 구글 Gemini AI를 활용해 심층적인 사업성 분석 결과를 제공하는 전문가용 웹 애플리케이션입니다.

## 🌟 주요 기능 (Key Features)

*   **원클릭 개발부담금 계산**: 표준지가, 종료지가, 정상지가상승분, 개발비용 등을 종합하여 정확한 부과 추정액을 1원 단위까지 산정합니다.
*   **Google Gemini AI 결합 분석**: 작성된 변수들을 바탕으로 AI가 해당 부동산의 특성을 입체적으로 분석하여, 부담금 절감 및 대응 전략 시사점을 제시합니다.
*   **다중 프로젝트 관리 (Save & Load)**: 여러 지번의 산정 결과를 안전하게 브라우저 로컬 스토리지에 무제한 저장하고 언제든 다시 불러올 수 있습니다.
*   **강력한 프라이버시 보안**: 입력된 모든 데이터와 API Key는 중앙 서버로 전송되지 않고 사용자의 로컬 스토리지에만 보관됩니다. (Zero-Storage Architecture)
*   **데이터 검증 및 방어 로직**: Zod 기반 무결성 검증, PNU 코드(19자리) 유효성, 기간 역전 방지 등 엔터프라이즈급 입력 검증을 제공합니다.
*   **결과 리포트 출력 및 PDF 내보내기**: `window.print()` 호출 시 UI 요소를 숨기고 보고서 형태에 최적화된 인쇄 화면(CSS Media Print)을 지원합니다.
*   **다크 모드 (Dark Mode) 지원**: 실무자의 눈 피로를 덜어주는 시스템 레벨의 라이트/다크 테마 토글을 제공합니다.

## 🚀 시작하기 (Getting Started)

### 사전 요구 사항 (Prerequisites)
*   Node.js (v18 이상 권장)
*   Google Gemini API Key (무료 발급 가능: [Google AI Studio](https://aistudio.google.com/))

### 로컬 실행 방법 (Run Locally)

1.  **의존성 설치 (Install dependencies)**
    ```bash
    npm install
    ```

2.  **개발 서버 실행 (Run the app)**
    ```bash
    npm run dev
    ```

3.  **API 키 등록 방법**
    과거 버전처럼 `.env.local`에 하드코딩하지 않습니다.
    앱 실행 후 브라우저 상단 헤더의 **[환경 설정(열쇠 아이콘)]** 버튼을 클릭하여 본인의 Gemini API Key를 입력 후 저장하세요. 해당 키는 사용자의 브라우저 내부에만 안전하게 보관됩니다.

## 🛠️ 기술 스택 (Tech Stack)
*   **Frontend Framework**: React 18, Vite
*   **Styling**: Tailwind CSS
*   **Icons**: Lucide React
*   **Charts**: Recharts
*   **Data Validation**: Zod
*   **Markdown Rendering**: React-Markdown, Remark-Gfm

## 🔗 라이브 서비스 (Live Demo)
GitHub Pages를 통해 호스팅 중인 최신 버전은 아래 링크에서 언제든지 사용 가능합니다.
*   **Live Web App**: [https://habaikal.github.io/devlevy-pro/](https://habaikal.github.io/devlevy-pro/)

## 📝 배포 가이드 (Deployment)

본 프로젝트는 GitHub Pages 자동 배포를 염두에 두고 설정되었습니다. `vite.config.ts` 파일의 `base` 경로가 정확한지 확인 후 빌드하세요.

```bash
# 프로덕션 빌드
npm run build

# GitHub Pages 배포 (gh-pages 패키지 필요)
npm run deploy
```
