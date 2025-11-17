"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { TimeHelperDialog } from "@/components/time-helper-dialog"
import { TimezoneHelperDialog } from "@/components/timezone-helper-dialog"
import { TimeSeriesHelperDialog } from "@/components/time-series-helper-dialog"
import { DateRangeHelperDialog } from "@/components/date-range-helper-dialog"
import { JoinHelperDialog } from "@/components/join-helper-dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Clock, Globe, TrendingUp, Search, Database, Calendar, Link2, Filter, BarChart2 } from "lucide-react"

interface MobileHelperDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInsert: (sql: string) => void
}

export function MobileHelperDrawer({ open, onOpenChange, onInsert }: MobileHelperDrawerProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeDialog, setActiveDialog] = useState<string | null>(null)

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

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[70vh]">
          <SheetHeader>
            <SheetTitle>Query Helpers</SheetTitle>
          </SheetHeader>

          <div className="mt-4 mb-4">
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

          <ScrollArea className="h-[calc(70vh-120px)]">
            <div className="space-y-6 pr-4">
              {filteredTimeOps.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    Time Operations
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {filteredTimeOps.map((operation) => (
                      <Button
                        key={operation.id}
                        variant="outline"
                        className="justify-start gap-2 h-auto py-3 bg-transparent"
                        onClick={() => {
                          setActiveDialog(operation.id)
                          onOpenChange(false)
                        }}
                      >
                        <operation.icon className="h-4 w-4" />
                        <span className="text-sm">{operation.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {filteredDataOps.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    Data Operations
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {filteredDataOps.map((operation) => (
                      <Button
                        key={operation.id}
                        variant="outline"
                        className="justify-start gap-2 h-auto py-3 bg-transparent"
                        onClick={() => {
                          setActiveDialog(operation.id)
                          onOpenChange(false)
                        }}
                      >
                        <operation.icon className="h-4 w-4" />
                        <span className="text-sm">{operation.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Schema Browser
                </h3>
                <Accordion type="single" collapsible className="w-full">
                  {sampleTables.map((table) => (
                    <AccordionItem key={table.name} value={table.name}>
                      <AccordionTrigger className="text-sm py-2">
                        <div className="flex items-center gap-2">
                          <Database className="h-4 w-4" />
                          {table.name}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-2 gap-1 pl-4">
                          {table.columns.map((column) => (
                            <button
                              key={column}
                              className="text-left text-xs py-2 px-2 rounded hover:bg-accent"
                              onClick={() => {
                                onInsert(column)
                                onOpenChange(false)
                              }}
                            >
                              {column}
                            </button>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

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
