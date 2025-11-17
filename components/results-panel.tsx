"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, TableIcon, BarChart3, FileJson, Zap } from "lucide-react"

interface ResultsPanelProps {
  results: any
  isExecuting: boolean
}

export function ResultsPanel({ results, isExecuting }: ResultsPanelProps) {
  if (isExecuting) {
    return (
      <div className="flex h-full items-center justify-center bg-secondary/10">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Executing query...</p>
        </div>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="flex h-full items-center justify-center bg-secondary/10">
        <div className="text-center max-w-md space-y-3">
          <div className="flex justify-center">
            <div className="rounded-full bg-secondary p-4">
              <TableIcon className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          <h3 className="font-medium">No results yet</h3>
          <p className="text-sm text-muted-foreground">
            Run a query to see results here. Use the helper sidebar to build queries quickly.
          </p>
          <p className="text-xs text-muted-foreground">Tip: Press Ctrl+Enter to execute your query</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-background">
      <Tabs defaultValue="table" className="h-full flex flex-col">
        <div className="border-b border-border px-4">
          <TabsList className="h-12">
            <TabsTrigger value="table" className="gap-2">
              <TableIcon className="h-4 w-4" />
              Table
            </TabsTrigger>
            <TabsTrigger value="visualize" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Visualize
            </TabsTrigger>
            <TabsTrigger value="json" className="gap-2">
              <FileJson className="h-4 w-4" />
              JSON
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-2">
              <Zap className="h-4 w-4" />
              Query Stats
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="table" className="flex-1 m-0 overflow-hidden">
          <ScrollArea className="h-full">
            <Table>
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  {results.columns?.map((column: string) => (
                    <TableHead key={column} className="font-semibold">
                      {column}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.rows?.map((row: any, i: number) => (
                  <TableRow key={i} className="hover:bg-muted/50">
                    {results.columns?.map((column: string) => (
                      <TableCell key={column} className="font-mono text-xs">
                        {row[column]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>

          <div className="border-t border-border px-4 py-2 text-xs text-muted-foreground bg-secondary/20">
            Showing {results.rowCount} rows
          </div>
        </TabsContent>

        <TabsContent value="visualize" className="flex-1 m-0 p-4">
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <div className="text-center space-y-2">
              <BarChart3 className="h-12 w-12 mx-auto opacity-50" />
              <p>Visualization coming soon</p>
              <p className="text-xs">Charts and graphs will appear here</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="json" className="flex-1 m-0 overflow-hidden">
          <ScrollArea className="h-full">
            <pre className="p-4 text-xs font-mono">{JSON.stringify(results.rows, null, 2)}</pre>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="stats" className="flex-1 m-0 p-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-border p-4">
                <div className="text-sm text-muted-foreground">Execution Time</div>
                <div className="text-2xl font-semibold">{results.executionTime}ms</div>
              </div>
              <div className="rounded-lg border border-border p-4">
                <div className="text-sm text-muted-foreground">Rows Returned</div>
                <div className="text-2xl font-semibold">{results.rowCount}</div>
              </div>
            </div>

            <div className="rounded-lg bg-accent/20 border border-accent/50 p-4">
              <h4 className="text-sm font-medium mb-2 text-accent-foreground">Performance Tips</h4>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>Consider adding indexes on frequently queried columns</li>
                <li>Use LIMIT to restrict result set size for large tables</li>
                <li>Avoid SELECT * in production queries</li>
              </ul>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
