import type { NotebookDocument, Block } from '@/types/notebook';

/**
 * Validate notebook document structure
 */
export function validateNotebookDocument(data: any): data is NotebookDocument {
  if (!data || typeof data !== 'object') return false;
  
  // Check required top-level fields
  if (!data.schema || typeof data.schema !== 'object') return false;
  if (!data.schema.version || !data.schema.format) return false;
  if (!data.id || !data.title) return false;
  if (!Array.isArray(data.blocks)) return false;
  if (!data.metadata || typeof data.metadata !== 'object') return false;
  
  // Validate blocks
  for (const block of data.blocks) {
    if (!validateBlock(block)) return false;
  }
  
  return true;
}

/**
 * Validate block structure
 */
function validateBlock(block: any): block is Block {
  if (!block || typeof block !== 'object') return false;
  
  // Required fields
  if (!block.id || typeof block.id !== 'string') return false;
  if (!block.type || typeof block.type !== 'string') return false;
  if (typeof block.order !== 'number') return false;
  if (typeof block.depth !== 'number') return false;
  
  // Content
  if (!block.content || typeof block.content !== 'object') return false;
  if (typeof block.content.raw !== 'string') return false;
  
  // Metadata
  if (!block.metadata || typeof block.metadata !== 'object') return false;
  if (!block.metadata.created || !block.metadata.updated) return false;
  
  // State
  if (!block.state || typeof block.state !== 'object') return false;
  if (typeof block.state.editing !== 'boolean') return false;
  if (typeof block.state.valid !== 'boolean') return false;
  
  return true;
}

/**
 * Generate example notebook document for LLM training
 */
export function generateExampleNotebookDocument(): NotebookDocument {
  const now = new Date().toISOString();
  
  return {
    schema: {
      version: '1.0.0',
      format: 'notebook-v1',
    },
    
    id: 'example-notebook-001',
    title: 'Weekly User Analysis',
    description: 'Analyzing user activity and growth trends for the past week',
    
    blocks: [
      {
        id: 'block-1',
        type: 'markdown',
        order: 0,
        depth: 0,
        
        content: {
          raw: '# Weekly User Analysis\n\nThis notebook analyzes user activity and growth trends.',
          representations: {
            html: '<h1>Weekly User Analysis</h1><p>This notebook analyzes user activity and growth trends.</p>',
          },
        },
        
        metadata: {
          labels: ['heading', 'documentation'],
          intent: 'introduce_analysis',
          description: 'Introduction to the weekly analysis',
          category: 'documentation',
          priority: 5,
          created: now,
          updated: now,
        },
        
        state: {
          editing: false,
          focused: false,
          selected: false,
          collapsed: false,
          hidden: false,
          valid: true,
          loading: false,
        },
      },
      {
        id: 'block-2',
        type: 'sql',
        order: 1,
        depth: 0,
        
        content: {
          raw: 'SELECT DATE(created_at) as date, COUNT(*) as new_users\nFROM users\nWHERE created_at >= NOW() - INTERVAL \'7 days\'\nGROUP BY DATE(created_at)\nORDER BY date;',
        },
        
        metadata: {
          labels: ['query', 'aggregation', 'time-series'],
          intent: 'analyze_user_growth',
          description: 'Get daily new user counts for the past week',
          category: 'analysis',
          priority: 4,
          
          execution: {
            executed: true,
            executedAt: now,
            executionTimeMs: 245,
            resultCount: 7,
            status: 'success',
          },
          
          created: now,
          updated: now,
        },
        
        state: {
          editing: false,
          focused: false,
          selected: false,
          collapsed: false,
          hidden: false,
          valid: true,
          loading: false,
        },
        
        dependencies: [],
      },
      {
        id: 'block-3',
        type: 'markdown',
        order: 2,
        depth: 0,
        
        content: {
          raw: '## Key Findings\n\n- User growth increased by 15% this week\n- Peak signup day was Thursday',
          representations: {
            html: '<h2>Key Findings</h2><ul><li>User growth increased by 15% this week</li><li>Peak signup day was Thursday</li></ul>',
          },
        },
        
        metadata: {
          labels: ['summary', 'insights'],
          intent: 'summarize_findings',
          description: 'Summary of analysis results',
          category: 'documentation',
          priority: 4,
          created: now,
          updated: now,
        },
        
        state: {
          editing: false,
          focused: false,
          selected: false,
          collapsed: false,
          hidden: false,
          valid: true,
          loading: false,
        },
        
        references: ['block-2'],
      },
    ],
    
    metadata: {
      created: now,
      updated: now,
      author: 'analyst@company.com',
      tags: ['weekly-report', 'user-analysis', 'growth'],
      language: 'en',
      environment: 'production',
    },
    
    context: {
      database: {
        connectionId: 'prod-db-001',
        schema: 'public',
        tables: [
          {
            name: 'users',
            schema: 'public',
            columns: [
              { name: 'id', type: 'uuid', nullable: false },
              { name: 'email', type: 'varchar', nullable: false },
              { name: 'created_at', type: 'timestamp', nullable: false },
            ],
          },
        ],
      },
      variables: {
        report_date: '2025-01-14',
      },
    },
    
    relationships: [
      {
        id: 'rel-1',
        type: 'references',
        sourceId: 'block-3',
        targetId: 'block-2',
        metadata: {
          description: 'Summary references query results',
          strength: 0.9,
        },
      },
    ],
  };
}
