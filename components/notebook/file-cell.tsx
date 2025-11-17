'use client';

import { useState } from 'react';
import { useNotebook } from '@/contexts/notebook-context';
import type { NotebookCell, NotebookMode } from '@/types/notebook';
import { GripVertical, Trash2, FileIcon, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface FileCellProps {
  cell: NotebookCell;
  mode: NotebookMode;
}

export function FileCell({ cell, mode }: FileCellProps) {
  const { deleteCell } = useNotebook();
  const [isHovered, setIsHovered] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: cell.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  let attachment;
  try {
    attachment = JSON.parse(cell.content);
  } catch {
    attachment = { filename: 'file', url: cell.content };
  }

  const handleDownload = () => {
    if (!attachment.url) return;
    
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative border border-border/40 rounded-lg overflow-hidden bg-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {mode === 'edit' && isHovered && (
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-background/90 backdrop-blur-sm border border-border rounded-md p-1">
          <button
            {...attributes}
            {...listeners}
            className="p-1 hover:bg-accent rounded cursor-grab active:cursor-grabbing"
            title="Drag to reorder"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => deleteCell(cell.id)}
            title="Delete cell"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-md">
          <div className="flex-shrink-0">
            <div className="h-12 w-12 bg-primary/10 rounded-md flex items-center justify-center">
              <FileIcon className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{attachment.filename || 'Untitled File'}</p>
            <p className="text-sm text-muted-foreground">
              {attachment.mimeType || 'Unknown type'}
              {attachment.size && ` • ${(attachment.size / 1024).toFixed(1)} KB`}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </div>
    </div>
  );
}
