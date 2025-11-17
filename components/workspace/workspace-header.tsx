'use client';

import { useWorkspace } from '@/contexts/workspace-context';
import { Button } from '@/components/ui/button';
import { LayoutGrid, Settings } from 'lucide-react';

export function WorkspaceHeader() {
  const { workspace } = useWorkspace();

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <LayoutGrid className="h-5 w-5 text-primary" />
        <h1 className="text-lg font-semibold">{workspace?.name || 'Workspace'}</h1>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
