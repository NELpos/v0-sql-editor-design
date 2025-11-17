'use client';

import { useEffect, useRef, useState } from 'react';
import { useNotebook } from '@/contexts/notebook-context';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState, StateField, StateEffect } from '@codemirror/state';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { Button } from '@/components/ui/button';
import { Trash2, GripVertical } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { NotebookCell, NotebookMode } from '@/types/notebook';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Decoration, 
  DecorationSet, 
  ViewPlugin, 
  ViewUpdate,
  WidgetType,
  keymap
} from '@codemirror/view';

const SLASH_COMMANDS = [
  {
    label: 'Table',
    description: 'Insert a markdown table',
    template: '| Column 1 | Column 2 | Column 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n| Cell 4   | Cell 5   | Cell 6   |',
    keywords: ['table', 'grid'],
  },
  {
    label: 'Heading 1',
    description: 'Large section heading',
    template: '# ',
    keywords: ['h1', 'heading', 'title'],
  },
  {
    label: 'Heading 2',
    description: 'Medium section heading',
    template: '## ',
    keywords: ['h2', 'heading', 'subtitle'],
  },
  {
    label: 'Heading 3',
    description: 'Small section heading',
    template: '### ',
    keywords: ['h3', 'heading'],
  },
  {
    label: 'Bullet List',
    description: 'Create a bullet list',
    template: '- Item 1\n- Item 2\n- Item 3',
    keywords: ['list', 'ul', 'bullet', 'unordered'],
  },
  {
    label: 'Numbered List',
    description: 'Create a numbered list',
    template: '1. Item 1\n2. Item 2\n3. Item 3',
    keywords: ['list', 'ol', 'numbered', 'ordered'],
  },
  {
    label: 'Code Block',
    description: 'Insert a code block',
    template: '\`\`\`\ncode here\n\`\`\`',
    keywords: ['code', 'snippet', 'pre'],
  },
  {
    label: 'Quote',
    description: 'Insert a blockquote',
    template: '> ',
    keywords: ['quote', 'blockquote', 'citation'],
  },
  {
    label: 'Divider',
    description: 'Horizontal line',
    template: '\n---\n',
    keywords: ['hr', 'line', 'separator', 'divider'],
  },
  {
    label: 'Link',
    description: 'Insert a link',
    template: '[link text](url)',
    keywords: ['link', 'url', 'anchor'],
  },
  {
    label: 'Image',
    description: 'Insert an image',
    template: '![alt text](image-url)',
    keywords: ['image', 'img', 'picture'],
  },
  {
    label: 'Task List',
    description: 'Create a checklist',
    template: '- [ ] Task 1\n- [ ] Task 2\n- [x] Completed task',
    keywords: ['todo', 'checkbox', 'task', 'checklist'],
  },
];

class SlashCommandWidget extends WidgetType {
  constructor(
    readonly commands: typeof SLASH_COMMANDS,
    readonly selectedIndex: number,
    readonly onSelect: (template: string) => void
  ) {
    super();
  }

  toDOM() {
    const wrap = document.createElement('div');
    wrap.className = 'slash-command-menu';
    wrap.style.cssText = `
      position: absolute;
      z-index: 9999;
      background: oklch(0.16 0 0);
      border: 1px solid oklch(0.30 0 0);
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
      padding: 4px;
      min-width: 280px;
      max-height: 320px;
      overflow-y: auto;
      margin-top: 4px;
    `;

    this.commands.forEach((cmd, index) => {
      const item = document.createElement('button');
      item.className = 'slash-command-item';
      item.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 2px;
        width: 100%;
        padding: 8px 12px;
        border: none;
        background: ${index === this.selectedIndex ? 'oklch(0.35 0.05 250)' : 'transparent'};
        color: oklch(0.95 0 0);
        cursor: pointer;
        border-radius: 4px;
        text-align: left;
        transition: background 0.15s;
      `;

      const label = document.createElement('div');
      label.style.cssText = 'font-size: 14px; font-weight: 500;';
      label.textContent = cmd.label;

      const desc = document.createElement('div');
      desc.style.cssText = 'font-size: 12px; color: oklch(0.60 0 0);';
      desc.textContent = cmd.description;

      item.appendChild(label);
      item.appendChild(desc);

      item.addEventListener('mouseenter', () => {
        item.style.background = 'oklch(0.35 0.05 250)';
      });

      item.addEventListener('mouseleave', () => {
        if (index !== this.selectedIndex) {
          item.style.background = 'transparent';
        }
      });

      item.addEventListener('click', (e) => {
        e.preventDefault();
        this.onSelect(cmd.template);
      });

      wrap.appendChild(item);
    });

    return wrap;
  }

  eq(other: SlashCommandWidget) {
    return other.selectedIndex === this.selectedIndex;
  }
}

const setSlashMenuEffect = StateEffect.define<{ pos: number; search: string } | null>();

const slashMenuState = StateField.define<{ pos: number; search: string } | null>({
  create: () => null,
  update(value, tr) {
    for (let effect of tr.effects) {
      if (effect.is(setSlashMenuEffect)) {
        return effect.value;
      }
    }
    if (tr.docChanged && value) {
      return null; // Hide menu on other changes
    }
    return value;
  },
});

function createSlashCommandPlugin(onInsert: (template: string) => void) {
  let selectedIndex = 0;
  let filteredCommands = SLASH_COMMANDS;

  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;

      constructor(view: EditorView) {
        this.decorations = this.buildDecorations(view);
      }

      update(update: ViewUpdate) {
        const menu = update.state.field(slashMenuState);
        
        if (menu && menu.search !== update.startState.field(slashMenuState)?.search) {
          // Filter commands based on search
          const search = menu.search.toLowerCase();
          filteredCommands = SLASH_COMMANDS.filter(
            cmd =>
              cmd.label.toLowerCase().includes(search) ||
              cmd.keywords.some(k => k.includes(search))
          );
          selectedIndex = 0;
        }
        
        this.decorations = this.buildDecorations(update.view);
      }

      buildDecorations(view: EditorView): DecorationSet {
        const menu = view.state.field(slashMenuState);
        if (!menu || filteredCommands.length === 0) return Decoration.none;

        const widget = Decoration.widget({
          widget: new SlashCommandWidget(
            filteredCommands,
            selectedIndex,
            (template) => onInsert(template)
          ),
          side: 1,
        });

        return Decoration.set([widget.range(menu.pos)]);
      }

      destroy() {}
    },
    {
      decorations: v => v.decorations,
    }
  );
}

function slashCommandKeymap(view: EditorView): boolean {
  const menu = view.state.field(slashMenuState, false);
  if (!menu) return false;

  return true;
}

interface MarkdownCellProps {
  cell: NotebookCell;
  mode: NotebookMode;
}

export function MarkdownCell({ cell, mode }: MarkdownCellProps) {
  const { updateCell, deleteCell } = useNotebook();
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: cell.id, disabled: mode === 'view' });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const insertTemplate = (view: EditorView, template: string) => {
    const menu = view.state.field(slashMenuState);
    if (!menu) return;

    const tr = view.state.update({
      changes: {
        from: menu.pos - 1, // Remove the "/" character
        to: view.state.doc.lineAt(menu.pos).to,
        insert: template,
      },
      effects: setSlashMenuEffect.of(null),
    });

    view.dispatch(tr);
    view.focus();
  };

  useEffect(() => {
    if (mode !== 'edit' || !editorRef.current) return;

    const state = EditorState.create({
      doc: cell.content,
      extensions: [
        basicSetup,
        markdown(),
        oneDark,
        slashMenuState,
        createSlashCommandPlugin((template) => {
          if (viewRef.current) {
            insertTemplate(viewRef.current, template);
          }
        }),
        keymap.of([
          {
            key: 'ArrowDown',
            run: (view) => {
              const menu = view.state.field(slashMenuState, false);
              if (!menu) return false;
              
              setSelectedCommandIndex(prev => 
                Math.min(prev + 1, SLASH_COMMANDS.length - 1)
              );
              return true;
            },
          },
          {
            key: 'ArrowUp',
            run: (view) => {
              const menu = view.state.field(slashMenuState, false);
              if (!menu) return false;
              
              setSelectedCommandIndex(prev => Math.max(prev - 1, 0));
              return true;
            },
          },
          {
            key: 'Enter',
            run: (view) => {
              const menu = view.state.field(slashMenuState, false);
              if (!menu) return false;
              
              const commands = SLASH_COMMANDS;
              if (commands[selectedCommandIndex]) {
                insertTemplate(view, commands[selectedCommandIndex].template);
              }
              return true;
            },
          },
          {
            key: 'Escape',
            run: (view) => {
              const menu = view.state.field(slashMenuState, false);
              if (!menu) return false;
              
              view.dispatch({
                effects: setSlashMenuEffect.of(null),
              });
              return true;
            },
          },
        ]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const content = update.state.doc.toString();
            updateCell(cell.id, content);

            // Check if "/" was just typed at start of line
            const changes = update.changes;
            changes.iterChanges((fromA, toA, fromB, toB, inserted) => {
              if (inserted.toString() === '/') {
                const line = update.state.doc.lineAt(fromB);
                const textBefore = line.text.slice(0, fromB - line.from);
                
                // Show menu only if "/" is at line start or after whitespace
                if (textBefore.trim() === '') {
                  update.view.dispatch({
                    effects: setSlashMenuEffect.of({
                      pos: fromB + 1,
                      search: '',
                    }),
                  });
                }
              }
            });
          }
        }),
        EditorView.theme({
          '&': {
            fontSize: '14px',
            backgroundColor: 'oklch(0.145 0 0)',
            minHeight: '140px',
          },
          '.cm-scroller': {
            fontFamily: 'var(--font-sans)',
            lineHeight: '1.6',
            minHeight: '140px',
          },
          '.cm-gutters': {
            backgroundColor: 'oklch(0.16 0 0)',
            color: 'oklch(0.50 0 0)',
            border: 'none',
          },
          '.cm-content': {
            padding: '12px 16px',
            caretColor: 'oklch(0.65 0.2 250)',
            minHeight: '116px',
          },
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [mode, cell.id, updateCell]);

  if (mode === 'view') {
    if (!cell.content) {
      return (
        <div className="rounded-lg border border-dashed border-border bg-muted/20 p-6">
          <p className="text-sm text-muted-foreground text-center">
            Empty markdown cell
          </p>
        </div>
      );
    }

    return (
      <div className="group relative rounded-lg border border-transparent hover:border-border/50 transition-colors">
        <div className="prose prose-invert prose-sm max-w-none px-6 py-4">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <h1 className="text-3xl font-bold mb-4 mt-6 text-foreground text-balance">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-2xl font-semibold mb-3 mt-5 text-foreground text-balance">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-xl font-semibold mb-2 mt-4 text-foreground text-balance">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="mb-4 text-foreground/90 leading-relaxed text-pretty">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside mb-4 space-y-2 text-foreground/90">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside mb-4 space-y-2 text-foreground/90">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="text-foreground/90">{children}</li>
              ),
              code: ({ inline, children }) =>
                inline ? (
                  <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-accent">
                    {children}
                  </code>
                ) : (
                  <code className="block bg-secondary p-4 rounded-lg text-sm font-mono text-foreground overflow-x-auto">
                    {children}
                  </code>
                ),
              pre: ({ children }) => (
                <pre className="mb-4 overflow-x-auto">{children}</pre>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground mb-4">
                  {children}
                </blockquote>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-foreground">{children}</strong>
              ),
              em: ({ children }) => (
                <em className="italic text-foreground/90">{children}</em>
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto mb-4">
                  <table className="min-w-full border-collapse border border-border">
                    {children}
                  </table>
                </div>
              ),
              thead: ({ children }) => (
                <thead className="bg-muted">{children}</thead>
              ),
              tbody: ({ children }) => <tbody>{children}</tbody>,
              tr: ({ children }) => (
                <tr className="border-b border-border">{children}</tr>
              ),
              th: ({ children }) => (
                <th className="border border-border px-4 py-2 text-left font-semibold">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="border border-border px-4 py-2">{children}</td>
              ),
            }}
          >
            {cell.content}
          </ReactMarkdown>
        </div>
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} className="group relative flex items-start gap-2">
      <div className="flex-shrink-0 pt-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 cursor-grab active:cursor-grabbing hover:bg-muted"
          title="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>

      <div className="flex-1 rounded-lg border border-border bg-card overflow-hidden hover:border-primary/50 transition-colors">
        <div className="flex items-start justify-between p-2 border-b border-border/50">
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
            Markdown
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => deleteCell(cell.id)}
            title="Delete cell"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div ref={editorRef} className="min-h-[140px]" />

        {!cell.content && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-sm text-muted-foreground">
              Type / for commands or start typing...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
