"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface TimeSeriesHelperDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInsert: (sql: string) => void
}

export function TimeSeriesHelperDialog({ open, onOpenChange, onInsert }: TimeSeriesHelperDialogProps) {
  const [table, setTable] = useState("logs")
  const [timeColumn, setTimeColumn] = useState("timestamp")
  const [groupBy, setGroupBy] = useState("hour")
  const [aggregate, setAggregate] = useState("count")
  const [order, setOrder] = useState("asc")

  const handleInsert = () => {
    const aggregateMap: Record<string, string> = {
      count: "COUNT(*)",
      avg: "AVG(value)",
      sum: "SUM(value)",
      max: "MAX(value)",
      min: "MIN(value)",
    }

    const sql = `SELECT 
  DATE_TRUNC('${groupBy}', ${timeColumn}) as time_bucket,
  ${aggregateMap[aggregate]} as ${aggregate}
FROM ${table}
WHERE ${timeColumn} >= NOW() - INTERVAL '24 hours'
GROUP BY time_bucket
ORDER BY time_bucket ${order.toUpperCase()};`

    onInsert(sql)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Time-Series Aggregation</DialogTitle>
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
            <Label htmlFor="timeColumn">Time Column</Label>
            <Select value={timeColumn} onValueChange={setTimeColumn}>
              <SelectTrigger id="timeColumn">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="timestamp">timestamp</SelectItem>
                <SelectItem value="created_at">created_at</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Group By</Label>
            <RadioGroup value={groupBy} onValueChange={setGroupBy}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="hour" id="hour" />
                <Label htmlFor="hour" className="font-normal">
                  Hour
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="day" id="day" />
                <Label htmlFor="day" className="font-normal">
                  Day
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="week" id="week" />
                <Label htmlFor="week" className="font-normal">
                  Week
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="aggregate">Aggregate</Label>
            <Select value={aggregate} onValueChange={setAggregate}>
              <SelectTrigger id="aggregate">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="count">COUNT(*)</SelectItem>
                <SelectItem value="avg">AVG(column)</SelectItem>
                <SelectItem value="sum">SUM(column)</SelectItem>
                <SelectItem value="max">MAX(column)</SelectItem>
                <SelectItem value="min">MIN(column)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Order</Label>
            <RadioGroup value={order} onValueChange={setOrder}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="asc" id="asc" />
                <Label htmlFor="asc" className="font-normal">
                  Ascending
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="desc" id="desc" />
                <Label htmlFor="desc" className="font-normal">
                  Descending
                </Label>
              </div>
            </RadioGroup>
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
