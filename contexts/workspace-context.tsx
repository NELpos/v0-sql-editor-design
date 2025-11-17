'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import type { WorkspaceFile, Workspace } from '@/types/workspace';
import type { Notebook } from '@/types/notebook';
import { saveNotebookFile, loadNotebookFile, LocalStorageAdapter } from '@/lib/sqlnb-storage';

interface WorkspaceContextType {
  workspace: Workspace | null;
  selectedFile: WorkspaceFile | null;
  openNotebook: Notebook | null;
  selectFile: (file: WorkspaceFile) => void;
  createFile: (name: string, type: 'notebook' | 'folder', parentId?: string) => void;
  deleteFile: (fileId: string) => void;
  renameFile: (fileId: string, newName: string) => void;
  expandedFolders: Set<string>;
  toggleFolder: (folderId: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within WorkspaceProvider');
  }
  return context;
}

const sampleWorkspace: Workspace = {
  id: 'workspace-1',
  name: 'My SQL Workspace',
  files: [
    {
      id: 'folder-1',
      name: 'User Analysis',
      type: 'folder',
      createdAt: new Date(),
      updatedAt: new Date(),
      children: [
        {
          id: 'file-1',
          name: 'Weekly Analysis.sqlnb',
          type: 'notebook',
          extension: '.sqlnb',
          parentId: 'folder-1',
          notebookId: 'notebook-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'file-2',
          name: 'Monthly Trends.sqlnb',
          type: 'notebook',
          extension: '.sqlnb',
          parentId: 'folder-1',
          notebookId: 'notebook-2',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    },
    {
      id: 'folder-2',
      name: 'Revenue Reports',
      type: 'folder',
      createdAt: new Date(),
      updatedAt: new Date(),
      children: [
        {
          id: 'file-3',
          name: 'Q4 Analysis.sqlnb',
          type: 'notebook',
          extension: '.sqlnb',
          parentId: 'folder-2',
          notebookId: 'notebook-3',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    },
    {
      id: 'file-4',
      name: 'Getting Started.sqlnb',
      type: 'notebook',
      extension: '.sqlnb',
      notebookId: 'notebook-4',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
};

const sampleNotebooks: Record<string, Notebook> = {
  'notebook-1': {
    id: 'notebook-1',
    title: 'Weekly Analysis',
    cells: [
      {
        id: 'cell-1',
        type: 'markdown',
        content: '# Weekly User Analysis\n\nThis notebook analyzes user activity for the past week.',
        order: 0,
      },
      {
        id: 'cell-2',
        type: 'sql',
        content: 'SELECT DATE(created_at) as date, COUNT(*) as users\nFROM users\nWHERE created_at >= NOW() - INTERVAL \'7 days\'\nGROUP BY DATE(created_at)\nORDER BY date;',
        order: 1,
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  'notebook-2': {
    id: 'notebook-2',
    title: 'Monthly Trends',
    cells: [
      {
        id: 'cell-1',
        type: 'markdown',
        content: '# Monthly Trends Report\n\nAnalyzing user growth trends over the past month.',
        order: 0,
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  'notebook-3': {
    id: 'notebook-3',
    title: 'Q4 Analysis',
    cells: [
      {
        id: 'cell-1',
        type: 'markdown',
        content: '# Q4 Revenue Analysis\n\nQuarterly revenue breakdown and insights.',
        order: 0,
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  'notebook-4': {
    id: 'notebook-4',
    title: 'Getting Started',
    cells: [
      {
        id: 'cell-1',
        type: 'markdown',
        content: '# Getting Started with SQL Notebooks\n\nWelcome! Use this notebook to:\n- Write SQL queries\n- Document your analysis with Markdown\n- Execute queries and view results\n\n## Quick Actions\n\nIn Edit mode, type `/` to see available commands for inserting tables, headings, and more.',
        order: 0,
      },
      {
        id: 'cell-2',
        type: 'sql',
        content: '-- Try running a simple query\nSELECT \'Hello, SQL Notebooks!\' as message;',
        order: 1,
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

const storageAdapter = new LocalStorageAdapter();

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspace, setWorkspace] = useState<Workspace>(sampleWorkspace);
  const [selectedFile, setSelectedFile] = useState<WorkspaceFile | null>(null);
  const [openNotebook, setOpenNotebook] = useState<Notebook | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['folder-1']));
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    initializeWorkspace();
  }, []);

  const initializeWorkspace = useCallback(async () => {
    try {
      const existingFiles = await storageAdapter.list();
      console.log('[v0] Existing files in storage:', existingFiles);

      if (existingFiles.length === 0) {
        console.log('[v0] Initializing sample notebooks...');
        
        for (const [notebookId, notebook] of Object.entries(sampleNotebooks)) {
          const fileName = `${notebook.title}.sqlnb`;
          await saveNotebookFile(fileName, notebook, undefined, storageAdapter);
          console.log('[v0] Saved sample notebook:', fileName);
        }
      }

      setInitialized(true);
    } catch (error) {
      console.error('[v0] Failed to initialize workspace:', error);
      setInitialized(true);
    }
  }, []);

  const selectFile = useCallback(async (file: WorkspaceFile) => {
    if (file.type === 'folder') return;
    
    setSelectedFile(file);
    
    try {
      const fileName = file.name;
      console.log('[v0] Loading file:', fileName);
      
      const result = await loadNotebookFile(fileName, storageAdapter);
      
      if (result.success && result.notebook) {
        console.log('[v0] Successfully loaded notebook:', result.notebook.title);
        setOpenNotebook(result.notebook);
      } else {
        console.log('[v0] File not found in storage, using fallback');
        const fallbackNotebook = sampleNotebooks[file.notebookId || ''] || {
          id: file.notebookId || file.id,
          title: file.name.replace('.sqlnb', ''),
          cells: [
            {
              id: 'cell-1',
              type: 'markdown',
              content: `# ${file.name.replace('.sqlnb', '')}\n\nStart writing your analysis here...`,
              order: 0,
            },
          ],
          createdAt: file.createdAt,
          updatedAt: file.updatedAt,
        };
        
        setOpenNotebook(fallbackNotebook);
        
        await saveNotebookFile(fileName, fallbackNotebook, undefined, storageAdapter);
      }
    } catch (error) {
      console.error('[v0] Failed to load notebook:', error);
    }
  }, []);

  const createFile = useCallback(async (name: string, type: 'notebook' | 'folder', parentId?: string) => {
    if (type === 'folder') {
      const newFolder: WorkspaceFile = {
        id: `folder-${Date.now()}`,
        name,
        type: 'folder',
        parentId,
        createdAt: new Date(),
        updatedAt: new Date(),
        children: [],
      };
      
      setWorkspace(prev => ({
        ...prev,
        files: [...prev.files, newFolder],
      }));
      
      return;
    }
    
    const notebookId = `notebook-${Date.now()}`;
    const fileName = name.endsWith('.sqlnb') ? name : `${name}.sqlnb`;
    
    const newNotebook: Notebook = {
      id: notebookId,
      title: name.replace('.sqlnb', ''),
      cells: [
        {
          id: 'cell-1',
          type: 'markdown',
          content: `# ${name.replace('.sqlnb', '')}\n\nStart writing your analysis here...`,
          order: 0,
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const newFile: WorkspaceFile = {
      id: `file-${Date.now()}`,
      name: fileName,
      type: 'notebook',
      extension: '.sqlnb',
      parentId,
      notebookId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    try {
      const result = await saveNotebookFile(fileName, newNotebook, undefined, storageAdapter);
      
      if (result.success) {
        console.log('[v0] Successfully created file:', fileName);
        
        setWorkspace(prev => ({
          ...prev,
          files: [...prev.files, newFile],
        }));
        
        setSelectedFile(newFile);
        setOpenNotebook(newNotebook);
      } else {
        console.error('[v0] Failed to save file:', result.errors);
      }
    } catch (error) {
      console.error('[v0] Failed to create file:', error);
    }
  }, []);

  const deleteFile = useCallback(async (fileId: string) => {
    const file = findFileById(workspace.files, fileId);
    if (!file) return;
    
    try {
      if (file.type === 'notebook') {
        await storageAdapter.delete(getFilePath(file));
      }
      
      setWorkspace(prev => ({
        ...prev,
        files: removeFileById(prev.files, fileId),
      }));
      
      if (selectedFile?.id === fileId) {
        setSelectedFile(null);
        setOpenNotebook(null);
      }
    } catch (error) {
      console.error('[v0] Failed to delete file:', error);
    }
  }, [workspace, selectedFile]);

  const renameFile = useCallback((fileId: string, newName: string) => {
    setWorkspace(prev => ({
      ...prev,
      files: updateFileName(prev.files, fileId, newName),
    }));
  }, []);

  const toggleFolder = useCallback((folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  }, []);

  return (
    <WorkspaceContext.Provider
      value={{
        workspace,
        selectedFile,
        openNotebook,
        selectFile,
        createFile,
        deleteFile,
        renameFile,
        expandedFolders,
        toggleFolder,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

function getFilePath(file: WorkspaceFile): string {
  return file.parentId 
    ? `${file.parentId}/${file.name}`
    : file.name;
}

function findFileById(files: WorkspaceFile[], id: string): WorkspaceFile | null {
  for (const file of files) {
    if (file.id === id) return file;
    if (file.children) {
      const found = findFileById(file.children, id);
      if (found) return found;
    }
  }
  return null;
}

function removeFileById(files: WorkspaceFile[], id: string): WorkspaceFile[] {
  return files
    .filter(f => f.id !== id)
    .map(f => ({
      ...f,
      children: f.children ? removeFileById(f.children, id) : undefined,
    }));
}

function updateFileName(files: WorkspaceFile[], id: string, newName: string): WorkspaceFile[] {
  return files.map(f => {
    if (f.id === id) {
      return { ...f, name: newName, updatedAt: new Date() };
    }
    if (f.children) {
      return { ...f, children: updateFileName(f.children, id, newName) };
    }
    return f;
  });
}
