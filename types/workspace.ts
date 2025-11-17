export interface WorkspaceFile {
  id: string;
  name: string;
  type: 'notebook' | 'folder';
  extension?: '.sqlnb' | '.md';
  parentId?: string;
  notebookId?: string;
  createdAt: Date;
  updatedAt: Date;
  children?: WorkspaceFile[];
}

export interface Workspace {
  id: string;
  name: string;
  files: WorkspaceFile[];
}
