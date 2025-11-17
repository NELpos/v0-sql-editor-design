'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import type { Notebook, NotebookCell, NotebookResults, NotebookMode, EditMode } from '@/types/notebook';
import { executeSQL } from '@/app/actions/execute-sql';
import { AutoSaver } from '@/lib/sqlnb-storage';
import yaml from 'js-yaml';

interface NotebookContextType {
  notebook: Notebook | null;
  mode: NotebookMode;
  editMode: EditMode;
  results: Record<string, NotebookResults>;
  setMode: (mode: NotebookMode) => void;
  setEditMode: (mode: EditMode) => void;
  updateCell: (cellId: string, content: string) => void;
  addCell: (type: 'markdown' | 'sql' | 'image' | 'file', afterCellId?: string, attachment?: any) => void;
  deleteCell: (cellId: string) => void;
  executeCell: (cellId: string) => Promise<void>;
  setNotebook: (notebook: Notebook) => void;
  reorderCells: (cellIds: string[]) => void;
  updateFromYAML: (yamlContent: string) => void;
  updateTitle: (title: string) => void;
  saveNow: () => Promise<void>;
  isSaving: boolean;
}

export const NotebookContext = createContext<NotebookContextType | null>(null);

export function useNotebook() {
  const context = useContext(NotebookContext);
  if (!context) {
    throw new Error('useNotebook must be used within NotebookProvider');
  }
  return context;
}

export function NotebookProvider({ children }: { children: ReactNode }) {
  const [notebook, setNotebook] = useState<Notebook | null>(null);
  const [mode, setMode] = useState<NotebookMode>('view');
  const [editMode, setEditMode] = useState<EditMode>('visual');
  const [results, setResults] = useState<Record<string, NotebookResults>>({});
  const [isSaving, setIsSaving] = useState(false);
  
  const autoSaverRef = useRef<AutoSaver | null>(null);
  
  useEffect(() => {
    autoSaverRef.current = new AutoSaver(2000);
    
    return () => {
      if (autoSaverRef.current && notebook) {
        autoSaverRef.current.forceSave(notebook.id, notebook, results);
      }
    };
  }, []);
  
  // Auto-save when notebook or results change
  useEffect(() => {
    if (notebook && autoSaverRef.current) {
      autoSaverRef.current.scheduleSave(notebook.id, notebook, results);
    }
  }, [notebook, results]);

  const updateCell = useCallback((cellId: string, content: string) => {
    setNotebook((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        cells: prev.cells.map((cell) =>
          cell.id === cellId ? { ...cell, content } : cell
        ),
        updatedAt: new Date(),
      };
    });
  }, []);

  const addCell = useCallback((type: 'markdown' | 'sql' | 'image' | 'file', afterCellId?: string, attachment?: any) => {
    setNotebook((prev) => {
      if (!prev) return prev;
      
      const content = (type === 'image' || type === 'file') && attachment 
        ? JSON.stringify(attachment)
        : '';
      
      const newCell: NotebookCell = {
        id: `cell-${Date.now()}`,
        type,
        content,
        order: afterCellId
          ? prev.cells.find((c) => c.id === afterCellId)!.order + 1
          : prev.cells.length,
      };

      const updatedCells = afterCellId
        ? [
            ...prev.cells.filter((c) => c.order <= newCell.order - 1),
            newCell,
            ...prev.cells
              .filter((c) => c.order >= newCell.order)
              .map((c) => ({ ...c, order: c.order + 1 })),
          ]
        : [...prev.cells, newCell];

      return {
        ...prev,
        cells: updatedCells,
        updatedAt: new Date(),
      };
    });
  }, []);

  const deleteCell = useCallback((cellId: string) => {
    setNotebook((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        cells: prev.cells
          .filter((cell) => cell.id !== cellId)
          .map((cell, index) => ({ ...cell, order: index })),
        updatedAt: new Date(),
      };
    });
    
    setResults((prev) => {
      const newResults = { ...prev };
      delete newResults[cellId];
      return newResults;
    });
  }, []);

  const executeCell = useCallback(async (cellId: string) => {
    const cell = notebook?.cells.find((c) => c.id === cellId);
    if (!cell || cell.type !== 'sql') return;

    try {
      const result = await executeSQL(cell.content, notebook!.id);

      if (result.error) {
        setResults((prev) => ({
          ...prev,
          [cellId]: {
            cellId,
            data: [],
            columns: [],
            executedAt: new Date(),
            executionTimeMs: 0,
            error: result.error,
          },
        }));
      } else {
        const successResult: NotebookResults = {
          cellId,
          data: result.data || [],
          columns: result.columns || [],
          executedAt: new Date(),
          executionTimeMs: result.executionTimeMs || 0,
        };

        setResults((prev) => ({
          ...prev,
          [cellId]: successResult,
        }));

        setNotebook((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            cells: prev.cells.map((c) =>
              c.id === cellId
                ? {
                    ...c,
                    metadata: {
                      executed: true,
                      executionTime: successResult.executionTimeMs,
                      resultCount: successResult.data.length,
                    },
                  }
                : c
            ),
          };
        });
      }
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        [cellId]: {
          cellId,
          data: [],
          columns: [],
          executedAt: new Date(),
          executionTimeMs: 0,
          error: error instanceof Error ? error.message : 'Execution failed',
        },
      }));
    }
  }, [notebook]);

  const reorderCells = useCallback((cellIds: string[]) => {
    setNotebook((prev) => {
      if (!prev) return prev;
      
      const cellMap = new Map(prev.cells.map((cell) => [cell.id, cell]));
      const reorderedCells = cellIds
        .map((id) => cellMap.get(id))
        .filter((cell): cell is NotebookCell => cell !== undefined)
        .map((cell, index) => ({ ...cell, order: index }));

      return {
        ...prev,
        cells: reorderedCells,
        updatedAt: new Date(),
      };
    });
  }, []);

  const updateFromYAML = useCallback((yamlContent: string) => {
    try {
      const parsed = yaml.load(yamlContent);
      
      if (!parsed || typeof parsed !== 'object') {
        console.error('[v0] Invalid YAML structure');
        return;
      }
      
      const updatedNotebook: Notebook = {
        id: (parsed as any).id || notebook?.id || 'unknown',
        title: (parsed as any).title || 'Untitled',
        cells: ((parsed as any).blocks || []).map((block: any) => ({
          id: block.id,
          type: block.type,
          content: block.content?.raw || '',
          order: block.order,
          metadata: block.metadata?.execution,
        })),
        createdAt: (parsed as any).metadata?.created ? new Date((parsed as any).metadata.created) : new Date(),
        updatedAt: new Date(),
      };
      
      setNotebook(updatedNotebook);
    } catch (error) {
      console.error('[v0] Failed to parse YAML:', error);
    }
  }, [notebook]);

  const updateTitle = useCallback((title: string) => {
    setNotebook((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        title,
        updatedAt: new Date(),
      };
    });
  }, []);

  const saveNow = useCallback(async () => {
    if (!notebook || !autoSaverRef.current) return;
    
    setIsSaving(true);
    try {
      await autoSaverRef.current.forceSave(notebook.id, notebook, results);
    } catch (error) {
      console.error('[v0] Failed to save:', error);
    } finally {
      setIsSaving(false);
    }
  }, [notebook, results]);

  return (
    <NotebookContext.Provider
      value={{
        notebook,
        mode,
        editMode,
        results,
        setMode,
        setEditMode,
        updateCell,
        addCell,
        deleteCell,
        executeCell,
        setNotebook,
        reorderCells,
        updateFromYAML,
        updateTitle,
        saveNow,
        isSaving,
      }}
    >
      {children}
    </NotebookContext.Provider>
  );
}
