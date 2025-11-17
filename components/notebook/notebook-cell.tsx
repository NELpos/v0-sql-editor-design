'use client';

import { useNotebook } from '@/contexts/notebook-context';
import { MarkdownCell } from '@/components/notebook/markdown-cell';
import { SqlCell } from '@/components/notebook/sql-cell';
import { ImageCell } from '@/components/notebook/image-cell';
import { FileCell } from '@/components/notebook/file-cell';
import type { NotebookCell as NotebookCellType } from '@/types/notebook';

interface NotebookCellProps {
  cell: NotebookCellType;
}

export function NotebookCell({ cell }: NotebookCellProps) {
  const { mode } = useNotebook();

  if (cell.type === 'markdown') {
    return <MarkdownCell cell={cell} mode={mode} />;
  }

  if (cell.type === 'sql') {
    return <SqlCell cell={cell} mode={mode} />;
  }

  if (cell.type === 'image') {
    return <ImageCell cell={cell} mode={mode} />;
  }

  if (cell.type === 'file') {
    return <FileCell cell={cell} mode={mode} />;
  }

  return null;
}
