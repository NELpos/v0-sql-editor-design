# .sqlnb File Format Specification

Version: 1.0.0

## Overview

The `.sqlnb` file format is a YAML-based notebook format for SQL analysis and data exploration. It combines human-readable configuration with rich metadata to support both manual editing and AI-assisted workflows.

## Key Features

1. **Human-Readable**: YAML format is easy to read and edit manually
2. **LLM-Ready**: Rich metadata structure enables AI-powered content generation
3. **Version Control Friendly**: Clean diffs for Git and other VCS
4. **Dual Interface**: Edit via Visual UI or raw YAML, both sync automatically
5. **Validation**: Built-in schema validation ensures data integrity
6. **Extensible**: Support for custom metadata and future enhancements

## File Structure

\`\`\`yaml
# SQL Notebook (.sqlnb)
# Edit this file directly or use the visual editor

schema:
  version: "1.0.0"
  format: "notebook-v1"

id: "unique-notebook-id"
title: "My SQL Analysis"
description: "Optional description of the notebook"

metadata:
  created: "2025-01-14T12:00:00Z"
  updated: "2025-01-14T14:30:00Z"
  author: "user@example.com"
  tags:
    - "analysis"
    - "users"
  language: "en"
  environment: "production"

context:
  database:
    connectionId: "main-db"
    schema: "public"
    tables:
      - name: "users"
        columns:
          - name: "id"
            type: "integer"
          - name: "email"
            type: "varchar"

blocks:
  - id: "block-1"
    type: markdown
    order: 0
    depth: 0
    content:
      raw: |
        # User Analysis
        
        This notebook analyzes user activity patterns.
    metadata:
      created: "2025-01-14T12:00:00Z"
      updated: "2025-01-14T12:05:00Z"
      labels:
        - "documentation"
      intent: "introduce_analysis"
    state:
      editing: false
      collapsed: false
      valid: true
      loading: false

  - id: "block-2"
    type: sql
    order: 1
    depth: 0
    content:
      raw: |
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as new_users
        FROM users
        WHERE created_at >= NOW() - INTERVAL '7 days'
        GROUP BY DATE(created_at)
        ORDER BY date;
    metadata:
      created: "2025-01-14T12:10:00Z"
      updated: "2025-01-14T14:30:00Z"
      labels:
        - "sql"
        - "analysis"
      intent: "analyze_user_growth"
      description: "Weekly user growth analysis"
      execution:
        executed: true
        executedAt: "2025-01-14T14:30:00Z"
        executionTimeMs: 245
        resultCount: 7
        status: success
    state:
      editing: false
      collapsed: false
      valid: true
      loading: false
\`\`\`

## Block Types

### Supported Types

- `markdown`: Rich text documentation
- `sql`: Executable SQL queries
- `code`: Generic code blocks (future)
- `image`: Embedded images (future)
- `chart`: Data visualizations (future)

### Block Metadata

Each block contains rich metadata:

- **labels**: Semantic tags for categorization
- **intent**: Purpose of the block (for LLM understanding)
- **description**: Human-readable description
- **execution**: Query execution details (for SQL blocks)
- **generation**: AI generation metadata (if applicable)

## UI/UX Benefits

### Visual Mode
- Cell-based interface like Jupyter
- Drag-and-drop reordering
- Run buttons for SQL execution
- Real-time results display
- Markdown rendering with slash commands

### YAML Mode
- Direct file editing
- Syntax highlighting
- Real-time validation
- Error highlighting
- Auto-save on changes

### Synchronization
- Changes in Visual mode → Update YAML
- Changes in YAML mode → Update Visual UI
- Validation on every change
- Conflict resolution for concurrent edits

## Version Control Integration

### Git-Friendly Format

YAML diffs are clean and readable:

\`\`\`diff
- content:
-   raw: "SELECT * FROM users LIMIT 10;"
+ content:
+   raw: "SELECT * FROM users WHERE active = true LIMIT 10;"

  metadata:
-   updated: "2025-01-14T12:00:00Z"
+   updated: "2025-01-14T14:30:00Z"
