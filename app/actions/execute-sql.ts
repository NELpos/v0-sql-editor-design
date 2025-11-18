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
  
  // In demo mode, allow all queries but provide mock responses
  // Only reject completely empty queries
  if (!normalized) {
    return false;
  }
  
  // For now, accept all queries and return mock data
  // When real database is connected, this validation will be more strict
  return true;
}

export async function executeSQL(
  query: string,
  notebookId: string
): Promise<SQLExecutionResult> {
  // Validate query
  if (!query || !query.trim()) {
    return { error: 'Query cannot be empty' };
  }

  // All queries will return mock data
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

  // Check for INSERT, UPDATE, DELETE, CREATE queries and return success message
  if (normalizedQuery.includes('insert') || normalizedQuery.includes('update') || 
      normalizedQuery.includes('delete') || normalizedQuery.includes('create') ||
      normalizedQuery.includes('alter') || normalizedQuery.includes('drop')) {
    return [
      { status: 'success', message: 'Query executed successfully (mock)', affected_rows: Math.floor(Math.random() * 100) + 1, execution_time: '0.5s' }
    ];
  }

  // Generate different mock data based on query patterns
  if (normalizedQuery.includes('order') || normalizedQuery.includes('purchase') || normalizedQuery.includes('sale')) {
    return [
      { order_id: 1001, customer_name: 'Alice Kim', product: 'Laptop', quantity: 1, amount: 1299.99, status: 'shipped', order_date: '2025-01-10T09:30:00Z' },
      { order_id: 1002, customer_name: 'Bob Park', product: 'Mouse', quantity: 2, amount: 49.98, status: 'delivered', order_date: '2025-01-11T14:20:00Z' },
      { order_id: 1003, customer_name: 'Carol Lee', product: 'Keyboard', quantity: 1, amount: 89.99, status: 'processing', order_date: '2025-01-12T11:15:00Z' },
      { order_id: 1004, customer_name: 'David Choi', product: 'Monitor', quantity: 1, amount: 349.99, status: 'shipped', order_date: '2025-01-13T16:45:00Z' },
      { order_id: 1005, customer_name: 'Emma Jung', product: 'Headphones', quantity: 3, amount: 269.97, status: 'delivered', order_date: '2025-01-14T10:30:00Z' },
    ];
  }

  if (normalizedQuery.includes('count') || normalizedQuery.includes('group by')) {
    return [
      { date: '2025-01-08', count: 145, revenue: 12340.50, avg_order: 85.11 },
      { date: '2025-01-09', count: 167, revenue: 15678.30, avg_order: 93.89 },
      { date: '2025-01-10', count: 189, revenue: 18923.45, avg_order: 100.12 },
      { date: '2025-01-11', count: 178, revenue: 16543.20, avg_order: 92.94 },
      { date: '2025-01-12', count: 195, revenue: 19832.10, avg_order: 101.70 },
      { date: '2025-01-13', count: 203, revenue: 21456.75, avg_order: 105.70 },
      { date: '2025-01-14', count: 221, revenue: 23891.40, avg_order: 108.10 },
    ];
  }

  if (normalizedQuery.includes('user') || normalizedQuery.includes('customer')) {
    return [
      { id: 1, email: 'alice.kim@example.com', name: 'Alice Kim', created_at: '2024-12-01T10:30:00Z', status: 'active', total_orders: 5, lifetime_value: 1245.50 },
      { id: 2, email: 'bob.park@example.com', name: 'Bob Park', created_at: '2024-12-15T14:22:00Z', status: 'active', total_orders: 3, lifetime_value: 876.30 },
      { id: 3, email: 'carol.lee@example.com', name: 'Carol Lee', created_at: '2025-01-05T09:15:00Z', status: 'pending', total_orders: 1, lifetime_value: 89.99 },
      { id: 4, email: 'david.choi@example.com', name: 'David Choi', created_at: '2025-01-08T16:45:00Z', status: 'active', total_orders: 7, lifetime_value: 2134.80 },
      { id: 5, email: 'emma.jung@example.com', name: 'Emma Jung', created_at: '2025-01-10T11:20:00Z', status: 'active', total_orders: 4, lifetime_value: 1023.45 },
      { id: 6, email: 'frank.song@example.com', name: 'Frank Song', created_at: '2025-01-12T08:50:00Z', status: 'inactive', total_orders: 0, lifetime_value: 0.00 },
    ];
  }

  if (normalizedQuery.includes('product') || normalizedQuery.includes('inventory') || normalizedQuery.includes('item')) {
    return [
      { product_id: 101, name: 'MacBook Pro 16"', category: 'Laptops', price: 2499.99, stock: 15, supplier: 'Apple Inc.', last_restocked: '2025-01-05' },
      { product_id: 102, name: 'Logitech MX Master 3', category: 'Accessories', price: 99.99, stock: 43, supplier: 'Logitech', last_restocked: '2025-01-10' },
      { product_id: 103, name: 'Dell UltraSharp Monitor', category: 'Monitors', price: 549.99, stock: 8, supplier: 'Dell', last_restocked: '2025-01-08' },
      { product_id: 104, name: 'Sony WH-1000XM5', category: 'Audio', price: 399.99, stock: 22, supplier: 'Sony', last_restocked: '2025-01-12' },
      { product_id: 105, name: 'Mechanical Keyboard RGB', category: 'Accessories', price: 149.99, stock: 0, supplier: 'Corsair', last_restocked: '2024-12-28' },
    ];
  }

  if (normalizedQuery.includes('log') || normalizedQuery.includes('event') || normalizedQuery.includes('activity')) {
    return [
      { id: 1, timestamp: '2025-01-14T08:00:15Z', level: 'INFO', source: 'auth-service', message: 'User login successful', user_id: 1245 },
      { id: 2, timestamp: '2025-01-14T08:15:42Z', level: 'INFO', source: 'api-gateway', message: 'API request processed', response_time: 145 },
      { id: 3, timestamp: '2025-01-14T08:30:28Z', level: 'WARNING', source: 'database', message: 'Query execution slow', query_time: 3420 },
      { id: 4, timestamp: '2025-01-14T08:45:33Z', level: 'ERROR', source: 'payment-service', message: 'Payment gateway timeout', error_code: 'TIMEOUT_001' },
      { id: 5, timestamp: '2025-01-14T09:00:11Z', level: 'INFO', source: 'cache-service', message: 'Cache invalidated', keys_cleared: 1250 },
      { id: 6, timestamp: '2025-01-14T09:15:57Z', level: 'ERROR', source: 'email-service', message: 'SMTP connection failed', retry_count: 3 },
      { id: 7, timestamp: '2025-01-14T09:30:04Z', level: 'INFO', source: 'scheduler', message: 'Backup job completed', duration_sec: 342 },
    ];
  }

  if (normalizedQuery.includes('employee') || normalizedQuery.includes('staff') || normalizedQuery.includes('team')) {
    return [
      { emp_id: 'E001', name: 'John Smith', department: 'Engineering', position: 'Senior Developer', salary: 95000, hire_date: '2022-03-15', manager: 'Sarah Johnson' },
      { emp_id: 'E002', name: 'Sarah Johnson', department: 'Engineering', position: 'Engineering Manager', salary: 125000, hire_date: '2020-01-10', manager: 'CEO' },
      { emp_id: 'E003', name: 'Mike Chen', department: 'Sales', position: 'Sales Representative', salary: 65000, hire_date: '2023-06-01', manager: 'Lisa Wang' },
      { emp_id: 'E004', name: 'Lisa Wang', department: 'Sales', position: 'Sales Director', salary: 110000, hire_date: '2021-08-20', manager: 'CEO' },
      { emp_id: 'E005', name: 'Emily Brown', department: 'Marketing', position: 'Content Manager', salary: 72000, hire_date: '2023-02-14', manager: 'James Lee' },
    ];
  }

  if (normalizedQuery.includes('time') || normalizedQuery.includes('hour') || normalizedQuery.includes('day')) {
    return [
      { hour: '00:00', visitors: 234, pageviews: 567, bounce_rate: 45.2, avg_session: 180 },
      { hour: '01:00', visitors: 189, pageviews: 423, bounce_rate: 48.1, avg_session: 165 },
      { hour: '02:00', visitors: 156, pageviews: 321, bounce_rate: 51.3, avg_session: 142 },
      { hour: '03:00', visitors: 134, pageviews: 278, bounce_rate: 53.7, avg_session: 128 },
      { hour: '04:00', visitors: 178, pageviews: 389, bounce_rate: 49.8, avg_session: 155 },
      { hour: '05:00', visitors: 267, pageviews: 612, bounce_rate: 43.5, avg_session: 198 },
    ];
  }

  // Default generic dataset for unmatched queries
  return [
    { id: 1, category: 'Category A', value: 'Sample Data 1', metric: 145.50, timestamp: '2025-01-14T10:00:00Z', active: true },
    { id: 2, category: 'Category B', value: 'Sample Data 2', metric: 267.30, timestamp: '2025-01-14T11:00:00Z', active: true },
    { id: 3, category: 'Category A', value: 'Sample Data 3', metric: 198.75, timestamp: '2025-01-14T12:00:00Z', active: false },
    { id: 4, category: 'Category C', value: 'Sample Data 4', metric: 423.90, timestamp: '2025-01-14T13:00:00Z', active: true },
    { id: 5, category: 'Category B', value: 'Sample Data 5', metric: 312.45, timestamp: '2025-01-14T14:00:00Z', active: true },
    { id: 6, category: 'Category C', value: 'Sample Data 6', metric: 189.20, timestamp: '2025-01-14T15:00:00Z', active: false },
  ];
}
