"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TimeHelperDialog } from "@/components/time-helper-dialog"
import { TimezoneHelperDialog } from "@/components/timezone-helper-dialog"
import { TimeSeriesHelperDialog } from "@/components/time-series-helper-dialog"
import { DateRangeHelperDialog } from "@/components/date-range-helper-dialog"
import { JoinHelperDialog } from "@/components/join-helper-dialog"
import { TemplateManager } from "@/components/template-manager"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Clock,
  Globe,
  TrendingUp,
  Search,
  Database,
  ChevronRight,
  Calendar,
  Link2,
  Filter,
  BarChart2,
} from "lucide-react"

interface HelperSidebarProps {
  onInsert: (sql: string) => void
}

export function HelperSidebar({ onInsert }: HelperSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeDialog, setActiveDialog] = useState<string | null>(null)
  const [templates, setTemplates] = useState([
    {
      id: "1",
      name: "Daily Log Report",
      query: "SELECT * FROM logs WHERE timestamp >= NOW() - INTERVAL '1 day'",
    },
    {
      id: "2",
      name: "User Activity Count",
      query: "SELECT user_id, COUNT(*) FROM events GROUP BY user_id",
    },
  ])

  const timeOperations = [
    { id: "last-hours", label: "Last N Hours", icon: Clock },
    { id: "timezone", label: "UTC to KST", icon: Globe },
    { id: "date-range", label: "Date Range", icon: Calendar },
    { id: "time-series", label: "Time Series Group", icon: TrendingUp },
  ]

  const dataOperations = [
    { id: "join", label: "Join Tables", icon: Link2 },
    { id: "aggregate", label: "Aggregate Data", icon: BarChart2 },
    { id: "filter", label: "Filter & Where", icon: Filter },
  ]

  const sampleTables = [
    {
      name: "logs",
      columns: ["id", "timestamp", "message", "level", "user_id"],
    },
    {
      name: "users",
      columns: ["id", "email", "created_at", "last_login"],
    },
    {
      name: "events",
      columns: ["id", "event_type", "timestamp", "data"],
    },
  ]

  const filteredTimeOps = timeOperations.filter((op) => op.label.toLowerCase().includes(searchQuery.toLowerCase()))
  const filteredDataOps = dataOperations.filter((op) => op.label.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleSaveTemplate = (template: { name: string; query: string }) => {
    setTemplates([...templates, { ...template, id: Date.now().toString() }])
  }

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter((t) => t.id !== id))
  }

  return (
    <>
      <div className="flex h-full flex-col bg-background">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search helpers..."
              className="pl-9"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {/* Time Operations */}
            {filteredTimeOps.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Time Operations
                </h3>
                <div className="space-y-1">
                  {filteredTimeOps.map((operation) => (
                    <Button
                      key={operation.id}
                      variant="ghost"
                      className="w-full justify-start gap-2 h-9"
                      onClick={() => setActiveDialog(operation.id)}
                    >
                      <operation.icon className="h-4 w-4" />
                      <span className="text-sm">{operation.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Data Operations */}
            {filteredDataOps.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Data Operations
                </h3>
                <div className="space-y-1">
                  {filteredDataOps.map((operation) => (
                    <Button
                      key={operation.id}
                      variant="ghost"
                      className="w-full justify-start gap-2 h-9"
                      onClick={() => setActiveDialog(operation.id)}
                    >
                      <operation.icon className="h-4 w-4" />
                      <span className="text-sm">{operation.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Schema Browser */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Schema Browser
              </h3>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="tables">
                  <AccordionTrigger className="text-sm py-2 hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Tables
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    {sampleTables.map((table) => (
                      <Accordion key={table.name} type="single" collapsible>
                        <AccordionItem value={table.name} className="border-none">
                          <AccordionTrigger className="text-sm py-2 pl-4 hover:no-underline">
                            <div className="flex items-center gap-2">
                              <ChevronRight className="h-3 w-3" />
                              {table.name}
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="pl-8 space-y-1">
                              {table.columns.map((column) => (
                                <button
                                  key={column}
                                  className="block w-full text-left text-xs py-1 px-2 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
                                  onClick={() => onInsert(column)}
                                >
                                  {column}
                                </button>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            <TemplateManager
              templates={templates}
              onInsertTemplate={onInsert}
              onSaveTemplate={handleSaveTemplate}
              onDeleteTemplate={handleDeleteTemplate}
            />
          </div>
        </ScrollArea>
      </div>

      {/* Helper Dialogs */}
      <TimeHelperDialog
        open={activeDialog === "last-hours"}
        onOpenChange={(open) => !open && setActiveDialog(null)}
        onInsert={onInsert}
      />
      <TimezoneHelperDialog
        open={activeDialog === "timezone"}
        onOpenChange={(open) => !open && setActiveDialog(null)}
        onInsert={onInsert}
      />
      <TimeSeriesHelperDialog
        open={activeDialog === "time-series"}
        onOpenChange={(open) => !open && setActiveDialog(null)}
        onInsert={onInsert}
      />
      <DateRangeHelperDialog
        open={activeDialog === "date-range"}
        onOpenChange={(open) => !open && setActiveDialog(null)}
        onInsert={onInsert}
      />
      <JoinHelperDialog
        open={activeDialog === "join"}
        onOpenChange={(open) => !open && setActiveDialog(null)}
        onInsert={onInsert}
      />
    </>
  )
}
