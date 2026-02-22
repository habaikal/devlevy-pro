import React, { useState, useEffect } from 'react';
import {
    Calculator,
    Upload,
    Download,
    Save,
    RotateCcw,
    DollarSign,
    MapPin,
    Briefcase,
    BrainCircuit,
    Search,
    CheckCircle2,
    TrendingUp,
    AlertCircle,
    Settings,
    FolderOpen,
    Printer,
    FilePlus2
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie
} from 'recharts';

import { AppState } from './types';
import { INITIAL_STATE, VARIABLE_CONFIGS } from './constants';
import { calculateLevy, calculateLandPriceFromVariables, fetchMolitLandPrice } from './services/calculationService';
import { exportToExcel, parseExcelInput } from './services/excelService';
import { analyzeProject } from './services/geminiService';

import { VariableForm } from './components/VariableForm';
import { InputGroup } from './components/InputGroup';
import { AnalysisModal } from './components/AnalysisModal';
import { SettingsModal } from './components/SettingsModal';
import { ProjectsModal } from './components/ProjectsModal';
import { AppStateSchema } from './types';

const TABS = [
    { id: 'project', label: '1. 사업 기본정보', icon: Briefcase },
    { id: 'land', label: '2. 지가 및 변수', icon: MapPin },
    { id: 'costs', label: '3. 개발비용', icon: DollarSign },
    { id: 'result', label: '4. 산정 결과', icon: Calculator },
];

export default function App() {
    const [state, setState] = useState<AppState>(INITIAL_STATE);
    const [activeTab, setActiveTab] = useState('project');
    const [calculation, setCalculation] = useState({ totalCost: 0, devProfit: 0, levyAmount: 0 });

    // AI State
    const [isAiModalOpen, setAiModalOpen] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiResult, setAiResult] = useState("");

    // Modals
    const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
    const [isProjectsModalOpen, setProjectsModalOpen] = useState(false);

    useEffect(() => {
        const res = calculateLevy(state);
        setCalculation(res);
    }, [state]);

    const handleVariableChange = (id: string, value: string | number) => {
        setState(prev => ({
            ...prev,
            variables: { ...prev.variables, [id]: value }
        }));
    };

    const updateNestedState = (section: keyof AppState, key: string, value: any) => {
        setState(prev => ({
            ...prev,
            [section]: { ...prev[section], [key]: value }
        }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                const parsed = await parseExcelInput(e.target.files[0]);
                if (parsed.variables) {
                    setState(prev => ({
                        ...prev,
                        variables: { ...prev.variables, ...parsed.variables }
                    }));
                    alert("엑셀 데이터가 성공적으로 로드되었습니다!");
                }
            } catch (err) {
                alert("엑셀 파일 파싱에 실패했습니다.");
            }
        }
    };

    const handleApplyVariablesToPrice = (type: 'start' | 'end') => {
        const calculatedPrice = calculateLandPriceFromVariables(state.variables);
        if (calculatedPrice > 0) {
            updateNestedState('landPrice', type === 'start' ? 'startPrice' : 'endPrice', calculatedPrice);
            alert(`변수 기반 ${type === 'start' ? '개시시점' : '종료시점'} 지가 적용: ${calculatedPrice.toLocaleString()}원`);
        } else {
            alert("먼저 공시지가(기준가격)와 변수들을 입력해주세요.");
        }
    };

    const handleFetchMolit = async (type: 'start' | 'end') => {
        const year = type === 'start' ? state.project.startYear : state.project.endYear;
        try {
            const price = await fetchMolitLandPrice(state.project.serviceKey, state.project.pnu, year);
            if (price) {
                updateNestedState('landPrice', type === 'start' ? 'startPrice' : 'endPrice', price);
                alert(`API 조회 성공: ${price.toLocaleString()}원`);
            } else {
                alert("데이터를 찾을 수 없습니다. PNU나 년도를 확인하세요.");
            }
        } catch (e) {
            alert("API 오류: 서비스키 또는 PNU를 확인하세요.");
        }
    };

    const handleAiAnalyze = async () => {
        const key = localStorage.getItem('gemini_api_key');
        if (!key) {
            alert("AI 분석을 위해 먼저 API 설정에서 키를 등록해주세요.");
            setSettingsModalOpen(true);
            return;
        }
        setAiModalOpen(true);
        setAiLoading(true);
        const result = await analyzeProject(state, key);
        setAiResult(result);
        setAiLoading(false);
    };

    const autoCalculateNormalIncrease = () => {
        const start = new Date(state.project.startDate);
        const end = new Date(state.project.endDate);
        const startPrice = state.landPrice.startPrice;

        if (isNaN(start.getTime()) || isNaN(end.getTime()) || !startPrice) {
            alert("개발시작일, 종료일, 개시시점지가를 먼저 입력해주세요.");
            return;
        }

        const years = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
        const rate = (parseFloat(state.variables['var30'] as string) || 5) / 100; // Use var30 or default 5%

        const increase = Math.floor(startPrice * (Math.pow(1 + rate, years) - 1));
        updateNestedState('landPrice', 'normalIncrease', increase);
    };

    const chartData = [
        { name: '총 개발비용', value: calculation.totalCost, fill: '#64748b' },
        { name: '개발이익', value: calculation.devProfit > 0 ? calculation.devProfit : 0, fill: '#10b981' },
        { name: '개발부담금', value: calculation.levyAmount, fill: '#0ea5e9' },
    ];

    const pieData = [
        { name: '순공사비', value: state.costs.construction },
        { name: '조사비', value: state.costs.survey },
        { name: '설계비', value: state.costs.design },
        { name: '일반관리비', value: state.costs.management },
        { name: '기부채납액', value: state.costs.donation },
        { name: '기타비용', value: state.costs.other },
    ].filter(d => d.value > 0);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="bg-brand-600 text-white p-2 rounded-lg shadow-sm">
                            <Calculator size={20} />
                        </div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight hidden sm:block">DevLevy Pro</h1>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2">
                        <button
                            onClick={() => {
                                if (confirm("모든 입력값을 초기화하시겠습니까?")) {
                                    setState(INITIAL_STATE);
                                }
                            }}
                            className="p-2 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-full transition"
                            title="새 프로젝트(초기화)"
                        >
                            <FilePlus2 size={20} />
                        </button>
                        <button
                            onClick={() => setProjectsModalOpen(true)}
                            className="p-2 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-full transition"
                            title="프로젝트 관리"
                        >
                            <FolderOpen size={20} />
                        </button>
                        <button
                            onClick={() => {
                                const data = localStorage.getItem('devLevyData');
                                if (data) {
                                    try {
                                        const parsed = AppStateSchema.parse(JSON.parse(data));
                                        setState(parsed);
                                        alert("임시 저장된 데이터를 불러왔습니다.");
                                    } catch (e) {
                                        alert("무결성 오류: 변경 또는 오손된 데이터 구조입니다.");
                                    }
                                } else {
                                    alert("임시 저장된 데이터가 없습니다.");
                                }
                            }}
                            className="hidden md:block p-2 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-full transition"
                            title="불러오기(임시)"
                        >
                            <RotateCcw size={20} />
                        </button>
                        <button
                            onClick={() => {
                                localStorage.setItem('devLevyData', JSON.stringify(state));
                                alert("브라우저에 임시 데이터가 저장되었습니다.");
                            }}
                            className="hidden md:block p-2 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-full transition"
                            title="저장하기(임시)"
                        >
                            <Save size={20} />
                        </button>
                        <label className="p-2 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-full transition cursor-pointer" title="엑셀 가져오기">
                            <Upload size={20} />
                            <input type="file" className="hidden" accept=".xlsx" onChange={handleFileUpload} />
                        </label>
                        <button
                            onClick={() => window.print()}
                            className="p-2 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-full transition"
                            title="인쇄 및 PDF"
                        >
                            <Printer size={20} />
                        </button>
                        <button
                            onClick={() => setSettingsModalOpen(true)}
                            className="p-2 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-full transition"
                            title="환경 설정"
                        >
                            <Settings size={20} />
                        </button>
                        <button
                            onClick={() => exportToExcel(state, calculation)}
                            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition font-medium text-sm shadow-sm"
                        >
                            <Download size={16} />
                            <span className="hidden sm:inline">보고서 다운로드</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">

                {/* Navigation Sidebar */}
                <nav className="w-full lg:w-64 flex-shrink-0">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden sticky top-24 z-10">
                        <div className="p-4 bg-slate-50 border-b border-slate-100">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">설정 메뉴</p>
                        </div>
                        {TABS.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-4 text-left text-sm font-medium transition-all duration-200 border-l-4 ${activeTab === tab.id
                                            ? 'border-brand-600 bg-brand-50 text-brand-700'
                                            : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                        }`}
                                >
                                    <Icon size={18} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Real-time Summary Panel (Desktop) */}
                    <div className="hidden lg:block mt-6 bg-slate-900 text-white rounded-2xl p-6 shadow-xl sticky top-[400px]">
                        <p className="text-slate-400 text-xs font-semibold uppercase mb-4">예상 개발부담금</p>
                        <div className="text-3xl font-bold mb-1 tracking-tight">
                            ₩ {calculation.levyAmount.toLocaleString()}
                        </div>
                        <div className="flex justify-between items-center text-sm mb-6">
                            <span className="text-slate-400">순 개발이익</span>
                            <span className={calculation.devProfit > 0 ? "text-emerald-400 font-medium" : "text-rose-400 font-medium"}>
                                ₩ {calculation.devProfit.toLocaleString()}
                            </span>
                        </div>
                        <div className="h-px bg-slate-700 mb-4"></div>
                        <button
                            onClick={handleAiAnalyze}
                            className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/30 hover:scale-[1.02]"
                        >
                            <BrainCircuit size={16} />
                            AI 정밀 분석
                        </button>
                    </div>
                </nav>

                {/* Tab Content */}
                <div className="flex-1 min-w-0">

                    {/* Project Info Tab */}
                    {activeTab === 'project' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <Briefcase className="text-brand-600" size={20} />
                                    사업 기본정보
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputGroup label="사업면적 (㎡)">
                                        <input
                                            type="number"
                                            value={state.project.area}
                                            onChange={(e) => updateNestedState('project', 'area', parseFloat(e.target.value))}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition"
                                        />
                                    </InputGroup>
                                    <InputGroup label="공공데이터포털 서비스키">
                                        <input
                                            type="text"
                                            placeholder="공공데이터포털(data.go.kr)에서 발급받은 키 입력"
                                            value={state.project.serviceKey}
                                            onChange={(e) => updateNestedState('project', 'serviceKey', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition"
                                        />
                                    </InputGroup>
                                    <InputGroup label="개발시작일">
                                        <input
                                            type="date"
                                            value={state.project.startDate}
                                            onChange={(e) => updateNestedState('project', 'startDate', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition"
                                        />
                                    </InputGroup>
                                    <InputGroup label="개발종료일">
                                        <input
                                            type="date"
                                            value={state.project.endDate}
                                            onChange={(e) => updateNestedState('project', 'endDate', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition"
                                        />
                                    </InputGroup>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <MapPin className="text-brand-600" size={20} />
                                    토지 고유번호 (PNU)
                                </h2>
                                <div className="flex gap-4 items-end">
                                    <InputGroup label="PNU 코드 (19자리)" className="flex-1">
                                        <input
                                            type="text"
                                            maxLength={19}
                                            placeholder="예: 4113510300101780001"
                                            value={state.project.pnu}
                                            onChange={(e) => updateNestedState('project', 'pnu', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition font-mono"
                                        />
                                    </InputGroup>
                                </div>
                                <p className="text-xs text-slate-400 mt-2">
                                    국토교통부 부동산 공시지가 알리미 API를 통해 자동으로 지가를 조회할 때 사용됩니다.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Land & Variables Tab */}
                    {activeTab === 'land' && (
                        <div className="space-y-6 animate-fade-in">

                            {/* Price Cards Row */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Start Price */}
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                    <h3 className="text-md font-bold text-slate-800 mb-4 flex justify-between items-center">
                                        <span>개시시점지가 (시작)</span>
                                        <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500">Step 1</span>
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                placeholder="년도"
                                                className="w-24 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                                value={state.project.startYear}
                                                onChange={(e) => updateNestedState('project', 'startYear', e.target.value)}
                                            />
                                            <button
                                                onClick={() => handleFetchMolit('start')}
                                                className="flex-1 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700 transition flex items-center justify-center gap-2"
                                            >
                                                <Search size={14} /> API 조회
                                            </button>
                                        </div>
                                        <InputGroup label="개시시점지가 (원)">
                                            <input
                                                type="number"
                                                value={state.landPrice.startPrice}
                                                onChange={(e) => updateNestedState('landPrice', 'startPrice', parseFloat(e.target.value))}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-700"
                                            />
                                        </InputGroup>
                                        <button
                                            onClick={() => handleApplyVariablesToPrice('start')}
                                            className="w-full py-2 border border-brand-200 text-brand-600 rounded-lg text-sm hover:bg-brand-50 transition"
                                        >
                                            변수 기반 자동 산정
                                        </button>
                                    </div>
                                </div>

                                {/* End Price */}
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                    <h3 className="text-md font-bold text-slate-800 mb-4 flex justify-between items-center">
                                        <span>종료시점지가 (종료)</span>
                                        <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500">Step 2</span>
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                placeholder="년도"
                                                className="w-24 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                                value={state.project.endYear}
                                                onChange={(e) => updateNestedState('project', 'endYear', e.target.value)}
                                            />
                                            <button
                                                onClick={() => handleFetchMolit('end')}
                                                className="flex-1 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700 transition flex items-center justify-center gap-2"
                                            >
                                                <Search size={14} /> API 조회
                                            </button>
                                        </div>
                                        <InputGroup label="종료시점지가 (원)">
                                            <input
                                                type="number"
                                                value={state.landPrice.endPrice}
                                                onChange={(e) => updateNestedState('landPrice', 'endPrice', parseFloat(e.target.value))}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-700"
                                            />
                                        </InputGroup>
                                        <button
                                            onClick={() => handleApplyVariablesToPrice('end')}
                                            className="w-full py-2 border border-brand-200 text-brand-600 rounded-lg text-sm hover:bg-brand-50 transition"
                                        >
                                            변수 기반 자동 산정
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Normal Increase */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-6">
                                <div className="flex-1 w-full">
                                    <InputGroup label="정상지가상승분 (원)" subLabel="공제 항목">
                                        <input
                                            type="number"
                                            value={state.landPrice.normalIncrease}
                                            onChange={(e) => updateNestedState('landPrice', 'normalIncrease', parseFloat(e.target.value))}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                                        />
                                    </InputGroup>
                                </div>
                                <button
                                    onClick={autoCalculateNormalIncrease}
                                    className="w-full md:w-auto px-6 py-2.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm hover:bg-emerald-100 transition font-medium flex items-center justify-center gap-2 border border-emerald-200"
                                >
                                    <TrendingUp size={16} />
                                    자동 계산 (표준상승률)
                                </button>
                            </div>

                            <div className="bg-brand-50 p-6 rounded-2xl border border-brand-100">
                                <h3 className="text-md font-bold text-brand-800 mb-2">32개 지가 산정 변수</h3>
                                <p className="text-sm text-brand-600 mb-6">아래 변수들을 상세히 입력할수록 지가 산정의 정확도가 올라갑니다.</p>
                                <VariableForm
                                    configs={VARIABLE_CONFIGS}
                                    values={state.variables}
                                    onChange={handleVariableChange}
                                />
                            </div>
                        </div>
                    )}

                    {/* Costs Tab */}
                    {activeTab === 'costs' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <DollarSign className="text-brand-600" size={20} />
                                    개발비용 산출명세서
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <InputGroup label="순공사비 (원)">
                                        <input type="number" value={state.costs.construction} onChange={(e) => updateNestedState('costs', 'construction', parseFloat(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                                    </InputGroup>
                                    <InputGroup label="조사비 (원)">
                                        <input type="number" value={state.costs.survey} onChange={(e) => updateNestedState('costs', 'survey', parseFloat(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                                    </InputGroup>
                                    <InputGroup label="설계비 (원)">
                                        <input type="number" value={state.costs.design} onChange={(e) => updateNestedState('costs', 'design', parseFloat(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                                    </InputGroup>
                                    <InputGroup label="일반관리비 (원)">
                                        <input type="number" value={state.costs.management} onChange={(e) => updateNestedState('costs', 'management', parseFloat(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                                    </InputGroup>
                                    <InputGroup label="기부채납액 (원)">
                                        <input type="number" value={state.costs.donation} onChange={(e) => updateNestedState('costs', 'donation', parseFloat(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                                    </InputGroup>
                                    <InputGroup label="기타비용 (원)">
                                        <input type="number" value={state.costs.other} onChange={(e) => updateNestedState('costs', 'other', parseFloat(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                                    </InputGroup>
                                </div>

                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                                    <span className="text-slate-600 font-medium">총 개발비용 합계</span>
                                    <span className="text-xl font-bold text-slate-900">₩ {calculation.totalCost.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                <h3 className="text-md font-bold text-slate-800 mb-4">비용 구성 비율</h3>
                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value: number) => `₩ ${value.toLocaleString()}`} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Results Tab */}
                    {activeTab === 'result' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                    <p className="text-sm text-slate-500 mb-1">총 개발비용</p>
                                    <p className="text-2xl font-bold text-slate-700">₩ {calculation.totalCost.toLocaleString()}</p>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                    <p className="text-sm text-slate-500 mb-1">개발이익 (지가차액 - 비용)</p>
                                    <p className={`text-2xl font-bold ${calculation.devProfit > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        ₩ {calculation.devProfit.toLocaleString()}
                                    </p>
                                </div>
                                <div className="bg-gradient-to-br from-brand-500 to-brand-600 p-6 rounded-2xl shadow-lg text-white">
                                    <p className="text-brand-100 mb-1 text-sm">최종 개발부담금 (25%)</p>
                                    <p className="text-3xl font-bold">₩ {calculation.levyAmount.toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <TrendingUp className="text-brand-600" size={20} />
                                    산정 결과 시각화
                                </h2>
                                <div className="h-80 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                            <YAxis hide />
                                            <Tooltip
                                                cursor={{ fill: '#f1f5f9' }}
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                formatter={(value: number) => [`₩ ${value.toLocaleString()}`, '금액']}
                                            />
                                            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                                {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 flex items-start gap-4">
                                <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600 shrink-0">
                                    <AlertCircle size={24} />
                                </div>
                                <div>
                                    <h3 className="text-indigo-900 font-bold mb-1">AI 전문가 분석</h3>
                                    <p className="text-indigo-700 text-sm mb-4">
                                        Gemini AI를 통해 현재 입력된 지가 정보와 비용 구조를 분석하고, 잠재적인 리스크와 개선점을 파악해보세요.
                                    </p>
                                    <button
                                        onClick={handleAiAnalyze}
                                        className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition shadow-sm flex items-center gap-2"
                                    >
                                        <BrainCircuit size={16} />
                                        지금 분석 실행하기
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Analysis Modal */}
            <AnalysisModal
                isOpen={isAiModalOpen}
                onClose={() => setAiModalOpen(false)}
                loading={aiLoading}
                result={aiResult}
            />
            <SettingsModal
                isOpen={isSettingsModalOpen}
                onClose={() => setSettingsModalOpen(false)}
            />
            <ProjectsModal
                isOpen={isProjectsModalOpen}
                onClose={() => setProjectsModalOpen(false)}
                currentState={state}
                onLoadProject={(loadedState) => setState(loadedState)}
            />
        </div>
    );
}