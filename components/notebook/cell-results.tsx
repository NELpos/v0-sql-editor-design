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
import { TableIcon, FileJson, Zap, Download, ChevronDown, ChevronUp } from 'lucide-react';
import type { NotebookResults } from '@/types/notebook';

interface CellResultsProps {
  results: NotebookResults;
}

export function CellResults({ results }: CellResultsProps) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isCollapsed, setIsCollapsed] = useState(false);

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
