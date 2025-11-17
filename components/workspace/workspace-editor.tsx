'use client';

import { useWorkspace } from '@/contexts/workspace-context';
import { NotebookProvider, useNotebook } from '@/contexts/notebook-context';
import { NotebookHeader } from '@/components/notebook/notebook-header';
import { NotebookContent } from '@/components/notebook/notebook-content';
import { FileQuestion } from 'lucide-react';
import { useEffect } from 'react';

function NotebookEditorContent() {
  const { openNotebook } = useWorkspace();
  const { setNotebook } = useNotebook();

  useEffect(() => {
    if (openNotebook) {
      setNotebook(openNotebook);
    }
  }, [openNotebook, setNotebook]);

  return (
    <>
      <NotebookHeader />
      <NotebookContent />
    </>
  );
}

export function WorkspaceEditor() {
  const { selectedFile, openNotebook } = useWorkspace();

  if (!selectedFile || !openNotebook) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
        <FileQuestion className="h-16 w-16 mb-4 opacity-20" />
        <h3 className="text-lg font-medium mb-2">No file selected</h3>
        <p className="text-sm">Select a notebook from the file explorer to begin</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <NotebookProvider>
        <NotebookEditorContent />
      </NotebookProvider>
    </div>
  );
}
