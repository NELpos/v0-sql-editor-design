"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DateRangeHelperDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInsert: (sql: string) => void
}

export function DateRangeHelperDialog({ open, onOpenChange, onInsert }: DateRangeHelperDialogProps) {
  const [timeColumn, setTimeColumn] = useState("timestamp")
  const [startDate, setStartDate] = useState("2025-01-01")
  const [endDate, setEndDate] = useState("2025-01-31")

  const handleInsert = () => {
    const sql = `WHERE ${timeColumn} >= '${startDate}' AND ${timeColumn} < '${endDate}'`
    onInsert(sql)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Filter by Date Range</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
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
            <Label htmlFor="startDate">Start Date</Label>
            <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Preview</Label>
            <pre className="rounded-md bg-secondary p-3 text-xs font-mono overflow-x-auto">
              {`WHERE ${timeColumn} >= '${startDate}'\n  AND ${timeColumn} < '${endDate}'`}
            </pre>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleInsert}>Insert WHERE Clause</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
