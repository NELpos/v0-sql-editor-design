'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Download, FileJson, FileCode } from 'lucide-react';
import { downloadNotebookJSON, downloadNotebookYAML } from '@/lib/notebook-export';
import type { Notebook, NotebookResults } from '@/types/notebook';

interface ExportMenuProps {
  notebook: Notebook;
  results: Record<string, NotebookResults>;
}

export function ExportMenu({ notebook, results }: ExportMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Export Format</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => downloadNotebookJSON(notebook, results)}>
          <FileJson className="h-4 w-4 mr-2" />
          JSON (with metadata)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => downloadNotebookYAML(notebook, results)}>
          <FileCode className="h-4 w-4 mr-2" />
          YAML (with metadata)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
