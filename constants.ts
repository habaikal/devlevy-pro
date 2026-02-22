import { VariableConfig } from './types';

export const INITIAL_STATE = {
  project: {
    area: 0,
    startDate: '',
    endDate: '',
    pnu: '',
    serviceKey: '',
    startYear: 2020,
    endYear: 2024,
  },
  landPrice: {
    startPrice: 0,
    endPrice: 0,
    normalIncrease: 0,
    rate: 0.25,
  },
  costs: {
    construction: 0,
    survey: 0,
    design: 0,
    management: 0,
    donation: 0,
    other: 0,
  },
  variables: {},
};

// Configuration for the 32 variables to generate the UI dynamically
export const VARIABLE_CONFIGS: VariableConfig[] = [
  { id: 'var1', label: '1. 소재지 (행정구역)', type: 'text', group: '기본정보' },
  { id: 'var2', label: '2. 지번 (표준지)', type: 'text', group: '기본정보' },
  { id: 'var3', label: '3. 지목', type: 'select', options: ['대지', '전', '답', '임야', '잡종지'], group: '기본정보' },
  { id: 'var4', label: '4. 면적', type: 'number', suffix: '㎡', group: '기본정보' },
  { id: 'var5', label: '5. 용도지역', type: 'select', options: ['주거', '상업', '공업', '녹지', '관리'], group: '법적규제' },
  { id: 'var6', label: '6. 이용상태', type: 'select', options: ['건축물 있음', '나지', '공터'], group: '물리적현황' },
  { id: 'var7', label: '7. 접한 도로폭', type: 'number', suffix: 'm', group: '도로교통' },
  { id: 'var8', label: '8. 도로 종류', type: 'select', options: ['광대로', '중로', '소로', '세로', '맹지'], group: '도로교통' },
  { id: 'var9', label: '9. 중심지 거리', type: 'number', suffix: 'km', group: '입지조건' },
  { id: 'var10', label: '10. 주위환경', type: 'select', options: ['상업지대', '주택지대', '농경지대', '산업지대'], group: '입지조건' },
  { id: 'var11', label: '11. 도시계획구역', type: 'radio', options: ['예', '아니오'], group: '법적규제' },
  { id: 'var12', label: '12. 건폐율 제한', type: 'number', suffix: '%', group: '법적규제' },
  { id: 'var13', label: '13. 용적률 제한', type: 'number', suffix: '%', group: '법적규제' },
  { id: 'var14', label: '14. 토지 지형', type: 'select', options: ['평탄', '완경사', '급경사', '저지'], group: '물리적현황' },
  { id: 'var15', label: '15. 토지 형상', type: 'select', options: ['정방형', '장방형', '사다리형', '부정형', '자루형'], group: '물리적현황' },
  { id: 'var16', label: '16. 조망권 유무', type: 'radio', options: ['예', '아니오'], group: '환경조건' },
  { id: 'var17', label: '17. 소음 정도', type: 'select', options: ['낮음', '보통', '높음'], group: '환경조건' },
  { id: 'var18', label: '18. 공법상 제한', type: 'text', group: '법적규제' },
  { id: 'var19', label: '19. 공공시설 접근성', type: 'number', suffix: 'm', group: '입지조건' },
  { id: 'var20', label: '20. 환경오염 여부', type: 'radio', options: ['예', '아니오'], group: '환경조건' },
  { id: 'var21', label: '21. 최근 거래가', type: 'number', suffix: '원', group: '시장가치' },
  { id: 'var22', label: '22. 공시지가', type: 'number', suffix: '원', group: '시장가치' },
  { id: 'var23', label: '23. 개발 가능성', type: 'radio', options: ['예', '아니오'], group: '개발가능성' },
  { id: 'var24', label: '24. 기부채납 여부', type: 'radio', options: ['예', '아니오'], group: '사업특성' },
  { id: 'var25', label: '25. 토지 이용 현황', type: 'text', group: '기본정보' },
  { id: 'var26', label: '26. 인접 토지 용도', type: 'select', options: ['주거', '상업', '공업', '녹지'], group: '입지조건' },
  { id: 'var27', label: '27. 보상 이력', type: 'radio', options: ['예', '아니오'], group: '이력관리' },
  { id: 'var28', label: '28. 토지 등급', type: 'select', options: ['1급', '2급', '3급', '4급', '5급'], group: '시장가치' },
  { id: 'var29', label: '29. 세금 및 공과금', type: 'number', suffix: '원', group: '비용' },
  { id: 'var30', label: '30. 표준 상승률', type: 'number', suffix: '%', group: '시장가치' },
  { id: 'var31', label: '31. 평가자 의견', type: 'text', group: '기타' },
  { id: 'var32', label: '32. 기타 특이사항', type: 'text', group: '기타' },
];

// Calculation Weights (Simplified logic based on provided HTML)
export const WEIGHTS: any = {
  var3: { '대지': 1.0, '전': 0.8, '임야': 0.5, '잡종지': 0.7 },
  var5: { '주거': 1.0, '상업': 1.3, '공업': 0.9, '녹지': 0.6 },
  var6: { '건축물 있음': 1.1, '나지': 1.0, '공터': 0.9 },
  var7: { threshold: 6, above: 1.1, below: 0.9 },
  var8: { '광대로': 1.3, '중로': 1.1, '소로': 1.0, '세로': 0.9, '맹지': 0.6 },
  var10: { '상업지대': 1.25, '주택지대': 1.0, '농경지대': 0.7 },
  var14: { '평탄': 1.0, '완경사': 0.9, '급경사': 0.7, '저지': 0.8 },
  var15: { '정방형': 1.05, '장방형': 1.0, '부정형': 0.8, '자루형': 0.7 },
  var20: { '예': 0.8, '아니오': 1.0 },
};