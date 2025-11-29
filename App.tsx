import React, { useState, useEffect } from 'react';
import { DiaryEntry } from './types';
import { EntryList } from './components/EntryList';
import { Editor } from './components/Editor';

// Helper to generate IDs
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

const App: React.FC = () => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('my-diary-entries');
    if (saved) {
      try {
        setEntries(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse entries", e);
      }
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('my-diary-entries', JSON.stringify(entries));
  }, [entries]);

  const handleCreateNew = () => {
    const newEntry: DiaryEntry = {
      id: generateId(),
      title: '',
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setEntries([newEntry, ...entries]);
    setSelectedEntryId(newEntry.id);
    // On mobile, this should close sidebar/show editor
    setIsSidebarOpen(false); 
  };

  const handleUpdateEntry = (updatedEntry: DiaryEntry) => {
    setEntries(prev => prev.map(e => e.id === updatedEntry.id ? updatedEntry : e));
  };

  const handleDeleteEntry = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه التدوينة؟')) {
      setEntries(prev => prev.filter(e => e.id !== id));
      if (selectedEntryId === id) {
        setSelectedEntryId(null);
      }
      setIsSidebarOpen(true); // Return to list view on delete
    }
  };

  const selectedEntry = entries.find(e => e.id === selectedEntryId) || null;

  return (
    <div className="flex h-screen overflow-hidden bg-stone-100 text-stone-900 font-sans">
      
      {/* Sidebar - Hidden on mobile if editor is active */}
      <div className={`
        fixed inset-y-0 right-0 z-30 w-full md:relative md:w-auto md:flex transform transition-transform duration-300 ease-in-out
        ${selectedEntryId === null ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
      `}>
        <EntryList
          entries={entries}
          selectedId={selectedEntryId}
          onSelect={(id) => {
            setSelectedEntryId(id);
          }}
          onNew={handleCreateNew}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full w-full relative z-0">
         {/* On mobile, if no entry selected, showing the sidebar (handled by CSS transform above). 
             If entry selected, show editor. 
             On Desktop, always show editor. 
         */}
        <Editor 
          entry={selectedEntry}
          onSave={handleUpdateEntry}
          onDelete={handleDeleteEntry}
          onBack={() => setSelectedEntryId(null)}
        />
      </div>

    </div>
  );
};

export default App;
