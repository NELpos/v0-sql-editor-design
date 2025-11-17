'use server';

export interface SQLExecutionResult {
  data?: any[];
  columns?: string[];
  executionTimeMs?: number;
  rowCount?: number;
  error?: string;
}

function isReadOnlyQuery(query: string): boolean {
  const normalized = query.trim().toUpperCase();
  const readOnlyKeywords = ['SELECT', 'WITH', 'SHOW', 'DESCRIBE', 'EXPLAIN'];
  const dangerousKeywords = [
    'DROP',
    'DELETE',
    'UPDATE',
    'INSERT',
    'ALTER',
    'CREATE',
    'TRUNCATE',
    'GRANT',
    'REVOKE',
  ];

  const startsWithReadOnly = readOnlyKeywords.some((kw) =>
    normalized.startsWith(kw)
  );
  const containsDangerous = dangerousKeywords.some((kw) =>
    normalized.includes(kw)
  );

  return startsWithReadOnly && !containsDangerous;
}

export async function executeSQL(
  query: string,
  notebookId: string
): Promise<SQLExecutionResult> {
  // Validate query
  if (!query || !query.trim()) {
    return { error: 'Query cannot be empty' };
  }

  if (!isReadOnlyQuery(query)) {
    return {
      error:
        'Only SELECT, WITH, SHOW, DESCRIBE, and EXPLAIN queries are allowed',
    };
  }

  try {
    const startTime = Date.now();

    // Mock execution for now - will be replaced with actual database connection
    // when user adds database integration
    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 500));

    // Generate mock results based on query
    const mockData = generateMockResults(query);
    const executionTime = Date.now() - startTime;

    return {
      data: mockData,
      columns: mockData.length > 0 ? Object.keys(mockData[0]) : [],
      executionTimeMs: executionTime,
      rowCount: mockData.length,
    };
  } catch (error) {
    console.error('[v0] SQL execution error:', error);
    return {
      error:
        error instanceof Error
          ? error.message
          : 'Query execution failed. Please check your SQL syntax.',
    };
  }
}

function generateMockResults(query: string): any[] {
  const normalizedQuery = query.toLowerCase();

  // Generate different mock data based on query patterns
  if (normalizedQuery.includes('count')) {
    return [
      { date: '2025-01-08', count: 145 },
      { date: '2025-01-09', count: 167 },
      { date: '2025-01-10', count: 189 },
      { date: '2025-01-11', count: 178 },
      { date: '2025-01-12', count: 195 },
      { date: '2025-01-13', count: 203 },
      { date: '2025-01-14', count: 221 },
    ];
  }

  if (normalizedQuery.includes('user')) {
    return [
      {
        id: 1,
        email: 'user1@example.com',
        created_at: '2025-01-10T10:30:00Z',
        status: 'active',
      },
      {
        id: 2,
        email: 'user2@example.com',
        created_at: '2025-01-11T14:22:00Z',
        status: 'active',
      },
      {
        id: 3,
        email: 'user3@example.com',
        created_at: '2025-01-12T09:15:00Z',
        status: 'pending',
      },
      {
        id: 4,
        email: 'user4@example.com',
        created_at: '2025-01-13T16:45:00Z',
        status: 'active',
      },
      {
        id: 5,
        email: 'user5@example.com',
        created_at: '2025-01-14T11:20:00Z',
        status: 'active',
      },
    ];
  }

  if (normalizedQuery.includes('log')) {
    return [
      {
        id: 1,
        timestamp: '2025-01-14T08:00:00Z',
        level: 'INFO',
        message: 'Application started successfully',
      },
      {
        id: 2,
        timestamp: '2025-01-14T08:15:00Z',
        level: 'INFO',
        message: 'User authentication completed',
      },
      {
        id: 3,
        timestamp: '2025-01-14T08:30:00Z',
        level: 'WARNING',
        message: 'High memory usage detected',
      },
      {
        id: 4,
        timestamp: '2025-01-14T08:45:00Z',
        level: 'ERROR',
        message: 'Failed to connect to external API',
      },
      {
        id: 5,
        timestamp: '2025-01-14T09:00:00Z',
        level: 'INFO',
        message: 'Cache cleared successfully',
      },
    ];
  }

  // Default generic results
  return [
    { id: 1, value: 'Result 1', timestamp: '2025-01-14T10:00:00Z' },
    { id: 2, value: 'Result 2', timestamp: '2025-01-14T11:00:00Z' },
    { id: 3, value: 'Result 3', timestamp: '2025-01-14T12:00:00Z' },
    { id: 4, value: 'Result 4', timestamp: '2025-01-14T13:00:00Z' },
    { id: 5, value: 'Result 5', timestamp: '2025-01-14T14:00:00Z' },
  ];
}
