import React, { useState, useEffect, useCallback } from 'react';
import { DiaryEntry } from '../types';
import { analyzeDiaryEntry } from '../services/geminiService';
import { Button } from './Button';
import { Save, Trash2, Wand2, ArrowRight } from 'lucide-react';

interface EditorProps {
  entry: DiaryEntry | null;
  onSave: (entry: DiaryEntry) => void;
  onDelete: (id: string) => void;
  onBack?: () => void; // For mobile
}

export const Editor: React.FC<EditorProps> = ({ entry, onSave, onDelete, onBack }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Sync state when entry changes
  useEffect(() => {
    if (entry) {
      setTitle(entry.title);
      setContent(entry.content);
    } else {
      setTitle('');
      setContent('');
    }
    setHasChanges(false);
  }, [entry?.id]); // Only reset when ID changes to avoid overwriting while typing if auto-save was implemented

  const handleSave = useCallback(() => {
    if (!entry) return;
    
    onSave({
      ...entry,
      title,
      content,
      updatedAt: Date.now(),
    });
    setHasChanges(false);
  }, [entry, title, content, onSave]);

  const handleAnalyze = async () => {
    if (!content.trim() || !entry) return;

    setIsAnalyzing(true);
    try {
      const result = await analyzeDiaryEntry(title, content);
      if (result) {
        onSave({
          ...entry,
          title,
          content,
          mood: result.mood,
          moodColor: result.moodColor,
          reflection: result.reflection,
          updatedAt: Date.now()
        });
        setHasChanges(false);
      }
    } catch (error) {
      console.error("Failed to analyze", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  if (!entry) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-stone-400 bg-stone-50/50">
        <div className="w-24 h-24 bg-stone-200 rounded-full mb-6 flex items-center justify-center">
          <Wand2 className="w-10 h-10 text-stone-400" />
        </div>
        <h2 className="text-xl font-medium mb-2">مساحة للتأمل</h2>
        <p>اختر تدوينة من القائمة أو أنشئ واحدة جديدة لتبدأ.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-stone-100 bg-white sticky top-0 z-20">
        <div className="flex items-center gap-2">
          {onBack && (
            <button onClick={onBack} className="md:hidden p-2 hover:bg-stone-100 rounded-full text-stone-600">
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
          <span className="text-sm text-stone-400 hidden sm:inline">
            {new Intl.DateTimeFormat('ar-EG', { dateStyle: 'full' }).format(new Date(entry.createdAt))}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
           <Button 
            variant="ghost" 
            onClick={() => onDelete(entry.id)}
            title="حذف"
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-5 h-5" />
          </Button>
          
          <Button 
            onClick={handleAnalyze} 
            disabled={isAnalyzing || !content.trim()}
            variant="secondary"
            className="hidden sm:flex"
            isLoading={isAnalyzing}
            icon={<Wand2 className="w-4 h-4 text-purple-600" />}
          >
            <span className="text-purple-700">تحليل وتأمل</span>
          </Button>

          <Button 
            onClick={handleSave} 
            disabled={!hasChanges && !isAnalyzing}
            variant={hasChanges ? 'primary' : 'secondary'}
            icon={<Save className="w-4 h-4" />}
          >
            {hasChanges ? 'حفظ التغييرات' : 'تم الحفظ'}
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-6 sm:p-10 space-y-6">
          
          {/* AI Reflection Card */}
          {(entry.mood || entry.reflection) && (
            <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 relative overflow-hidden transition-all animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-300 via-purple-300 to-indigo-300 opacity-50"></div>
              <div className="flex items-start gap-4">
                <div 
                  className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center shadow-sm text-white font-bold text-xl"
                  style={{ backgroundColor: entry.moodColor || '#a855f7' }}
                >
                  {entry.mood ? entry.mood[0] : '✨'}
                </div>
                <div>
                  <h4 className="font-bold text-indigo-900 text-lg mb-1 flex items-center gap-2">
                    تحليل الحالة: {entry.mood}
                  </h4>
                  <p className="text-indigo-800/80 leading-relaxed italic text-lg">
                    "{entry.reflection}"
                  </p>
                </div>
              </div>
            </div>
          )}

          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setHasChanges(true);
            }}
            placeholder="عنوان التدوينة..."
            className="w-full text-3xl sm:text-4xl font-bold text-ink placeholder-stone-300 border-none outline-none bg-transparent"
          />
          
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setHasChanges(true);
              handleInput(e); // Auto resize
            }}
            placeholder="اكتب ما يخطر في بالك..."
            className="w-full h-full min-h-[50vh] text-lg sm:text-xl leading-relaxed text-stone-700 placeholder-stone-300 border-none outline-none bg-transparent resize-none font-light"
            style={{ minHeight: '400px' }}
          />
          
          {/* Mobile specific AI button if needed at bottom */}
          <div className="sm:hidden pt-10 pb-4">
             <Button 
              onClick={handleAnalyze} 
              disabled={isAnalyzing || !content.trim()}
              variant="secondary"
              className="w-full flex"
              isLoading={isAnalyzing}
              icon={<Wand2 className="w-4 h-4 text-purple-600" />}
            >
              <span className="text-purple-700">تحليل وتأمل</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
