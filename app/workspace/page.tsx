'use client';

import { useState } from 'react';
import { WorkspaceProvider } from '@/contexts/workspace-context';
import { FileExplorer } from '@/components/workspace/file-explorer';
import { WorkspaceEditor } from '@/components/workspace/workspace-editor';
import { WorkspaceHeader } from '@/components/workspace/workspace-header';

export default function WorkspacePage() {
  return (
    <WorkspaceProvider>
      <div className="flex h-screen flex-col bg-background">
        <WorkspaceHeader />
        <div className="flex-1 flex overflow-hidden">
          <FileExplorer />
          <WorkspaceEditor />
        </div>
      </div>
    </WorkspaceProvider>
  );
}
