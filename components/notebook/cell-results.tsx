'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { TableIcon, FileJson, Zap, Download, ChevronDown, ChevronUp, LineChartIcon, BarChart3, PieChart } from 'lucide-react';
import type { NotebookResults } from '@/types/notebook';
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CellResultsProps {
  results: NotebookResults;
}

export function CellResults({ results }: CellResultsProps) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [chartType, setChartType] = useState<'line' | 'bar' | 'pie'>('line');

  if (results.error) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-destructive/20 p-2">
            <Zap className="h-4 w-4 text-destructive" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-destructive mb-1">
              Query Execution Failed
            </h4>
            <p className="text-xs text-destructive/90">{results.error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (results.data.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-muted/30 p-6 text-center">
        <TableIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
        <p className="text-sm text-muted-foreground">
          Query executed successfully but returned no rows
        </p>
      </div>
    );
  }

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedData = sortColumn
    ? [...results.data].sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];
        const modifier = sortDirection === 'asc' ? 1 : -1;

        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return aVal.localeCompare(bVal) * modifier;
        }
        return (aVal > bVal ? 1 : -1) * modifier;
      })
    : results.data;

  const handleExport = (format: 'csv' | 'json') => {
    if (format === 'csv') {
      const csv = [
        results.columns.join(','),
        ...results.data.map((row) =>
          results.columns.map((col) => `"${row[col]}"`).join(',')
        ),
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `results-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const json = JSON.stringify(results.data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `results-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const detectChartData = () => {
    if (results.data.length === 0) return null;

    const hasTimeColumn = results.columns.some(col => 
      /date|time|timestamp|created|updated|day|month|year/i.test(col)
    );
    
    const numericColumns = results.columns.filter(col => {
      const firstValue = results.data[0]?.[col];
      return typeof firstValue === 'number' || !isNaN(Number(firstValue));
    });

    if (hasTimeColumn && numericColumns.length > 0) {
      const timeColumn = results.columns.find(col => 
        /date|time|timestamp|created|updated|day|month|year/i.test(col)
      );
      
      return {
        type: 'timeseries' as const,
        xAxis: timeColumn!,
        yAxis: numericColumns,
        data: results.data,
      };
    }

    if (numericColumns.length >= 2) {
      return {
        type: 'numeric' as const,
        xAxis: results.columns[0],
        yAxis: numericColumns.slice(0, 3),
        data: results.data,
      };
    }

    if (numericColumns.length === 1) {
      return {
        type: 'categorical' as const,
        labelColumn: results.columns[0],
        valueColumn: numericColumns[0],
        data: results.data.slice(0, 10),
      };
    }

    return null;
  };

  const chartData = detectChartData();

  const renderChart = () => {
    if (!chartData) {
      return (
        <div className="flex items-center justify-center h-[400px] text-muted-foreground">
          <div className="text-center space-y-2">
            <LineChartIcon className="h-12 w-12 mx-auto opacity-30" />
            <p className="text-sm">No chartable data detected</p>
            <p className="text-xs">Try queries with numeric or time-series data</p>
          </div>
        </div>
      );
    }

    const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

    if (chartType === 'pie' && chartData.type === 'categorical') {
      const pieData = chartData.data.map((row) => ({
        name: String(row[chartData.labelColumn]),
        value: Number(row[chartData.valueColumn]),
      }));

      return (
        <ResponsiveContainer width="100%" height={400}>
          <RechartsPieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={120}
              fill="hsl(var(--chart-1))"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </RechartsPieChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === 'bar') {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey={chartData.xAxis} 
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
            />
            <Legend />
            {chartData.yAxis.map((col, idx) => (
              <Bar
                key={col}
                dataKey={col}
                fill={COLORS[idx % COLORS.length]}
                name={col}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData.data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey={chartData.xAxis} 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
            }}
          />
          <Legend />
          {chartData.yAxis.map((col, idx) => (
            <Line
              key={col}
              type="monotone"
              dataKey={col}
              stroke={COLORS[idx % COLORS.length]}
              strokeWidth={2}
              dot={{ fill: COLORS[idx % COLORS.length], r: 3 }}
              name={col}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="border-b border-border bg-secondary/20 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>
            {results.data.length} rows
          </span>
          <span>
            {results.executionTimeMs}ms
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleExport('csv')}
            className="h-7 gap-2"
          >
            <Download className="h-3 w-3" />
            CSV
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleExport('json')}
            className="h-7 gap-2"
          >
            <Download className="h-3 w-3" />
            JSON
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-7 w-7"
          >
            {isCollapsed ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {!isCollapsed && (
        <Tabs defaultValue="table" className="w-full">
          <div className="border-b border-border px-4">
            <TabsList className="h-10 bg-transparent">
              <TabsTrigger value="table" className="gap-2 text-xs">
                <TableIcon className="h-3 w-3" />
                Table
              </TabsTrigger>
              <TabsTrigger value="json" className="gap-2 text-xs">
                <FileJson className="h-3 w-3" />
                JSON
              </TabsTrigger>
              <TabsTrigger value="charts" className="gap-2 text-xs">
                <LineChartIcon className="h-3 w-3" />
                Charts
              </TabsTrigger>
              <TabsTrigger value="stats" className="gap-2 text-xs">
                <Zap className="h-3 w-3" />
                Stats
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="table" className="m-0">
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader className="sticky top-0 bg-secondary/50 backdrop-blur">
                  <TableRow>
                    {results.columns.map((column) => (
                      <TableHead
                        key={column}
                        className="font-semibold cursor-pointer hover:bg-secondary/80 transition-colors"
                        onClick={() => handleSort(column)}
                      >
                        <div className="flex items-center gap-1">
                          {column}
                          {sortColumn === column && (
                            <span className="text-primary">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedData.map((row, i) => (
                    <TableRow key={i} className="hover:bg-muted/50">
                      {results.columns.map((column) => (
                        <TableCell
                          key={column}
                          className="font-mono text-xs max-w-xs truncate"
                          title={String(row[column])}
                        >
                          {String(row[column])}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="json" className="m-0">
            <ScrollArea className="h-[400px]">
              <pre className="p-4 text-xs font-mono text-foreground/90">
                {JSON.stringify(sortedData, null, 2)}
              </pre>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="charts" className="m-0">
            <div className="p-4 space-y-4">
              {chartData && (
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Visualization</h4>
                  <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
                    <SelectTrigger className="w-[140px] h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="line">
                        <div className="flex items-center gap-2">
                          <LineChartIcon className="h-3 w-3" />
                          Line Chart
                        </div>
                      </SelectItem>
                      <SelectItem value="bar">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-3 w-3" />
                          Bar Chart
                        </div>
                      </SelectItem>
                      {chartData.type === 'categorical' && (
                        <SelectItem value="pie">
                          <div className="flex items-center gap-2">
                            <PieChart className="h-3 w-3" />
                            Pie Chart
                          </div>
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {renderChart()}

              {chartData && (
                <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                  <div className="font-medium mb-1">Chart Info</div>
                  <div className="space-y-0.5">
                    <div>X-Axis: {chartData.xAxis || chartData.labelColumn}</div>
                    <div>Y-Axis: {chartData.yAxis?.join(', ') || chartData.valueColumn}</div>
                    <div>Data Points: {chartData.data.length}</div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="stats" className="m-0 p-4">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg border border-border bg-secondary/20 p-3">
                  <div className="text-xs text-muted-foreground">Rows</div>
                  <div className="text-xl font-semibold">
                    {results.data.length}
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-secondary/20 p-3">
                  <div className="text-xs text-muted-foreground">Columns</div>
                  <div className="text-xl font-semibold">
                    {results.columns.length}
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-secondary/20 p-3">
                  <div className="text-xs text-muted-foreground">Time</div>
                  <div className="text-xl font-semibold">
                    {results.executionTimeMs}ms
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-accent/10 border border-accent/30 p-4">
                <h4 className="text-sm font-medium mb-2">Column Information</h4>
                <div className="space-y-1 text-xs">
                  {results.columns.map((col) => (
                    <div
                      key={col}
                      className="flex items-center justify-between py-1"
                    >
                      <span className="font-mono text-muted-foreground">
                        {col}
                      </span>
                      <span className="text-muted-foreground">
                        {typeof results.data[0]?.[col]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
