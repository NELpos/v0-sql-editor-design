'use client';

import { useWorkspace } from '@/contexts/workspace-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronRight, ChevronDown, Folder, FolderOpen, FileText, Plus, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WorkspaceFile } from '@/types/workspace';
import { useState } from 'react';

export function FileExplorer() {
  const { workspace, selectedFile, selectFile, expandedFolders, toggleFolder } = useWorkspace();
  const [searchQuery, setSearchQuery] = useState('');

  const renderFile = (file: WorkspaceFile, depth: number = 0) => {
    const isFolder = file.type === 'folder';
    const isExpanded = expandedFolders.has(file.id);
    const isSelected = selectedFile?.id === file.id;

    return (
      <div key={file.id}>
        <button
          onClick={() => {
            if (isFolder) {
              toggleFolder(file.id);
            } else {
              selectFile(file);
            }
          }}
          className={cn(
            'w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors',
            'hover:bg-accent/50',
            isSelected && 'bg-accent text-accent-foreground',
            !isSelected && 'text-foreground/90'
          )}
          style={{ paddingLeft: `${depth * 16 + 12}px` }}
        >
          {isFolder && (
            <span className="flex-shrink-0">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </span>
          )}
          
          <span className="flex-shrink-0">
            {isFolder ? (
              isExpanded ? (
                <FolderOpen className="h-4 w-4 text-blue-400" />
              ) : (
                <Folder className="h-4 w-4 text-blue-400" />
              )
            ) : (
              <FileText className="h-4 w-4 text-muted-foreground" />
            )}
          </span>
          
          <span className="truncate flex-1 text-left">{file.name}</span>
          
          {!isFolder && file.extension && (
            <span className="text-xs text-muted-foreground">{file.extension}</span>
          )}
        </button>

        {isFolder && isExpanded && file.children && (
          <div>
            {file.children.map((child) => renderFile(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-64 border-r border-border bg-secondary/20 flex flex-col">
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9 bg-background"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        <div className="space-y-0.5 px-2">
          {workspace?.files.map((file) => renderFile(file))}
        </div>
      </div>

      <div className="p-2 border-t border-border">
        <Button variant="outline" size="sm" className="w-full justify-start gap-2">
          <Plus className="h-4 w-4" />
          New File
        </Button>
      </div>
    </aside>
  );
}
