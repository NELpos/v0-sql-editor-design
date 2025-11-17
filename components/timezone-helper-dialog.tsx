"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface TimezoneHelperDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInsert: (sql: string) => void
}

export function TimezoneHelperDialog({ open, onOpenChange, onInsert }: TimezoneHelperDialogProps) {
  const [timeColumn, setTimeColumn] = useState("timestamp")
  const [outputType, setOutputType] = useState("new-column")
  const [outputName, setOutputName] = useState("timestamp_kst")

  const handleInsert = () => {
    let sql = ""

    if (outputType === "new-column") {
      sql = `  ${timeColumn} AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Seoul' as ${outputName}`
    } else if (outputType === "where-clause") {
      sql = `WHERE ${timeColumn} AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Seoul' >= '2025-01-01'`
    } else {
      sql = `  ${timeColumn} AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Seoul'`
    }

    onInsert(sql)
    onOpenChange(false)
  }

  const getPreview = () => {
    if (outputType === "new-column") {
      return `SELECT\n  *,\n  ${timeColumn} AT TIME ZONE 'UTC'\n    AT TIME ZONE 'Asia/Seoul' as ${outputName}\nFROM logs`
    } else if (outputType === "where-clause") {
      return `WHERE ${timeColumn} AT TIME ZONE 'UTC'\n  AT TIME ZONE 'Asia/Seoul' >= '2025-01-01'`
    }
    return `  ${timeColumn} AT TIME ZONE 'UTC'\n    AT TIME ZONE 'Asia/Seoul'`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convert UTC Timestamp to KST</DialogTitle>
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

          <div className="space-y-3">
            <Label>Output</Label>
            <RadioGroup value={outputType} onValueChange={setOutputType}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="new-column" id="new-column" />
                <Label htmlFor="new-column" className="font-normal">
                  Add new column (aliased)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="where-clause" id="where-clause" />
                <Label htmlFor="where-clause" className="font-normal">
                  Replace in WHERE clause
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="select" id="select" />
                <Label htmlFor="select" className="font-normal">
                  Replace in SELECT
                </Label>
              </div>
            </RadioGroup>
          </div>

          {outputType === "new-column" && (
            <div className="space-y-2">
              <Label htmlFor="outputName">Output Name</Label>
              <Input
                id="outputName"
                value={outputName}
                onChange={(e) => setOutputName(e.target.value)}
                placeholder="timestamp_kst"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Preview</Label>
            <pre className="rounded-md bg-secondary p-3 text-xs font-mono overflow-x-auto whitespace-pre">
              {getPreview()}
            </pre>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleInsert}>Generate SQL</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
