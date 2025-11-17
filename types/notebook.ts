export type CellType = 'markdown' | 'sql' | 'image' | 'file';
export type NotebookMode = 'edit' | 'view';
export type EditMode = 'visual' | 'yaml';

// Enhanced block types
export type BlockType = 
  | 'markdown'
  | 'sql' 
  | 'code'
  | 'image'
  | 'chart'
  | 'table'
  | 'heading'
  | 'divider'
  | 'comment';

export type BlockRelationType = 
  | 'depends_on' 
  | 'references' 
  | 'derived_from' 
  | 'transformed_to';

export type ExecutionStatus = 'success' | 'error' | 'pending' | 'idle';

// ISO 8601 timestamp string
export type ISO8601String = string;

// Block content structure
export interface BlockContent {
  raw: string;
  parsed?: any;
  representations?: {
    html?: string;
    text?: string;
    ast?: any;
  };
  attachments?: Attachment[];
}

// Rich metadata for LLM understanding
export interface BlockMetadata {
  labels?: string[];
  intent?: string;
  description?: string;
  category?: string;
  priority?: number;
  
  execution?: {
    executed: boolean;
    executedAt?: ISO8601String;
    executionTimeMs?: number;
    resultCount?: number;
    status?: ExecutionStatus;
    errorMessage?: string;
  };
  
  generation?: {
    model?: string;
    prompt?: string;
    temperature?: number;
    generatedAt?: ISO8601String;
    edited?: boolean;
  };
  
  tags?: Record<string, any>;
  created: ISO8601String;
  updated: ISO8601String;
}

// Block state tracking
export interface BlockState {
  editing: boolean;
  focused: boolean;
  selected: boolean;
  collapsed: boolean;
  hidden: boolean;
  valid: boolean;
  errors?: ValidationError[];
  warnings?: string[];
  loading: boolean;
  loadingMessage?: string;
}

// Validation error
export interface ValidationError {
  field?: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

// Enhanced block with full metadata
export interface Block {
  id: string;
  type: BlockType;
  order: number;
  parentId?: string;
  depth: number;
  content: BlockContent;
  metadata: BlockMetadata;
  state: BlockState;
  dependencies?: string[];
  references?: string[];
}

// Block relationships
export interface BlockRelationship {
  id: string;
  type: BlockRelationType;
  sourceId: string;
  targetId: string;
  metadata?: {
    description?: string;
    strength?: number;
  };
}

// Image display size configuration
export interface ImageDisplayConfig {
  width?: string | number; // CSS width value or pixel number
  height?: string | number; // CSS height value or pixel number
  aspectRatio?: '16:9' | '4:3' | '1:1' | '3:2' | 'original';
  alignment?: 'left' | 'center' | 'right';
}

// Attachment
export interface Attachment {
  id: string;
  type: 'image' | 'file' | 'url';
  url: string;
  filename?: string;
  mimeType?: string;
  size?: number;
  displayConfig?: ImageDisplayConfig; // Added display configuration
  metadata?: Record<string, any>;
}

// Database context
export interface DatabaseContext {
  connectionId: string;
  schema?: string;
  tables?: TableMetadata[];
}

export interface TableMetadata {
  name: string;
  schema?: string;
  columns?: ColumnMetadata[];
}

export interface ColumnMetadata {
  name: string;
  type: string;
  nullable?: boolean;
  description?: string;
}

// Version history
export interface VersionHistory {
  version: number;
  timestamp: ISO8601String;
  author?: string;
  changes: Change[];
  checkpoint?: boolean;
}

export interface Change {
  type: 'add' | 'update' | 'delete' | 'reorder';
  blockId: string;
  before?: any;
  after?: any;
}

// Complete notebook document structure
export interface NotebookDocument {
  schema: {
    version: string;
    format: string;
  };
  
  id: string;
  title: string;
  description?: string;
  
  blocks: Block[];
  
  metadata: {
    created: ISO8601String;
    updated: ISO8601String;
    author?: string;
    tags?: string[];
    language?: string;
    environment?: string;
  };
  
  context?: {
    database?: DatabaseContext;
    variables?: Record<string, any>;
    dependencies?: string[];
  };
  
  relationships?: BlockRelationship[];
  history?: VersionHistory[];
}

// Legacy types for backward compatibility
export interface NotebookCell {
  id: string;
  type: CellType;
  content: string;
  order: number;
  metadata?: {
    executed?: boolean;
    executionTime?: number;
    resultCount?: number;
  };
}

export interface NotebookResults {
  cellId: string;
  data: any[];
  columns: string[];
  executedAt: Date;
  executionTimeMs: number;
  error?: string;
}

export interface Notebook {
  id: string;
  title: string;
  cells: NotebookCell[];
  createdAt: Date;
  updatedAt: Date;
}
