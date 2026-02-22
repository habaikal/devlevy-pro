import * as XLSX from 'xlsx';
import { AppState, VariableFactorsSchema } from '../types';
import { VARIABLE_CONFIGS } from '../constants';

export const exportToExcel = (state: AppState, result: any) => {
  const data: any[] = [
    { 구분: '요약', 항목: '개발이익', 값: result.devProfit },
    { 구분: '요약', 항목: '개발부담금', 값: result.levyAmount },
    { 구분: '사업정보', 항목: '사업면적', 값: state.project.area },
    { 구분: '사업정보', 항목: '개발시작일', 값: state.project.startDate },
    { 구분: '지가정보', 항목: '개시시점지가', 값: state.landPrice.startPrice },
    { 구분: '지가정보', 항목: '종료시점지가', 값: state.landPrice.endPrice },
  ];

  // Add all variables
  VARIABLE_CONFIGS.forEach(conf => {
    data.push({
      구분: '변수',
      항목: conf.label,
      값: state.variables[conf.id] || ''
    });
  });

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "개발부담금_산정_보고서");
  XLSX.writeFile(wb, `DevLevy_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
};

export const parseExcelInput = (file: File): Promise<Partial<AppState>> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]]; // Assume first sheet
        const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        // Very basic mapping logic assuming row 2 contains values in order corresponding to var1...var32
        const values = (json[1] as any[]) || [];

        const variables: any = {};
        VARIABLE_CONFIGS.forEach((conf, index) => {
          if (values[index] !== undefined && values[index] !== '') {
            variables[conf.id] = values[index];
          }
        });

        const parsedVariables = VariableFactorsSchema.parse(variables);

        resolve({ variables: parsedVariables });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsBinaryString(file);
  });
};