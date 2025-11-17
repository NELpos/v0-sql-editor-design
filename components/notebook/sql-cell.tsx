'use client';

import { useEffect, useRef, useState } from 'react';
import { useNotebook } from '@/contexts/notebook-context';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { sql, PostgreSQL } from '@codemirror/lang-sql';
import { oneDark } from '@codemirror/theme-one-dark';
import { Button } from '@/components/ui/button';
import { Trash2, GripVertical, Play, Loader2 } from 'lucide-react';
import { CellResults } from '@/components/notebook/cell-results';
import type { NotebookCell, NotebookMode } from '@/types/notebook';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SqlCellProps {
  cell: NotebookCell;
  mode: NotebookMode;
}

export function SqlCell({ cell, mode }: SqlCellProps) {
  const { updateCell, deleteCell, executeCell, results } = useNotebook();
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const cellResults = results[cell.id];
  const readOnly = mode === 'view';

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: cell.id, disabled: mode === 'view' });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  useEffect(() => {
    if (!editorRef.current) return;

    const state = EditorState.create({
      doc: cell.content,
      extensions: [
        basicSetup,
        sql({ dialect: PostgreSQL }),
        oneDark,
        EditorView.editable.of(!readOnly),
        !readOnly ? EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            updateCell(cell.id, update.state.doc.toString());
          }
        }) : [],
        EditorView.theme({
          '&': {
            fontSize: '14px',
            backgroundColor: 'oklch(0.145 0 0)',
          },
          '.cm-scroller': {
            fontFamily: 'var(--font-mono)',
            lineHeight: '1.5',
          },
          '.cm-gutters': {
            backgroundColor: 'oklch(0.16 0 0)',
            color: 'oklch(0.50 0 0)',
            border: 'none',
          },
          '.cm-content': {
            padding: '12px 16px',
            caretColor: readOnly ? 'transparent' : 'oklch(0.65 0.2 250)',
          },
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [mode, cell.id, updateCell, readOnly]);

  const handleExecute = async () => {
    setIsExecuting(true);
    await executeCell(cell.id);
    setIsExecuting(false);
  };

  if (mode === 'view') {
    return (
      <div className="space-y-3">
        <div className="group relative rounded-lg border border-border bg-card overflow-hidden hover:border-accent/50 transition-colors">
          <div className="absolute right-2 top-2 z-10">
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
              SQL
            </span>
          </div>

          <div ref={editorRef} className="min-h-[120px]" />

          <div className="border-t border-border bg-secondary/20 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                onClick={handleExecute}
                disabled={isExecuting || !cell.content}
                className="gap-2"
              >
                {isExecuting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                Run Query
              </Button>

              {cell.metadata?.executed && !isExecuting && (
                <span className="text-xs text-muted-foreground">
                  Last run: {cell.metadata.executionTime}ms
                </span>
              )}
            </div>
          </div>
        </div>

        {cellResults && <CellResults results={cellResults} />}
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} className="group relative flex items-start gap-2">
      <div className="flex-shrink-0 pt-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 cursor-grab active:cursor-grabbing hover:bg-muted"
          title="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>

      <div className="flex-1 space-y-3">
        <div className="group/cell relative rounded-lg border border-border bg-card overflow-hidden hover:border-accent/50 transition-colors">
          <div className="flex items-start justify-between p-2 border-b border-border/50">
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
              SQL
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => deleteCell(cell.id)}
              title="Delete cell"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div ref={editorRef} className="min-h-[120px]" />

          {!cell.content && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p className="text-sm text-muted-foreground">
                Write your SQL query here...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
