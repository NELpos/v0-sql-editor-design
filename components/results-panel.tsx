"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, TableIcon, LineChart, FileJson, Zap, BarChart3, PieChart } from 'lucide-react'
import { 
  LineChart as RechartsLineChart, 
  Line, 
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

interface ResultsPanelProps {
  results: any
  isExecuting: boolean
}

export function ResultsPanel({ results, isExecuting }: ResultsPanelProps) {
  const [chartType, setChartType] = useState<'line' | 'bar' | 'pie'>('line')

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

  const hasTimeSeriesData = results?.columns?.some((col: string) => 
    ['date', 'time', 'timestamp', 'hour', 'day', 'month', 'year'].some(keyword => 
      col.toLowerCase().includes(keyword)
    )
  )

  const numericColumns = results?.columns?.filter((col: string) => {
    if (!results.rows || results.rows.length === 0) return false
    const firstValue = results.rows[0][col]
    return typeof firstValue === 'number'
  }) || []

  const timeColumn = results?.columns?.find((col: string) => 
    ['date', 'time', 'timestamp', 'hour', 'day'].some(keyword => 
      col.toLowerCase().includes(keyword)
    )
  )

  const categoryColumn = results?.columns?.find((col: string) => 
    !numericColumns.includes(col) && col !== timeColumn
  )

  const hasCategories = categoryColumn && results?.rows?.length > 0
  const showChartTab = numericColumns.length > 0 && (hasTimeSeriesData || hasCategories)

  const CHART_COLORS = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))'
  ]

  const defaultChartType = (() => {
    if (hasTimeSeriesData) return 'line'
    if (hasCategories && results.rows.length <= 10) return 'pie'
    return 'bar'
  })()

  return (
    <div className="h-full bg-background">
      <Tabs defaultValue="table" className="h-full flex flex-col">
        <div className="border-b border-border px-4">
          <TabsList className="h-12">
            <TabsTrigger value="table" className="gap-2">
              <TableIcon className="h-4 w-4" />
              Table
            </TabsTrigger>
            {showChartTab && (
              <TabsTrigger value="charts" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Charts
              </TabsTrigger>
            )}
            <TabsTrigger value="stats" className="gap-2">
              <Zap className="h-4 w-4" />
              Stats
            </TabsTrigger>
            <TabsTrigger value="json" className="gap-2">
              <FileJson className="h-4 w-4" />
              JSON
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

        {showChartTab && (
          <TabsContent value="charts" className="flex-1 m-0 p-6 overflow-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Data Visualization</h3>
                  <p className="text-sm text-muted-foreground">
                    Showing {numericColumns.length} metric{numericColumns.length !== 1 ? 's' : ''} 
                    {hasTimeSeriesData && ' over time'}
                  </p>
                </div>
                
                <Select 
                  value={chartType} 
                  onValueChange={(value) => setChartType(value as 'line' | 'bar' | 'pie')}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select chart type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="line">
                      <div className="flex items-center gap-2">
                        <LineChart className="h-4 w-4" />
                        Line Chart
                      </div>
                    </SelectItem>
                    <SelectItem value="bar">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Bar Chart
                      </div>
                    </SelectItem>
                    {hasCategories && results.rows.length <= 20 && (
                      <SelectItem value="pie">
                        <div className="flex items-center gap-2">
                          <PieChart className="h-4 w-4" />
                          Pie Chart
                        </div>
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <Card className="p-6">
                {chartType === 'line' && (
                  <ResponsiveContainer width="100%" height={400}>
                    <RechartsLineChart data={results.rows} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey={timeColumn || categoryColumn || results.columns[0]} 
                        className="text-xs"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <YAxis 
                        className="text-xs"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px'
                        }}
                      />
                      <Legend />
                      {numericColumns.map((col, index) => (
                        <Line
                          key={col}
                          type="monotone"
                          dataKey={col}
                          stroke={CHART_COLORS[index % CHART_COLORS.length]}
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                      ))}
                    </RechartsLineChart>
                  </ResponsiveContainer>
                )}

                {chartType === 'bar' && (
                  <ResponsiveContainer width="100%" height={400}>
                    <RechartsBarChart data={results.rows} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey={timeColumn || categoryColumn || results.columns[0]} 
                        className="text-xs"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <YAxis 
                        className="text-xs"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px'
                        }}
                      />
                      <Legend />
                      {numericColumns.map((col, index) => (
                        <Bar
                          key={col}
                          dataKey={col}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </RechartsBarChart>
                  </ResponsiveContainer>
                )}

                {chartType === 'pie' && numericColumns.length > 0 && (
                  <ResponsiveContainer width="100%" height={400}>
                    <RechartsPieChart>
                      <Pie
                        data={results.rows.map((row: any) => ({
                          name: row[categoryColumn || results.columns[0]],
                          value: row[numericColumns[0]]
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={120}
                        fill={CHART_COLORS[0]}
                        dataKey="value"
                      >
                        {results.rows.map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px'
                        }}
                      />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                )}
              </Card>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {numericColumns.slice(0, 4).map((col) => {
                  const values = results.rows.map((row: any) => row[col]).filter((v: any) => typeof v === 'number')
                  const sum = values.reduce((a: number, b: number) => a + b, 0)
                  const avg = sum / values.length
                  const max = Math.max(...values)
                  const min = Math.min(...values)

                  return (
                    <Card key={col} className="p-4">
                      <div className="text-xs text-muted-foreground mb-1">{col}</div>
                      <div className="text-2xl font-bold mb-2">{avg.toFixed(2)}</div>
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Max:</span>
                          <span className="font-medium">{max.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Min:</span>
                          <span className="font-medium">{min.toFixed(2)}</span>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          </TabsContent>
        )}

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

        <TabsContent value="json" className="flex-1 m-0 overflow-hidden">
          <ScrollArea className="h-full">
            <pre className="p-4 text-xs font-mono">{JSON.stringify(results.rows, null, 2)}</pre>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}
