import type { 
  Notebook, 
  NotebookCell, 
  NotebookDocument, 
  Block, 
  BlockContent,
  BlockMetadata,
  BlockState,
  NotebookResults 
} from '@/types/notebook';

/**
 * Convert legacy notebook structure to enhanced NotebookDocument format
 */
export function convertToNotebookDocument(
  notebook: Notebook,
  results?: Record<string, NotebookResults>
): NotebookDocument {
  const now = new Date().toISOString();
  
  const blocks: Block[] = notebook.cells.map((cell) => {
    const result = results?.[cell.id];
    
    return {
      id: cell.id,
      type: cell.type,
      order: cell.order,
      depth: 0,
      
      content: {
        raw: cell.content,
        representations: cell.type === 'markdown' ? {
          text: cell.content,
        } : undefined,
      },
      
      metadata: {
        labels: [cell.type],
        category: cell.metadata?.executed ? 'executed' : 'draft',
        
        execution: cell.type === 'sql' ? {
          executed: cell.metadata?.executed || false,
          executionTimeMs: cell.metadata?.executionTime,
          resultCount: cell.metadata?.resultCount,
          status: result?.error ? 'error' : (cell.metadata?.executed ? 'success' : 'idle'),
          errorMessage: result?.error,
        } : undefined,
        
        created: notebook.createdAt.toISOString(),
        updated: notebook.updatedAt.toISOString(),
      },
      
      state: {
        editing: false,
        focused: false,
        selected: false,
        collapsed: false,
        hidden: false,
        valid: !result?.error,
        errors: result?.error ? [{
          message: result.error,
          severity: 'error' as const,
        }] : undefined,
        loading: false,
      },
    };
  });
  
  return {
    schema: {
      version: '1.0.0',
      format: 'notebook-v1',
    },
    
    id: notebook.id,
    title: notebook.title,
    
    blocks,
    
    metadata: {
      created: notebook.createdAt.toISOString(),
      updated: notebook.updatedAt.toISOString(),
      language: 'ko',
      environment: 'development',
    },
  };
}

/**
 * Export notebook as JSON string
 */
export function exportAsJSON(
  notebook: Notebook,
  results?: Record<string, NotebookResults>,
  pretty: boolean = true
): string {
  const document = convertToNotebookDocument(notebook, results);
  return JSON.stringify(document, null, pretty ? 2 : 0);
}

/**
 * Export notebook as YAML string
 */
export function exportAsYAML(
  notebook: Notebook,
  results?: Record<string, NotebookResults>
): string {
  const document = convertToNotebookDocument(notebook, results);
  return convertToYAML(document);
}

/**
 * Simple YAML converter (recursive)
 */
function convertToYAML(obj: any, indent: number = 0): string {
  const spaces = '  '.repeat(indent);
  let yaml = '';
  
  if (Array.isArray(obj)) {
    obj.forEach((item) => {
      yaml += `${spaces}- `;
      if (typeof item === 'object' && item !== null) {
        yaml += '\n' + convertToYAML(item, indent + 1);
      } else {
        yaml += `${formatYAMLValue(item)}\n`;
      }
    });
  } else if (typeof obj === 'object' && obj !== null) {
    Object.entries(obj).forEach(([key, value]) => {
      if (value === undefined) return;
      
      yaml += `${spaces}${key}:`;
      
      if (typeof value === 'object' && value !== null) {
        yaml += '\n' + convertToYAML(value, indent + 1);
      } else {
        yaml += ` ${formatYAMLValue(value)}\n`;
      }
    });
  }
  
  return yaml;
}

function formatYAMLValue(value: any): string {
  if (typeof value === 'string') {
    // Escape special characters and wrap in quotes if needed
    if (value.includes('\n') || value.includes(':') || value.includes('#')) {
      return `"${value.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`;
    }
    return value;
  }
  
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  
  if (value === null) {
    return 'null';
  }
  
  return String(value);
}

/**
 * Download file helper
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export and download notebook as JSON
 */
export function downloadNotebookJSON(
  notebook: Notebook,
  results?: Record<string, NotebookResults>
) {
  const json = exportAsJSON(notebook, results);
  const filename = `${notebook.title.replace(/\s+/g, '_')}_${notebook.id}.json`;
  downloadFile(json, filename, 'application/json');
}

/**
 * Export and download notebook as YAML
 */
export function downloadNotebookYAML(
  notebook: Notebook,
  results?: Record<string, NotebookResults>
) {
  const yaml = exportAsYAML(notebook, results);
  const filename = `${notebook.title.replace(/\s+/g, '_')}_${notebook.id}.yaml`;
  downloadFile(yaml, filename, 'application/x-yaml');
}

/**
 * Parse imported JSON back to Notebook
 */
export function importFromJSON(json: string): Notebook {
  const document: NotebookDocument = JSON.parse(json);
  
  return {
    id: document.id,
    title: document.title,
    createdAt: new Date(document.metadata.created),
    updatedAt: new Date(document.metadata.updated),
    cells: document.blocks.map((block) => ({
      id: block.id,
      type: (block.type === 'markdown' || block.type === 'sql') ? block.type : 'markdown',
      content: block.content.raw,
      order: block.order,
      metadata: block.metadata.execution ? {
        executed: block.metadata.execution.executed,
        executionTime: block.metadata.execution.executionTimeMs,
        resultCount: block.metadata.execution.resultCount,
      } : undefined,
    })),
  };
}
