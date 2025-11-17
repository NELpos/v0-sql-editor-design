'use client';

import { useState, useRef } from 'react';
import { useNotebook } from '@/contexts/notebook-context';
import type { NotebookCell, NotebookMode, ImageDisplayConfig } from '@/types/notebook';
import { GripVertical, Trash2, ImageIcon, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Slider } from '@/components/ui/slider';

interface ImageCellProps {
  cell: NotebookCell;
  mode: NotebookMode;
}

const ASPECT_RATIOS: Array<{
  label: string;
  value: ImageDisplayConfig['aspectRatio'];
  ratio: number;
}> = [
  { label: 'Original', value: 'original', ratio: 0 },
  { label: '16:9 (Widescreen)', value: '16:9', ratio: 16 / 9 },
  { label: '4:3 (Standard)', value: '4:3', ratio: 4 / 3 },
  { label: '1:1 (Square)', value: '1:1', ratio: 1 },
  { label: '3:2 (Photo)', value: '3:2', ratio: 3 / 2 },
];

const ALIGNMENTS: Array<{
  label: string;
  value: ImageDisplayConfig['alignment'];
}> = [
  { label: 'Left', value: 'left' },
  { label: 'Center', value: 'center' },
  { label: 'Right', value: 'right' },
];

export function ImageCell({ cell, mode }: ImageCellProps) {
  const { deleteCell, updateCell } = useNotebook();
  const [isHovered, setIsHovered] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

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
    attachment = { url: cell.content };
  }

  const displayConfig: ImageDisplayConfig = attachment.displayConfig || {
    width: '100%',
    aspectRatio: 'original',
    alignment: 'center',
  };

  const handleImageReplace = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const newAttachment = {
        ...attachment,
        url: dataUrl,
        filename: file.name,
        mimeType: file.type,
        size: file.size,
      };
      updateCell(cell.id, JSON.stringify(newAttachment));
    };
    reader.readAsDataURL(file);
    
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const updateDisplayConfig = (updates: Partial<ImageDisplayConfig>) => {
    const newAttachment = {
      ...attachment,
      displayConfig: {
        ...displayConfig,
        ...updates,
      },
    };
    updateCell(cell.id, JSON.stringify(newAttachment));
  };

  const getImageStyle = (): React.CSSProperties => {
    const style: React.CSSProperties = {};
    
    if (displayConfig.aspectRatio && displayConfig.aspectRatio !== 'original') {
      const ratio = ASPECT_RATIOS.find(r => r.value === displayConfig.aspectRatio)?.ratio;
      if (ratio) {
        style.aspectRatio = `${ratio}`;
        style.objectFit = 'cover';
      }
    }
    
    if (displayConfig.width) {
      style.width = typeof displayConfig.width === 'number' 
        ? `${displayConfig.width}px` 
        : displayConfig.width;
      style.maxWidth = '100%';
    }
    
    return style;
  };

  const getAlignmentClass = () => {
    switch (displayConfig.alignment) {
      case 'left': return 'items-start';
      case 'right': return 'items-end';
      case 'center':
      default: return 'items-center';
    }
  };

  const widthPercentage = typeof displayConfig.width === 'string' && displayConfig.width.endsWith('%')
    ? parseInt(displayConfig.width)
    : 100;

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
        {attachment.url ? (
          <div className="space-y-3">
            <div className={`flex flex-col ${getAlignmentClass()}`}>
              <img
                src={attachment.url || "/placeholder.svg"}
                alt={attachment.filename || 'Image'}
                style={getImageStyle()}
                className="rounded-md"
              />
            </div>

            {mode === 'edit' && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Width: {widthPercentage}%</span>
                  </div>
                  <Slider
                    value={[widthPercentage]}
                    onValueChange={([value]) => updateDisplayConfig({ width: `${value}%` })}
                    min={20}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Maximize2 className="h-3 w-3" />
                        {ASPECT_RATIOS.find(r => r.value === displayConfig.aspectRatio)?.label || 'Original'}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuLabel>Aspect Ratio</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {ASPECT_RATIOS.map((ratio) => (
                        <DropdownMenuItem
                          key={ratio.value}
                          onClick={() => updateDisplayConfig({ aspectRatio: ratio.value })}
                          className={displayConfig.aspectRatio === ratio.value ? 'bg-accent' : ''}
                        >
                          {ratio.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        Align: {displayConfig.alignment || 'Center'}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuLabel>Alignment</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {ALIGNMENTS.map((align) => (
                        <DropdownMenuItem
                          key={align.value}
                          onClick={() => updateDisplayConfig({ alignment: align.value })}
                          className={displayConfig.alignment === align.value ? 'bg-accent' : ''}
                        >
                          {align.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => imageInputRef.current?.click()}
                  >
                    Replace
                  </Button>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ImageIcon className="h-4 w-4" />
                  {attachment.filename || 'image.png'}
                  {attachment.size && ` (${(attachment.size / 1024).toFixed(1)} KB)`}
                </div>

                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageReplace}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-48 bg-muted/30 rounded-md">
            <div className="text-center text-muted-foreground">
              <ImageIcon className="h-12 w-12 mx-auto mb-2" />
              <p>No image</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
