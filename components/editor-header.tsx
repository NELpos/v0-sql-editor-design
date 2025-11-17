"use client"

import { Button } from "@/components/ui/button"
import { Play, Save, History, Download, Settings } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface EditorHeaderProps {
  onExecute: () => void
  isExecuting: boolean
  onExport?: (format: "csv" | "json") => void
  hasResults?: boolean
}

export function EditorHeader({ onExecute, isExecuting, onExport, hasResults }: EditorHeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4">
      <div className="flex items-center gap-4">
        <Select defaultValue="database1">
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select database" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="database1">Production DB</SelectItem>
            <SelectItem value="database2">Staging DB</SelectItem>
            <SelectItem value="database3">Development DB</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-sm text-muted-foreground">Connected</span>
        </div>
      </div>

      <input
        type="text"
        placeholder="Query name..."
        className="flex-1 mx-8 bg-transparent text-center text-sm outline-none placeholder:text-muted-foreground"
        defaultValue="Untitled Query"
      />

      <div className="flex items-center gap-2">
        <Button onClick={onExecute} disabled={isExecuting} className="gap-2">
          <Play className="h-4 w-4" />
          {isExecuting ? "Running..." : "Run Query"}
        </Button>

        <Button variant="ghost" size="icon">
          <Save className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="icon">
          <History className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={!hasResults}>
              <Download className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onExport?.("csv")}>Export as CSV</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport?.("json")}>Export as JSON</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
