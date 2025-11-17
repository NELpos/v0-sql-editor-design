'use client';

import { useNotebook } from '@/contexts/notebook-context';
import { NotebookCell } from '@/components/notebook/notebook-cell';
import { AddCellButton } from '@/components/notebook/add-cell-button';
import { YAMLEditor } from '@/components/notebook/yaml-editor';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useEffect } from 'react';

export function NotebookContent() {
  const { notebook, mode, editMode, reorderCells, addCell } = useNotebook();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      if (mode !== 'edit' || editMode !== 'visual') return;
      
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          
          const file = item.getAsFile();
          if (!file) continue;

          const reader = new FileReader();
          reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            
            const attachment = {
              type: 'image',
              url: dataUrl,
              filename: file.name || `pasted-image-${Date.now()}.png`,
              size: file.size,
              mimeType: file.type,
            };

            addCell('image', undefined, attachment);
            
            console.log('[v0] Pasted image added to notebook');
          };
          
          reader.readAsDataURL(file);
          break;
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [mode, editMode, addCell]);

  if (!notebook) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        Loading notebook...
      </div>
    );
  }

  if (mode === 'edit' && editMode === 'yaml') {
    return <YAMLEditor />;
  }

  const sortedCells = [...notebook.cells].sort((a, b) => a.order - b.order);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sortedCells.findIndex((cell) => cell.id === active.id);
      const newIndex = sortedCells.findIndex((cell) => cell.id === over.id);

      const reorderedCells = arrayMove(sortedCells, oldIndex, newIndex);
      reorderCells(reorderedCells.map((cell) => cell.id));
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-5xl mx-auto py-8 px-6 space-y-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedCells.map((cell) => cell.id)}
            strategy={verticalListSortingStrategy}
          >
            {sortedCells.map((cell, index) => (
              <div key={cell.id}>
                <NotebookCell cell={cell} />
                <AddCellButton afterCellId={cell.id} />
              </div>
            ))}
          </SortableContext>
        </DndContext>

        {sortedCells.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No cells yet</p>
            <AddCellButton />
          </div>
        )}
      </div>
    </div>
  );
}
