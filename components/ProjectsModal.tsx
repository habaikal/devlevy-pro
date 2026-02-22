import React, { useState, useEffect } from 'react';
import { X, Save, FolderOpen, Trash2, Plus, AlertCircle } from 'lucide-react';
import { AppState } from '../types';

interface SavedProject {
    id: string;
    name: string;
    updatedAt: string;
    data: AppState;
}

interface ProjectsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentState: AppState;
    onLoadProject: (state: AppState) => void;
}

export function ProjectsModal({ isOpen, onClose, currentState, onLoadProject }: ProjectsModalProps) {
    const [projects, setProjects] = useState<SavedProject[]>([]);
    const [newProjectName, setNewProjectName] = useState('');

    useEffect(() => {
        if (isOpen) {
            loadProjects();
        }
    }, [isOpen]);

    const loadProjects = () => {
        const data = localStorage.getItem('devLevy_projects');
        if (data) {
            try {
                setProjects(JSON.parse(data));
            } catch {
                setProjects([]);
            }
        } else {
            setProjects([]);
        }
    };

    const saveProjects = (newProjects: SavedProject[]) => {
        localStorage.setItem('devLevy_projects', JSON.stringify(newProjects));
        setProjects(newProjects);
    };

    const handleSaveCurrent = () => {
        if (!newProjectName.trim()) {
            alert('프로젝트 이름을 입력해주세요.');
            return;
        }

        const newProject: SavedProject = {
            id: crypto.randomUUID(),
            name: newProjectName.trim(),
            updatedAt: new Date().toISOString(),
            data: currentState
        };

        // Check if name already exists, update instead
        const existingIndex = projects.findIndex(p => p.name === newProject.name);
        let updatedProjects = [...projects];

        if (existingIndex >= 0) {
            if (confirm(`'${newProject.name}'이(가) 이미 존재합니다. 덮어쓰시겠습니까?`)) {
                updatedProjects[existingIndex] = newProject;
            } else {
                return;
            }
        } else {
            updatedProjects.push(newProject);
        }

        saveProjects(updatedProjects);
        setNewProjectName('');
        alert('프로젝트가 저장되었습니다.');
    };

    const handleLoad = (project: SavedProject) => {
        if (confirm(`'${project.name}' 프로젝트를 불러오시겠습니까? 현재 작성 중인 내용은 저장되지 않습니다.`)) {
            onLoadProject(project.data);
            onClose();
        }
    };

    const handleDelete = (id: string, name: string) => {
        if (confirm(`'${name}' 프로젝트를 삭제하시겠습니까?`)) {
            const updated = projects.filter(p => p.id !== id);
            saveProjects(updated);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50 shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="bg-slate-200 p-1.5 rounded-lg text-slate-700">
                            <FolderOpen size={18} />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900">프로젝트 관리</h2>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 h-full space-y-6">
                    {/* Save Current Section */}
                    <div className="bg-brand-50 rounded-xl p-4 border border-brand-100 flex flex-col md:flex-row gap-3 items-end">
                        <div className="flex-1 w-full space-y-1">
                            <label className="text-sm font-semibold text-brand-900">현재 작업 상태 저장하기</label>
                            <input
                                type="text"
                                placeholder="프로젝트 이름 (예: 송파구 가락동 개발사업)"
                                value={newProjectName}
                                onChange={(e) => setNewProjectName(e.target.value)}
                                className="w-full px-4 py-2 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                            />
                        </div>
                        <button
                            onClick={handleSaveCurrent}
                            className="px-5 py-2.5 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition flex items-center gap-2 shadow-sm w-full md:w-auto justify-center"
                        >
                            <Save size={18} /> 저장
                        </button>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-slate-700 flex items-center justify-between">
                            저장된 프로젝트 목록
                            <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full">{projects.length}개</span>
                        </h3>
                        {projects.length === 0 ? (
                            <div className="text-center py-10 bg-slate-50 border border-slate-200 border-dashed rounded-xl">
                                <FolderOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500 font-medium">저장된 프로젝트가 없습니다.</p>
                                <p className="text-slate-400 text-sm mt-1">작업 내용을 이름과 함께 저장해보세요.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-3">
                                {projects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).map(project => (
                                    <div key={project.id} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-brand-300 hover:shadow-md transition group">
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-lg group-hover:text-brand-600 transition">{project.name}</h4>
                                            <p className="text-xs text-slate-500 mt-1">저장 일시: {new Date(project.updatedAt).toLocaleString('ko-KR')}</p>
                                        </div>
                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                            <button
                                                onClick={() => handleLoad(project)}
                                                className="flex-1 sm:flex-none px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition"
                                            >
                                                불러오기
                                            </button>
                                            <button
                                                onClick={() => handleDelete(project.id, project.name)}
                                                className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                                                title="삭제"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
