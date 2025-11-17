"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Template {
  id: string
  name: string
  query: string
}

interface TemplateManagerProps {
  templates: Template[]
  onInsertTemplate: (query: string) => void
  onSaveTemplate: (template: Omit<Template, "id">) => void
  onDeleteTemplate: (id: string) => void
}

export function TemplateManager({
  templates,
  onInsertTemplate,
  onSaveTemplate,
  onDeleteTemplate,
}: TemplateManagerProps) {
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [newName, setNewName] = useState("")
  const [newQuery, setNewQuery] = useState("")

  const handleSave = () => {
    if (newName && newQuery) {
      onSaveTemplate({ name: newName, query: newQuery })
      setNewName("")
      setNewQuery("")
      setShowNewDialog(false)
    }
  }

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Saved Templates</h3>
          <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setShowNewDialog(true)}>
            + New
          </Button>
        </div>
        <div className="space-y-1">
          {templates.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">No templates saved yet</p>
          ) : (
            templates.map((template) => (
              <div key={template.id} className="flex items-center justify-between group">
                <Button
                  variant="ghost"
                  className="flex-1 justify-start h-8 text-xs"
                  onClick={() => onInsertTemplate(template.query)}
                >
                  {template.name}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                  onClick={() => onDeleteTemplate(template.id)}
                >
                  ×
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Query Template</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="templateName">Template Name</Label>
              <Input
                id="templateName"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g., Daily Logs Report"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="templateQuery">SQL Query</Label>
              <Textarea
                id="templateQuery"
                value={newQuery}
                onChange={(e) => setNewQuery(e.target.value)}
                placeholder="Enter your SQL query..."
                rows={8}
                className="font-mono text-sm"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
