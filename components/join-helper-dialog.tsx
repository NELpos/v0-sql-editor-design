"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface JoinHelperDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInsert: (sql: string) => void
}

export function JoinHelperDialog({ open, onOpenChange, onInsert }: JoinHelperDialogProps) {
  const [leftTable, setLeftTable] = useState("logs")
  const [rightTable, setRightTable] = useState("users")
  const [leftColumn, setLeftColumn] = useState("user_id")
  const [rightColumn, setRightColumn] = useState("id")
  const [joinType, setJoinType] = useState("INNER")

  const handleInsert = () => {
    const sql = `SELECT 
  ${leftTable}.*,
  ${rightTable}.email
FROM ${leftTable}
${joinType} JOIN ${rightTable}
  ON ${leftTable}.${leftColumn} = ${rightTable}.${rightColumn};`

    onInsert(sql)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join Tables</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="leftTable">Left Table</Label>
              <Select value={leftTable} onValueChange={setLeftTable}>
                <SelectTrigger id="leftTable">
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
              <Label htmlFor="rightTable">Right Table</Label>
              <Select value={rightTable} onValueChange={setRightTable}>
                <SelectTrigger id="rightTable">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="logs">logs</SelectItem>
                  <SelectItem value="events">events</SelectItem>
                  <SelectItem value="users">users</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="leftColumn">Left Column</Label>
              <Select value={leftColumn} onValueChange={setLeftColumn}>
                <SelectTrigger id="leftColumn">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="id">id</SelectItem>
                  <SelectItem value="user_id">user_id</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rightColumn">Right Column</Label>
              <Select value={rightColumn} onValueChange={setRightColumn}>
                <SelectTrigger id="rightColumn">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="id">id</SelectItem>
                  <SelectItem value="user_id">user_id</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Join Type</Label>
            <RadioGroup value={joinType} onValueChange={setJoinType}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="INNER" id="inner" />
                <Label htmlFor="inner" className="font-normal">
                  INNER JOIN
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="LEFT" id="left" />
                <Label htmlFor="left" className="font-normal">
                  LEFT JOIN
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="RIGHT" id="right" />
                <Label htmlFor="right" className="font-normal">
                  RIGHT JOIN
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Preview</Label>
            <pre className="rounded-md bg-secondary p-3 text-xs font-mono overflow-x-auto whitespace-pre">
              {`SELECT ${leftTable}.*, ${rightTable}.email\nFROM ${leftTable}\n${joinType} JOIN ${rightTable}\n  ON ${leftTable}.${leftColumn} = ${rightTable}.${rightColumn}`}
            </pre>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleInsert}>Generate Query</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
