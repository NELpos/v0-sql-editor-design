'use client';

import { useNotebook } from '@/contexts/notebook-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, Pencil, Save, Play, Upload, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState, useRef } from 'react';
import { ExportMenu } from './export-menu';
import { importFromJSON } from '@/lib/notebook-export';

export function NotebookHeader() {
  const { 
    notebook, 
    mode, 
    setMode, 
    editMode, 
    setEditMode, 
    results, 
    setNotebook, 
    updateTitle,
    executeCell,
    saveNow,
    isSaving
  } = useNotebook();
  const [isRunningAll, setIsRunningAll] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRunAll = async () => {
    if (!notebook) return;
    
    setIsRunningAll(true);
    const sqlCells = notebook.cells.filter((cell) => cell.type === 'sql');
    
    for (const cell of sqlCells) {
      await executeCell(cell.id);
    }
    
    setIsRunningAll(false);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = e.target?.result as string;
        const importedNotebook = importFromJSON(json);
        setNotebook(importedNotebook);
      } catch (error) {
        console.error('[v0] Failed to import notebook:', error);
        alert('Failed to import notebook. Please check the file format.');
      }
    };
    reader.readAsText(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    await saveNow();
  };

  return (
    <header className="border-b border-border bg-card">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4 flex-1 max-w-2xl">
          <Input
            value={notebook?.title || ''}
            onChange={(e) => updateTitle(e.target.value)}
            className="text-lg font-semibold border-none shadow-none px-2 -ml-2 focus-visible:ring-1"
            placeholder="Untitled Notebook"
          />
          {isSaving ? (
            <Badge variant="secondary" className="gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Saving...
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1 text-green-600 border-green-600">
              Auto-saved
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <Button
              variant={mode === 'view' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setMode('view')}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              View
            </Button>
            <Button
              variant={mode === 'edit' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setMode('edit')}
              className="gap-2"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          </div>

          <div className="h-6 w-px bg-border" />

          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2"
            onClick={handleRunAll}
            disabled={isRunningAll || mode !== 'view'}
          >
            {isRunningAll ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Run All
              </>
            )}
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save
          </Button>

          <ExportMenu notebook={notebook} results={results} />

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
            Import
          </Button>
        </div>
      </div>

      {mode === 'edit' && (
        <div className="border-t border-border bg-muted/30">
          <div className="flex items-center gap-1 px-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditMode('visual')}
              className={`rounded-none border-b-2 ${
                editMode === 'visual'
                  ? 'border-primary bg-background'
                  : 'border-transparent hover:bg-background/50'
              }`}
            >
              Visual
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditMode('yaml')}
              className={`rounded-none border-b-2 ${
                editMode === 'yaml'
                  ? 'border-primary bg-background'
                  : 'border-transparent hover:bg-background/50'
              }`}
            >
              YAML
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
