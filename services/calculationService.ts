import { VariableFactors, CalculationResult, AppState } from '../types';
import { WEIGHTS } from '../constants';

export const calculateLandPriceFromVariables = (variables: VariableFactors): number => {
  // Base logic extracted from the original HTML
  const officialPrice = parseFloat(variables['var22'] as string) || 0;
  if (!officialPrice) return 0;

  let adjustment = 1.0;

  // Apply weights
  // Var 3
  if (variables['var3']) adjustment *= (WEIGHTS.var3[variables['var3']] || 1);
  // Var 5
  if (variables['var5']) adjustment *= (WEIGHTS.var5[variables['var5']] || 1);
  // Var 7 (Road Width)
  const roadWidth = parseFloat(variables['var7'] as string) || 0;
  if (roadWidth > 0) {
    adjustment *= roadWidth >= WEIGHTS.var7.threshold ? WEIGHTS.var7.above : WEIGHTS.var7.below;
  }
  // Var 8
  if (variables['var8']) adjustment *= (WEIGHTS.var8[variables['var8']] || 1);
  // Var 14
  if (variables['var14']) adjustment *= (WEIGHTS.var14[variables['var14']] || 1);
  
  // Specific logic for Building Ratio (Var 12)
  const buildRatio = parseFloat(variables['var12'] as string) || 0;
  if (buildRatio > 0 && buildRatio < 100) {
    adjustment *= Math.min(1.2, 100 / buildRatio); // Normalized dampener
  }

  // Market adjustment (Var 21 vs 22 average)
  const recentTrade = parseFloat(variables['var21'] as string) || officialPrice;
  const basePrice = (officialPrice + recentTrade) / 2;

  return Math.floor(basePrice * adjustment);
};

export const calculateLevy = (state: AppState): CalculationResult => {
  const { landPrice, costs } = state;

  const totalCost = 
    (costs.construction || 0) +
    (costs.survey || 0) +
    (costs.design || 0) +
    (costs.management || 0) +
    (costs.donation || 0) +
    (costs.other || 0);

  const profit = (landPrice.endPrice || 0) - (landPrice.startPrice || 0) - (landPrice.normalIncrease || 0) - totalCost;
  
  const levy = profit > 0 ? profit * landPrice.rate : 0;

  return {
    totalCost,
    devProfit: profit,
    levyAmount: levy
  };
};

export const fetchMolitLandPrice = async (
  serviceKey: string,
  pnu: string,
  year: number
): Promise<number | null> => {
  if (!serviceKey || !pnu || !year) return null;
  
  // Note: This often requires a proxy in production due to CORS. 
  // We will attempt a direct call assuming the browser or a plugin allows it, 
  // or the API supports CORS.
  const url = `https://api.allorigins.win/get?url=${encodeURIComponent(
    `http://apis.data.go.kr/1611000/nsdi/IndvdLandPriceService/attr/getIndvdLandPriceAttr?serviceKey=${serviceKey}&pnu=${pnu}&format=json&numOfRows=1&pageNo=1&stdrYear=${year}`
  )}`;

  try {
    const res = await fetch(url);
    const wrapper = await res.json();
    const data = JSON.parse(wrapper.contents);
    
    const priceStr = data?.indvdLandPrices?.field?.[0]?.pblntfPclnd;
    return priceStr ? parseInt(priceStr, 10) : null;
  } catch (error) {
    console.error("API Error", error);
    throw new Error("Failed to fetch land price");
  }
};