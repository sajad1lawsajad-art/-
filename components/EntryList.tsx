import React from 'react';
import { DiaryEntry } from '../types';
import { Plus, Search, BookOpen } from 'lucide-react';
import { Button } from './Button';

interface EntryListProps {
  entries: DiaryEntry[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const EntryList: React.FC<EntryListProps> = ({ 
  entries, 
  selectedId, 
  onSelect, 
  onNew,
  searchQuery,
  onSearchChange
}) => {
  
  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('ar-EG', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp));
  };

  const filteredEntries = entries.filter(e => 
    e.title.includes(searchQuery) || e.content.includes(searchQuery)
  );

  return (
    <div className="flex flex-col h-full bg-paper border-l border-stone-200 w-full md:w-80 lg:w-96 flex-shrink-0 shadow-lg z-10">
      <div className="p-4 border-b border-stone-200 bg-paper-dark/50 backdrop-blur-sm sticky top-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-ink flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            مذكراتي
          </h1>
          <Button onClick={onNew} variant="primary" className="!p-2 aspect-square rounded-full">
            <Plus className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="relative">
          <input
            type="text"
            placeholder="بحث في الذكريات..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-4 pr-10 py-2 rounded-lg bg-white border border-stone-300 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-10 text-stone-400">
            <p>لا توجد تدوينات مطابقة</p>
            <button onClick={onNew} className="text-primary text-sm mt-2 hover:underline">
              ابدأ الكتابة الآن
            </button>
          </div>
        ) : (
          filteredEntries.map(entry => (
            <div
              key={entry.id}
              onClick={() => onSelect(entry.id)}
              className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border text-right group ${
                selectedId === entry.id 
                  ? 'bg-white border-primary shadow-md scale-[1.02]' 
                  : 'bg-white/50 border-transparent hover:bg-white hover:border-stone-200 hover:shadow-sm'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <h3 className={`font-bold text-lg line-clamp-1 ${selectedId === entry.id ? 'text-primary' : 'text-ink'}`}>
                  {entry.title || 'بدون عنوان'}
                </h3>
                {entry.moodColor && (
                  <div 
                    className="w-3 h-3 rounded-full mt-1.5 shadow-sm" 
                    style={{ backgroundColor: entry.moodColor }}
                    title={entry.mood}
                  />
                )}
              </div>
              <p className="text-stone-500 text-sm line-clamp-2 mb-2 font-light">
                {entry.content || '...'}
              </p>
              <span className="text-xs text-stone-400 block text-left" dir="ltr">
                {formatDate(entry.createdAt)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
