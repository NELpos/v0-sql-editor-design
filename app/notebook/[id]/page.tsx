'use client';

import { useEffect } from 'react';
import { NotebookProvider, useNotebook } from '@/contexts/notebook-context';
import { NotebookHeader } from '@/components/notebook/notebook-header';
import { NotebookContent } from '@/components/notebook/notebook-content';
import type { Notebook } from '@/types/notebook';

function NotebookPageContent() {
  const { setNotebook } = useNotebook();

  useEffect(() => {
    // Initialize with sample notebook
    const initialNotebook: Notebook = {
      id: 'sample-notebook',
      title: 'SQL Analysis Notebook',
      cells: [
        {
          id: 'cell-1',
          type: 'markdown',
          content: '# Weekly User Analysis\n\nThis notebook analyzes user activity patterns over the past week.',
          order: 0,
        },
        {
          id: 'cell-2',
          type: 'sql',
          content: 'SELECT \n  DATE(created_at) as date,\n  COUNT(*) as new_users\nFROM users\nWHERE created_at >= NOW() - INTERVAL \'7 days\'\nGROUP BY DATE(created_at)\nORDER BY date;',
          order: 1,
        },
        {
          id: 'cell-3',
          type: 'markdown',
          content: '## Key Findings\n\nThe data shows consistent growth in new user signups throughout the week.',
          order: 2,
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setNotebook(initialNotebook);
  }, [setNotebook]);

  return (
    <div className="flex h-screen flex-col bg-background">
      <NotebookHeader />
      <NotebookContent />
    </div>
  );
}

export default function NotebookPage() {
  return (
    <NotebookProvider>
      <NotebookPageContent />
    </NotebookProvider>
  );
}
