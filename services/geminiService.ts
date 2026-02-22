import { GoogleGenAI } from "@google/genai";
import { AppState } from "../types";

export const analyzeProject = async (state: AppState, apiKey: string): Promise<string> => {
  if (!apiKey) {
    return "API 키가 설정되지 않았습니다. 우측 상단 톱니바퀴 설정 메뉴에서 구글 AI API 키를 입력해주세요.";
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    당신은 한국의 전문 감정평가사 및 도시계획 전문가입니다.
    "개발부담금" 산정을 위해 다음 개발 사업 데이터를 분석해 주세요.
    
    사업 데이터:
    - 사업면적: ${state.project.area} ㎡
    - 현재 이용상태: ${state.variables['var6'] || '정보 없음'}
    - 용도지역: ${state.variables['var5'] || '정보 없음'}
    - 도로 접근성: ${state.variables['var8']} (${state.variables['var7']}m 폭)
    - 토지 형상: ${state.variables['var15'] || '정보 없음'}
    - 개시시점지가: ${state.landPrice.startPrice.toLocaleString()} 원
    - 종료시점지가: ${state.landPrice.endPrice.toLocaleString()} 원
    - 총 개발비용: ${(state.costs.construction + state.costs.design).toLocaleString()} 원

    작업:
    1. 용도지역과 도로 접근성을 고려할 때 개시시점지가와 종료시점지가의 차이가 합리적인지 평가하세요.
    2. 변수들 중에서 잠재적인 위험 요소(예: 작은 면적 대비 높은 개발비용 등)를 식별하세요.
    3. 개발 가치에 대한 간략한 전문가 의견을 제시하세요.
    
    답변은 한국어로 작성하고, 200단어 이내로 간결하고 전문적인 어조를 유지하세요.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "분석 결과가 생성되지 않았습니다.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "분석을 생성하는 데 실패했습니다. 잠시 후 다시 시도해 주세요.";
  }
};