'use client';

import { useNotebook } from '@/contexts/notebook-context';
import { Button } from '@/components/ui/button';
import { FileText, Database, Image, File } from 'lucide-react';
import { useRef } from 'react';

interface AddCellButtonProps {
  afterCellId?: string;
}

export function AddCellButton({ afterCellId }: AddCellButtonProps) {
  const { addCell, mode } = useNotebook();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (mode !== 'edit') return null;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      addCell('image', afterCellId, {
        url: dataUrl,
        filename: file.name,
        mimeType: file.type,
        size: file.size,
      });
    };
    reader.readAsDataURL(file);
    
    // Reset input
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      addCell('file', afterCellId, {
        url: dataUrl,
        filename: file.name,
        mimeType: file.type,
        size: file.size,
      });
    };
    reader.readAsDataURL(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 py-2 border-t border-border/40">
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => addCell('markdown', afterCellId)}
      >
        <FileText className="h-4 w-4" />
        Add Markdown
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => addCell('sql', afterCellId)}
      >
        <Database className="h-4 w-4" />
        Add SQL
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => imageInputRef.current?.click()}
      >
        <Image className="h-4 w-4" />
        Add Image
      </Button>
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageSelect}
      />
      
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => fileInputRef.current?.click()}
      >
        <File className="h-4 w-4" />
        Add File
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
}
