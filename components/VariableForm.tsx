import React from 'react';
import { VariableConfig, VariableFactors } from '../types';
import { InputGroup } from './InputGroup';

interface Props {
  configs: VariableConfig[];
  values: VariableFactors;
  onChange: (id: string, value: string | number) => void;
}

export const VariableForm: React.FC<Props> = ({ configs, values, onChange }) => {
  // Group configs by 'group' property
  const grouped = configs.reduce((acc, conf) => {
    (acc[conf.group] = acc[conf.group] || []).push(conf);
    return acc;
  }, {} as Record<string, VariableConfig[]>);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Object.entries(grouped).map(([groupName, groupConfigs]: [string, VariableConfig[]]) => (
        <div key={groupName} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-md font-semibold text-brand-700 mb-4 pb-2 border-b border-slate-100">
            {groupName} 요인
          </h3>
          <div className="space-y-4">
            {groupConfigs.map((conf) => (
              <InputGroup key={conf.id} label={conf.label}>
                {conf.type === 'select' ? (
                  <select
                    value={values[conf.id] || ''}
                    onChange={(e) => onChange(conf.id, e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                  >
                    <option value="">선택하세요</option>
                    {conf.options?.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : conf.type === 'radio' ? (
                  <div className="flex gap-4">
                    {conf.options?.map((opt) => (
                      <label key={opt} className="flex items-center space-x-2 text-sm cursor-pointer">
                        <input
                          type="radio"
                          name={conf.id}
                          checked={values[conf.id] === opt}
                          onChange={() => onChange(conf.id, opt)}
                          className="text-brand-600 focus:ring-brand-500"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type={conf.type}
                      value={values[conf.id] || ''}
                      onChange={(e) => onChange(conf.id, e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                    />
                    {conf.suffix && (
                      <span className="absolute right-3 top-2 text-sm text-slate-400 pointer-events-none">
                        {conf.suffix}
                      </span>
                    )}
                  </div>
                )}
              </InputGroup>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};