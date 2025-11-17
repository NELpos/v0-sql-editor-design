"use client"

import { useEffect, useRef } from "react"
import { EditorView, basicSetup } from "codemirror"
import { EditorState } from "@codemirror/state"
import { sql, PostgreSQL } from "@codemirror/lang-sql"
import { oneDark } from "@codemirror/theme-one-dark"

interface SqlEditorProps {
  value: string
  onChange: (value: string) => void
}

export function SqlEditor({ value, onChange }: SqlEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)

  useEffect(() => {
    if (!editorRef.current) return

    const state = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        sql({ dialect: PostgreSQL }),
        oneDark,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString())
          }
        }),
        EditorView.theme({
          "&": {
            height: "100%",
            fontSize: "14px",
          },
          ".cm-scroller": {
            fontFamily: "var(--font-mono)",
            lineHeight: "1.5",
          },
          ".cm-gutters": {
            backgroundColor: "oklch(0.20 0 0)",
            color: "oklch(0.50 0 0)",
            border: "none",
            borderRight: "1px solid oklch(0.25 0 0)",
          },
          ".cm-activeLineGutter": {
            backgroundColor: "oklch(0.25 0 0)",
          },
          ".cm-content": {
            padding: "16px 0",
            caretColor: "oklch(0.65 0.20 250)",
          },
          ".cm-line": {
            padding: "0 16px",
          },
        }),
      ],
    })

    const view = new EditorView({
      state,
      parent: editorRef.current,
    })

    viewRef.current = view

    return () => {
      view.destroy()
      viewRef.current = null
    }
  }, [])

  useEffect(() => {
    if (viewRef.current && value !== viewRef.current.state.doc.toString()) {
      const transaction = viewRef.current.state.update({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: value,
        },
      })
      viewRef.current.dispatch(transaction)
    }
  }, [value])

  return (
    <div className="relative h-full bg-secondary/20">
      <div ref={editorRef} className="h-full" />

      {/* Hint overlay when empty */}
      {!value && (
        <div className="absolute left-20 top-20 max-w-md pointer-events-none">
          <div className="rounded-lg bg-accent/50 p-4 text-sm text-muted-foreground backdrop-blur-sm">
            <p className="font-medium mb-2">Quick Tips:</p>
            <ul className="space-y-1 text-xs">
              <li>Use the helper sidebar for common query patterns</li>
              <li>Press Ctrl+Enter to run your query</li>
              <li>Hover over columns in the schema browser to see details</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
