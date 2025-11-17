'use client';

import { useNotebook } from '@/contexts/notebook-context';
import { useEffect, useRef, useState } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { yaml } from '@codemirror/lang-yaml';
import { oneDark } from '@codemirror/theme-one-dark';
import { exportAsYAML } from '@/lib/notebook-export';

export function YAMLEditor() {
  const { notebook, results, updateFromYAML } = useNotebook();
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [yamlContent, setYamlContent] = useState('');
  const isUserEditRef = useRef(false);

  useEffect(() => {
    if (notebook && !isUserEditRef.current) {
      const yaml = exportAsYAML(notebook, results);
      setYamlContent(yaml);
    }
    // Reset the flag after processing
    isUserEditRef.current = false;
  }, [notebook, results]);

  // Initialize CodeMirror
  useEffect(() => {
    if (!editorRef.current || viewRef.current) return;

    const state = EditorState.create({
      doc: yamlContent,
      extensions: [
        basicSetup,
        yaml(),
        oneDark,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const newContent = update.state.doc.toString();
            isUserEditRef.current = true;
            setYamlContent(newContent);
            
            // Debounce the update to avoid too many calls
            if (update.view.hasFocus) {
              updateFromYAML(newContent);
            }
          }
        }),
        EditorView.theme({
          '&': {
            height: '100%',
            fontSize: '14px',
          },
          '.cm-scroller': {
            overflow: 'auto',
            fontFamily: 'var(--font-mono)',
          },
          '.cm-content': {
            padding: '16px',
          },
        }),
      ],
    });

    viewRef.current = new EditorView({
      state,
      parent: editorRef.current,
    });

    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
    };
  }, [updateFromYAML]);

  useEffect(() => {
    if (viewRef.current && !isUserEditRef.current) {
      const currentContent = viewRef.current.state.doc.toString();
      if (yamlContent !== currentContent) {
        viewRef.current.dispatch({
          changes: {
            from: 0,
            to: viewRef.current.state.doc.length,
            insert: yamlContent,
          },
        });
      }
    }
  }, [yamlContent]);

  return (
    <div className="flex-1 overflow-hidden bg-[#282c34]">
      <div ref={editorRef} className="h-full" />
    </div>
  );
}
