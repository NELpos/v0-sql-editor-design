"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TimeHelperDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInsert: (sql: string) => void
}

export function TimeHelperDialog({ open, onOpenChange, onInsert }: TimeHelperDialogProps) {
  const [table, setTable] = useState("logs")
  const [hours, setHours] = useState("3")
  const [timeColumn, setTimeColumn] = useState("timestamp")

  const handleInsert = () => {
    const sql = `SELECT * FROM ${table}\nWHERE ${timeColumn} >= NOW() - INTERVAL '${hours} hours'\nORDER BY ${timeColumn} DESC;`
    onInsert(sql)
    onOpenChange(false)
  }

  const preview = `WHERE ${timeColumn} >= NOW() - INTERVAL '${hours} hours'`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Get Logs from Last N Hours</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="table">Table</Label>
            <Select value={table} onValueChange={setTable}>
              <SelectTrigger id="table">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="logs">logs</SelectItem>
                <SelectItem value="events">events</SelectItem>
                <SelectItem value="users">users</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hours">Hours Back</Label>
            <Input id="hours" type="number" value={hours} onChange={(e) => setHours(e.target.value)} min="1" max="24" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeColumn">Time Column</Label>
            <Select value={timeColumn} onValueChange={setTimeColumn}>
              <SelectTrigger id="timeColumn">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="timestamp">timestamp</SelectItem>
                <SelectItem value="created_at">created_at</SelectItem>
                <SelectItem value="updated_at">updated_at</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Preview</Label>
            <pre className="rounded-md bg-secondary p-3 text-xs font-mono overflow-x-auto">{preview}</pre>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleInsert}>Insert Query</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
