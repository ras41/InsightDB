// Simulated database service for production-ready frontend development
const MOCK_DB = {
    tables: [
        { id: '1', name: 'orders', rows: 1240, size: '4.2 MB', schema: 'public', type: 'table', icon: 'table', description: 'Store transactions and order status', updatedAt: '2m ago' },
        { id: '2', name: 'customers', rows: 850, size: '1.8 MB', schema: 'public', type: 'table', icon: 'user', description: 'Customer profiles and contact info', updatedAt: '1h ago' },
        { id: '3', name: 'products', rows: 320, size: '0.5 MB', schema: 'inventory', type: 'table', icon: 'layout-grid', description: 'Product catalog and inventory', updatedAt: '4h ago' },
        { id: '4', name: 'categories', rows: 12, size: '0.1 MB', schema: 'inventory', type: 'table', icon: 'git-fork', description: 'Product categorization', updatedAt: '1d ago' },
        { id: '5', name: 'reviews', rows: 4102, size: '8.4 MB', schema: 'public', type: 'table', icon: 'message-square', badge: 'AI INSIGHT', description: 'Customer feedback and ratings', updatedAt: '10m ago' },
        { id: '6', name: 'inventory_logs', rows: 15600, size: '12.1 MB', schema: 'logs', type: 'table', icon: 'table', description: 'Stock movement history', updatedAt: '5m ago' },
    ],
    views: [
        { id: 'v1', name: 'active_sessions', rows: 'N/A', size: 'N/A', schema: 'monitoring', type: 'view', icon: 'eye', description: 'Currently active database sessions' },
        { id: 'v2', name: 'monthly_revenue', rows: 'N/A', size: 'N/A', schema: 'reporting', type: 'view', icon: 'eye', description: 'Aggregated revenue by month' },
    ],
    functions: [
        { id: 'f1', name: 'calculate_tax', schema: 'utils', type: 'function', icon: 'file-code', description: 'Calculate sales tax based on region' },
        { id: 'f2', name: 'update_stock_level', schema: 'inventory', type: 'function', icon: 'file-code', description: 'Triggered on order fulfillment' },
    ],
    schemas: ['public', 'inventory', 'monitoring', 'reporting', 'utils', 'logs']
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const dbService = {
    async getObjects(type = 'tables', schema = 'all') {
        await delay(600);
        let results = MOCK_DB[type] || [];
        if (schema !== 'all') {
            results = results.filter(obj => obj.schema === schema);
        }
        return results;
    },

    async getSchemas() {
        await delay(300);
        return MOCK_DB.schemas;
    },

    async searchObjects(query) {
        await delay(300);
        const q = query.toLowerCase();
        const all = [...MOCK_DB.tables, ...MOCK_DB.views, ...MOCK_DB.functions];
        return all.filter(obj =>
            obj.name.toLowerCase().includes(q) ||
            obj.description?.toLowerCase().includes(q) ||
            obj.schema.toLowerCase().includes(q)
        );
    },

    async getTableDetail(tableName) {
        await delay(500);

        const isOrders = tableName.toLowerCase().includes('orders');
        const prefix = tableName.slice(0, -1);

        return {
            name: tableName,
            columns: isOrders ? [
                { name: 'order_id', type: 'Integer', nulls: '0%', badge: 'PK', color: 'bg-purple-50 text-purple-600', unique: '100%' },
                { name: 'customer_id', type: 'UUID', nulls: '0%', badge: 'FK', color: 'bg-indigo-50 text-indigo-600', unique: '66%' },
                { name: 'status', type: 'Varchar(20)', nulls: '0%', color: 'bg-blue-50 text-blue-600', unique: '5%' },
                { name: 'total_amount', type: 'Decimal(10,2)', nulls: '0%', color: 'bg-emerald-50 text-emerald-600', unique: '88%' },
                { name: 'created_at', type: 'Timestamp', nulls: '1%', color: 'bg-amber-50 text-amber-600', unique: '99%' },
            ] : [
                { name: `${prefix}_id`, type: 'Integer', nulls: '0%', badge: 'PK', color: 'bg-purple-50 text-purple-600', unique: '100%' },
                { name: 'tenant_id', type: 'Integer', nulls: '0%', badge: 'FK', color: 'bg-indigo-50 text-indigo-600', unique: '12%' },
                { name: 'name', type: 'Varchar(255)', nulls: '2%', color: 'bg-blue-50 text-blue-600', unique: '94%' },
                { name: 'metadata', type: 'JSONB', nulls: '15%', color: 'bg-slate-50 text-slate-600', unique: '99%' },
            ],
            quality: [
                { label: 'Completeness', val: isOrders ? '99.2%' : '88.5%', status: 'Healthy', color: 'green' },
                { label: 'Uniqueness', val: 'Primary', status: 'Verified', color: 'brand' },
                { label: 'Anomalies', val: 'Low', status: isOrders ? '0 critical' : '12 warnings', color: isOrders ? 'emerald' : 'rose' },
            ]
        };
    },

    async getTableData(tableName) {
        await delay(600);
        const isOrders = tableName.toLowerCase().includes('orders');

        return {
            columns: isOrders
                ? ['order_id', 'status', 'total', 'date']
                : ['id', 'name', 'type', 'updated_at'],
            rows: isOrders ? [
                ['10240', 'Delivered', '$420.00', '2024-02-12'],
                ['10241', 'Processing', '$12.50', '2024-02-12'],
                ['10242', 'Shipped', '$89.00', '2024-02-13'],
                ['10243', 'Pending', '$1,200.00', '2024-02-14'],
            ] : [
                ['1', 'Main Store', 'Retail', '2024-01-01'],
                ['2', 'Warehouse A', 'Logistics', '2024-01-05'],
                ['3', 'Online Shop', 'Digital', '2024-01-10'],
            ]
        };
    },

    async executeQuery(sql) {
        await delay(800);
        const lowerSql = sql.toLowerCase();

        if (lowerSql.includes('error') || lowerSql.includes('drop')) {
            throw new Error("Syntax error: Permission denied or malformed query.");
        }

        const results = {
            columns: ['id', 'status', 'total', 'created_at'],
            rows: [
                ['1024', 'Delivered', '$120.50', '2024-02-12'],
                ['1025', 'Processing', '$45.00', '2024-02-13'],
                ['1026', 'Shipped', '$312.20', '2024-02-14'],
                ['1027', 'Pending', '$89.99', '2024-02-15'],
            ],
            executionTime: '124ms',
            rowCount: 4
        };

        // Save to internal history for persistence across calls in the same session
        this._history = this._history || [];
        this._history.unshift({
            sql,
            status: 'success',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            results
        });

        return results;
    },

    _history: [
        { sql: 'SELECT * FROM customers LIMIT 5', status: 'success', time: '10:45 AM' },
        { sql: 'SELECT count(*) FROM orders', status: 'success', time: '11:20 AM' }
    ],

    async getHistory() {
        await delay(300);
        return this._history;
    },

    async formatSQL(sql) {
        await delay(800); // Simulate AI formatting latency
        const keywords = ['select', 'from', 'where', 'order by', 'group by', 'desc', 'asc', 'limit', 'join', 'on', 'and', 'or', 'insert', 'update', 'delete'];
        let formatted = sql.toLowerCase();

        keywords.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'g');
            formatted = formatted.replace(regex, word.toUpperCase());
        });

        // Basic indentation/formatting simulation
        formatted = formatted
            .replace(/SELECT /g, 'SELECT ')
            .replace(/ FROM /g, '\nFROM ')
            .replace(/ WHERE /g, '\nWHERE ')
            .replace(/ ORDER BY /g, '\nORDER BY ')
            .replace(/ JOIN /g, '\nJOIN ')
            .replace(/ AND /g, '\n  AND ')
            .replace(/;/g, ';\n');

        return formatted;
    },

    async getInsights() {
        await delay(1200); // Simulate heavy AI computations
        return {
            kpis: [
                { title: 'Total Revenue', value: '$84,230.12', trend: '+12.4%', up: true, icon: 'zap', color: 'text-brand bg-brand/5' },
                { title: 'Active Users', value: '1,240', trend: '+4.2%', up: true, icon: 'users', color: 'text-indigo-600 bg-indigo-50' },
                { title: 'Churn Rate', value: '0.8%', trend: '-2.1%', up: false, icon: 'target', color: 'text-rose-600 bg-rose-50' },
            ],
            trends: [
                { month: 'JAN', value: 40 },
                { month: 'FEB', value: 70 },
                { month: 'MAR', value: 45 },
                { month: 'APR', value: 90 },
                { month: 'MAY', value: 65 },
                { month: 'JUN', value: 80 },
                { month: 'JUL', value: 55 },
                { month: 'AUG', value: 95 },
            ],
            aiProjection: {
                growth: '8.2%',
                summary: 'Based on current ingestion patterns, your high-value customers are increasing frequency but decreasing basket size.'
            }
        };
    },

    async getSavedQueries() {
        await delay(400);
        return [
            { id: 'q1', title: 'Monthly Revenue', sql: 'SELECT date_trunc(\'month\', created_at), sum(total) FROM orders GROUP BY 1', lastRun: '2h ago', rows: '12 rows' },
            { id: 'q2', title: 'High Value Customers', sql: 'SELECT * FROM customers WHERE lifetime_value > 1000', lastRun: 'Yesterday', rows: '45 rows' },
            { id: 'q3', title: 'Inventory Alert', sql: 'SELECT name, stock FROM products WHERE stock < 10', lastRun: '3 days ago', rows: '8 rows' },
        ];
    },

    async saveQuery(title, sql) {
        await delay(800);
        console.log(`[BE Simulator] Saving query "${title}": ${sql}`);
        return { success: true, id: Math.random().toString(36).substr(2, 9) };
    },

    async exportTableData(tableName, format = 'csv') {
        await delay(1500); // Simulate server-side generation

        // This is a bridge for a BE endpoint like GET /api/export/:table
        return {
            success: true,
            fileName: `${tableName}_data_${new Date().toISOString().split('T')[0]}.${format}`,
            status: 'Ready'
        };
    }
};
