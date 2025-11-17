# Notebook Document Schema

## Overview

The notebook document schema is designed to be LLM-ready, with rich metadata and hierarchical structure that enables AI models to understand, generate, and transform notebook content.

## Schema Version

**Current Version**: 1.0.0  
**Format**: `notebook-v1`

## Core Principles

1. **Hierarchical & Extensible**: Supports nested blocks and custom block types
2. **Rich Metadata**: Captures editing states, relationships, and semantic labels
3. **LLM-Ready**: Includes context, intent, and transformation history
4. **Version Control**: Tracks changes and enables rollback
5. **Multi-format Export**: JSON and YAML with proper schema validation

## Structure

### Document Root

\`\`\`typescript
{
  schema: {
    version: "1.0.0",
    format: "notebook-v1"
  },
  id: string,
  title: string,
  description?: string,
  blocks: Block[],
  metadata: DocumentMetadata,
  context?: ExecutionContext,
  relationships?: BlockRelationship[],
  history?: VersionHistory[]
}
\`\`\`

### Block Types

Supported block types:
- `markdown`: Documentation and text
- `sql`: SQL queries
- `code`: General code blocks
- `image`: Image embeds
- `chart`: Visualizations
- `table`: Data tables
- `heading`: Section headers
- `divider`: Visual separators
- `comment`: Annotations

### Block Structure

Each block contains:

\`\`\`typescript
{
  id: string,
  type: BlockType,
  order: number,
  parentId?: string,
  depth: number,
  content: BlockContent,
  metadata: BlockMetadata,
  state: BlockState,
  dependencies?: string[],
  references?: string[]
}
\`\`\`

### Metadata Labels

Common labels for LLM understanding:
- **Intent labels**: `analyze`, `summarize`, `explore`, `report`, `transform`
- **Content labels**: `query`, `documentation`, `visualization`, `insight`
- **Quality labels**: `draft`, `reviewed`, `production`, `archived`

### Execution Metadata

For SQL and code blocks:
\`\`\`typescript
{
  executed: boolean,
  executedAt?: ISO8601String,
  executionTimeMs?: number,
  resultCount?: number,
  status?: "success" | "error" | "pending",
  errorMessage?: string
}
\`\`\`

### LLM Generation Metadata

Track AI-generated content:
\`\`\`typescript
{
  model?: string,           // "gpt-4", "claude-3"
  prompt?: string,          // Original prompt
  temperature?: number,
  generatedAt?: ISO8601String,
  edited?: boolean          // User modified after generation
}
\`\`\`

## Use Cases

### 1. LLM Training Data

Export notebooks as training data for SQL generation models:
\`\`\`json
{
  "intent": "analyze_user_growth",
  "description": "Get daily new user counts",
  "labels": ["time-series", "aggregation"],
  "query": "SELECT DATE(created_at)..."
}
\`\`\`

### 2. Content Transformation

AI models can transform blocks based on metadata:
- Convert SQL queries to different dialects
- Generate documentation from code
- Summarize analysis results

### 3. Automated Analysis

LLMs can understand notebook structure and:
- Suggest next analysis steps
- Identify missing visualizations
- Recommend query optimizations

### 4. Version Control

Track all changes with full history:
\`\`\`json
{
  "version": 1,
  "timestamp": "2025-01-14T12:00:00Z",
  "changes": [
    {
      "type": "update",
      "blockId": "block-2",
      "before": "SELECT * FROM users",
      "after": "SELECT id, email FROM users"
    }
  ]
}
\`\`\`

## Export Formats

### JSON Export
Structured, machine-readable format with full metadata retention.

### YAML Export
Human-readable format suitable for documentation and configuration.

## Validation

All imported notebooks are validated against the schema to ensure:
- Required fields are present
- Block structure is valid
- Relationships reference existing blocks
- Metadata follows type specifications
