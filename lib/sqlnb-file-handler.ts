import type { 
  Notebook, 
  NotebookDocument, 
  NotebookCell,
  NotebookResults 
} from '@/types/notebook';
import { convertToNotebookDocument, importFromJSON } from './notebook-export';
import yaml from 'js-yaml';
import type { StorageAdapter } from './sqlnb-storage';

/**
 * .sqlnb File Format Handler
 * 
 * The .sqlnb format stores notebooks in YAML with:
 * - Human-readable structure
 * - Rich metadata for LLM integration
 * - Version control friendly diffs
 * - Bidirectional sync between UI and YAML
 */

export interface SQLNBFile {
  format: '.sqlnb';
  version: string;
  content: string; // YAML string
  metadata: {
    lastModified: string;
    checksum?: string;
  };
}

export class SQLNBFileHandler {
  private storage: StorageAdapter;

  constructor(storage: StorageAdapter) {
    this.storage = storage;
  }

  async save(
    filePath: string,
    notebook: Notebook,
    results?: Record<string, NotebookResults>
  ): Promise<{ success: boolean; errors?: string[] }> {
    try {
      const yamlContent = notebookToSQLNB(notebook, results);
      const validation = validateSQLNB(yamlContent);

      if (!validation.valid) {
        return { success: false, errors: validation.errors };
      }

      await this.storage.save(filePath, yamlContent);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Failed to save file'],
      };
    }
  }

  async load(filePath: string): Promise<Notebook> {
    const yamlContent = await this.storage.load(filePath);
    
    if (!yamlContent) {
      throw new Error('File not found');
    }

    const validation = validateSQLNB(yamlContent);
    
    if (!validation.valid) {
      throw new Error(`Invalid file: ${validation.errors.join(', ')}`);
    }

    return sqlnbToNotebook(yamlContent);
  }

  async delete(filePath: string): Promise<void> {
    await this.storage.delete(filePath);
  }

  async list(): Promise<string[]> {
    return await this.storage.list();
  }

  validate(yamlContent: string): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    return validateSQLNB(yamlContent);
  }
}

export function notebookToSQLNB(
  notebook: Notebook,
  results?: Record<string, NotebookResults>
): string {
  const document = convertToNotebookDocument(notebook, results);
  return convertToYAML(document);
}

export function sqlnbToNotebook(yamlContent: string): Notebook {
  try {
    const document = parseYAMLToDocument(yamlContent);
    return documentToNotebook(document);
  } catch (error) {
    throw new Error(`Failed to parse .sqlnb file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function validateSQLNB(yamlContent: string): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const document = parseYAMLToDocument(yamlContent);

    // Required fields validation
    if (!document.id) errors.push('Missing required field: id');
    if (!document.title) errors.push('Missing required field: title');
    if (!document.blocks || !Array.isArray(document.blocks)) {
      errors.push('Missing or invalid blocks array');
    }
    if (!document.schema?.version) warnings.push('Missing schema version');
    if (!document.metadata) warnings.push('Missing metadata section');

    // Block validation
    if (document.blocks) {
      document.blocks.forEach((block, index) => {
        if (!block.id) errors.push(`Block ${index}: missing id`);
        if (!block.type) errors.push(`Block ${index}: missing type`);
        if (!block.content?.raw) errors.push(`Block ${index}: missing content.raw`);
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  } catch (error) {
    return {
      valid: false,
      errors: [`YAML parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`],
      warnings: [],
    };
  }
}

/**
 * Enhanced YAML converter with proper formatting using js-yaml
 */
function convertToYAML(document: NotebookDocument): string {
  const yamlData = {
    schema: document.schema,
    id: document.id,
    title: document.title,
    ...(document.description && { description: document.description }),
    metadata: document.metadata,
    blocks: document.blocks.map(block => ({
      id: block.id,
      type: block.type,
      order: block.order,
      depth: block.depth,
      content: {
        raw: block.content.raw,
      },
      metadata: {
        created: block.metadata.created,
        updated: block.metadata.updated,
        ...(block.metadata.labels && block.metadata.labels.length > 0 && {
          labels: block.metadata.labels,
        }),
        ...(block.metadata.execution && {
          execution: block.metadata.execution,
        }),
      },
      state: block.state,
    })),
  };

  const yamlString = yaml.dump(yamlData, {
    indent: 2,
    lineWidth: -1,
    noRefs: true,
    sortKeys: false,
  });

  return `# SQL Notebook (.sqlnb)
# Edit this file directly or use the visual editor

${yamlString}`;
}

/**
 * Parse YAML using js-yaml library
 */
function parseYAMLToDocument(yamlContent: string): NotebookDocument {
  try {
    const cleanContent = yamlContent.replace(/^#.*$/gm, '').trim();
    const parsed = yaml.load(cleanContent) as any;
    
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Invalid YAML structure');
    }

    return {
      schema: parsed.schema || { version: '1.0.0', format: 'notebook-v1' },
      id: parsed.id,
      title: parsed.title,
      description: parsed.description,
      blocks: parsed.blocks || [],
      metadata: parsed.metadata || {
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      },
    };
  } catch (error) {
    throw new Error(`YAML parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function documentToNotebook(document: NotebookDocument): Notebook {
  return {
    id: document.id,
    title: document.title,
    createdAt: new Date(document.metadata.created),
    updatedAt: new Date(document.metadata.updated),
    cells: document.blocks
      .filter(block => block.type === 'markdown' || block.type === 'sql')
      .map((block) => ({
        id: block.id,
        type: block.type as 'markdown' | 'sql',
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

/**
 * Generate checksum for file integrity
 */
async function generateChecksum(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Create file metadata for .sqlnb files
 */
async function createSQLNBMetadata(content: string): Promise<SQLNBFile['metadata']> {
  return {
    lastModified: new Date().toISOString(),
    checksum: await generateChecksum(content),
  };
}
