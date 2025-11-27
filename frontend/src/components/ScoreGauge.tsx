import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import type { AnalysisResult } from '../types';

interface ScoreGaugeProps {
  analysis: AnalysisResult;
}

const COLORS = {
  technical: '#3b82f6',
  onPage: '#10b981',
  local: '#f59e0b',
  offPage: '#8b5cf6',
  aeo: '#a855f7', // Purple per AEO
};

export default function ScoreGauge({ analysis }: ScoreGaugeProps) {
  const data = [
    { name: 'Technical SEO', value: analysis.technical.score, max: 25, color: COLORS.technical },
    { name: 'On-Page SEO', value: analysis.onPage.score, max: 25, color: COLORS.onPage },
    { name: 'Local SEO', value: analysis.local.score, max: 20, color: COLORS.local },
    { name: 'Off-Page SEO', value: analysis.offPage.score, max: 10, color: COLORS.offPage },
    { name: 'AEO/RAO', value: analysis.aeo.score, max: 20, color: COLORS.aeo },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <div className={`text-6xl font-bold ${getScoreColor(analysis.score)}`}>
          {analysis.score}
        </div>
        <div className="text-gray-600 text-lg">Punteggio Totale / 100</div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value, max }) => `${name}: ${value}/${max}`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-6 grid grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((item) => (
          <div key={item.name} className="text-center">
            <div className="text-2xl font-bold" style={{ color: item.color }}>
              {item.value}
            </div>
            <div className="text-sm text-gray-600">{item.name}</div>
            <div className="text-xs text-gray-500">/ {item.max}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

