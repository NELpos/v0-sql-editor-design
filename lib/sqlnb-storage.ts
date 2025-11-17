import type { Notebook, NotebookResults } from '@/types/notebook';
import type { WorkspaceFile } from '@/types/workspace';
import { notebookToSQLNB, sqlnbToNotebook, validateSQLNB } from './sqlnb-file-handler';

/**
 * Storage interface for .sqlnb files
 * Can be implemented with:
 * - Browser LocalStorage (current)
 * - IndexedDB (for larger files)
 * - Server-side file system
 * - Cloud storage (S3, etc.)
 */

const STORAGE_PREFIX = 'sqlnb_';
const WORKSPACE_KEY = 'sqlnb_workspace';

export interface StorageAdapter {
  save(fileId: string, content: string): Promise<void>;
  load(fileId: string): Promise<string | null>;
  delete(fileId: string): Promise<void>;
  list(): Promise<string[]>;
}

export class LocalStorageAdapter implements StorageAdapter {
  async save(fileId: string, content: string): Promise<void> {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${fileId}`, content);
    } catch (error) {
      throw new Error(`Failed to save file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async load(fileId: string): Promise<string | null> {
    return localStorage.getItem(`${STORAGE_PREFIX}${fileId}`);
  }

  async delete(fileId: string): Promise<void> {
    localStorage.removeItem(`${STORAGE_PREFIX}${fileId}`);
  }

  async list(): Promise<string[]> {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) {
        keys.push(key.replace(STORAGE_PREFIX, ''));
      }
    }
    return keys;
  }
}

// Default adapter
const defaultAdapter = new LocalStorageAdapter();

/**
 * Save notebook as .sqlnb file
 */
export async function saveNotebookFile(
  fileId: string,
  notebook: Notebook,
  results?: Record<string, NotebookResults>,
  adapter: StorageAdapter = defaultAdapter
): Promise<{ success: boolean; errors?: string[] }> {
  try {
    const yamlContent = notebookToSQLNB(notebook, results);
    const validation = validateSQLNB(yamlContent);

    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    await adapter.save(fileId, yamlContent);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Failed to save file'],
    };
  }
}

/**
 * Load notebook from .sqlnb file
 */
export async function loadNotebookFile(
  fileId: string,
  adapter: StorageAdapter = defaultAdapter
): Promise<{ success: boolean; notebook?: Notebook; errors?: string[]; warnings?: string[] }> {
  try {
    const yamlContent = await adapter.load(fileId);
    
    if (!yamlContent) {
      return {
        success: false,
        errors: ['File not found'],
      };
    }

    const validation = validateSQLNB(yamlContent);
    
    if (!validation.valid) {
      return {
        success: false,
        errors: validation.errors,
      };
    }

    const notebook = sqlnbToNotebook(yamlContent);
    
    return {
      success: true,
      notebook,
      warnings: validation.warnings,
    };
  } catch (error) {
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Failed to load file'],
    };
  }
}

/**
 * Delete .sqlnb file
 */
export async function deleteNotebookFile(
  fileId: string,
  adapter: StorageAdapter = defaultAdapter
): Promise<{ success: boolean; errors?: string[] }> {
  try {
    await adapter.delete(fileId);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Failed to delete file'],
    };
  }
}

/**
 * List all .sqlnb files
 */
export async function listNotebookFiles(
  adapter: StorageAdapter = defaultAdapter
): Promise<string[]> {
  return await adapter.list();
}

/**
 * Auto-save functionality
 */
export class AutoSaver {
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private delay: number;
  private adapter: StorageAdapter;

  constructor(delay: number = 2000, adapter: StorageAdapter = defaultAdapter) {
    this.delay = delay;
    this.adapter = adapter;
  }

  scheduleSave(
    fileId: string,
    notebook: Notebook,
    results?: Record<string, NotebookResults>
  ): void {
    // Clear existing timer
    const existingTimer = this.timers.get(fileId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Schedule new save
    const timer = setTimeout(async () => {
      await saveNotebookFile(fileId, notebook, results, this.adapter);
      this.timers.delete(fileId);
    }, this.delay);

    this.timers.set(fileId, timer);
  }

  cancelSave(fileId: string): void {
    const timer = this.timers.get(fileId);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(fileId);
    }
  }

  async forceSave(
    fileId: string,
    notebook: Notebook,
    results?: Record<string, NotebookResults>
  ): Promise<{ success: boolean; errors?: string[] }> {
    this.cancelSave(fileId);
    return await saveNotebookFile(fileId, notebook, results, this.adapter);
  }
}
