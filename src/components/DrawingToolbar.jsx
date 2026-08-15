import { useState } from 'react';
import { 
  Crosshair, Slash, GitCommit, Type, 
  Smile, Ruler, ZoomIn, Magnet, Lock, Eye, Trash2 
} from 'lucide-react';
import { useTradingStore } from '../store/useTradingStore';

export default function DrawingToolbar() {
  const [activeTool, setActiveTool] = useState('crosshair');
  const { theme } = useTradingStore();
  const isDark = theme === 'dark' || theme === 'midnight';

  const tools = [
    { id: 'crosshair', icon: Crosshair, title: 'Crosshair' },
    { id: 'trendline', icon: Slash, title: 'Trend Line' },
    { id: 'fibonacci', icon: GitCommit, title: 'Fibonacci Retracement' },
    { id: 'text', icon: Type, title: 'Text Annotation' },
    { id: 'icons', icon: Smile, title: 'Icons & Emojis' },
    { id: 'measure', icon: Ruler, title: 'Measure Range' },
    { id: 'zoom', icon: ZoomIn, title: 'Zoom In/Out' },
    { id: 'magnet', icon: Magnet, title: 'Magnet Mode' },
    { id: 'lock', icon: Lock, title: 'Lock All Drawings' },
    { id: 'hide', icon: Eye, title: 'Hide Drawings' },
    { id: 'clear', icon: Trash2, title: 'Clear Chart Drawings' },
  ];

  return (
    <aside
      style={{
        backgroundColor: theme === 'midnight' ? '#000000' : theme === 'dark' ? '#151922' : '#ffffff',
        borderColor: isDark ? '#232936' : '#e0e3eb',
      }}
      className="w-11 border-r flex flex-col items-center py-2 gap-1 select-none shrink-0 z-20 transition-colors"
    >
      {tools.map((t) => {
        const Icon = t.icon;
        const isActive = activeTool === t.id;
        return (
          <button
            key={t.id}
            title={t.title}
            onClick={() => setActiveTool(t.id)}
            className={`w-8 h-8 rounded flex items-center justify-center transition-all cursor-pointer ${
              isActive
                ? 'bg-[#2962ff]/20 text-[#2962ff]'
                : isDark
                ? 'text-gray-400 hover:bg-[#1E2533] hover:text-white'
                : 'text-[#606266] hover:bg-[#f0f3fa] hover:text-[#131722]'
            }`}
          >
            <Icon className="w-4 h-4" />
          </button>
        );
      })}
    </aside>
  );
}