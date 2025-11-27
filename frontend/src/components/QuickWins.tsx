import { BoltIcon } from '@heroicons/react/24/outline';
import type { Recommendation } from '../types';

interface QuickWinsProps {
  quickWins: Recommendation[];
}

export default function QuickWins({ quickWins }: QuickWinsProps) {
  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg shadow-lg p-6 border border-yellow-200">
      <div className="flex items-center gap-2 mb-4">
        <BoltIcon className="h-6 w-6 text-yellow-600" />
        <h3 className="text-xl font-bold text-dark">Quick Wins</h3>
      </div>
      <p className="text-gray-700 mb-4">
        Queste sono le 5 azioni più impattanti che puoi implementare rapidamente:
      </p>
      <ol className="space-y-3">
        {quickWins.slice(0, 5).map((win, index) => (
          <li key={win.id} className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
              {index + 1}
            </span>
            <div>
              <h4 className="font-semibold text-dark">{win.title}</h4>
              <p className="text-sm text-gray-600">{win.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

