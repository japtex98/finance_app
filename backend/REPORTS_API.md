# Reports API Documentation

This document describes the comprehensive reporting system for the Finance App backend. All reports are generated dynamically from transaction data without requiring separate report tables.

## Overview

The reporting system provides real-time financial insights through multiple specialized endpoints. All reports support filtering by date range, categories, and users.

## Base URL
```
/api/reports
```

## Authentication
All report endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Rate Limiting
Report endpoints have stricter rate limiting (50 requests per 15 minutes) due to their resource-intensive nature.

## Available Reports

### 1. Comprehensive Financial Report
**Endpoint:** `GET /api/reports/financial`

**Description:** Complete financial overview with all metrics and breakdowns.

**Query Parameters:**
- `startDate` (optional): Start date filter (ISO 8601 format)
- `endDate` (optional): End date filter (ISO 8601 format)
- `categoryIds` (optional): Array of category IDs to filter
- `userIds` (optional): Array of user IDs to filter

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalIncome": 5000.00,
      "totalExpense": 3000.00,
      "netBalance": 2000.00,
      "incomeCount": 15,
      "expenseCount": 25,
      "avgIncome": 333.33,
      "avgExpense": 120.00
    },
    "byCategory": [
      {
        "category_name": "Salary",
        "type": "income",
        "total": 4000.00,
        "transaction_count": 2
      }
    ],
    "byMonth": [
      {
        "month": "2024-01",
        "month_name": "January 2024",
        "type": "income",
        "total": 2500.00,
        "transaction_count": 8
      }
    ],
    "topCategories": [...],
    "largestTransactions": [...],
    "monthlyTrend": [...],
    "filters": {
      "startDate": "2024-01-01",
      "endDate": "2024-01-31"
    }
  },
  "message": "Financial report generated successfully"
}
```

### 2. Income vs Expense Comparison
**Endpoint:** `GET /api/reports/income-expense`

**Description:** Detailed comparison between income and expenses with ratios.

**Response:**
```json
{
  "success": true,
  "data": {
    "income": {
      "total": 5000.00,
      "count": 15,
      "average": 333.33
    },
    "expense": {
      "total": 3000.00,
      "count": 25,
      "average": 120.00
    },
    "netBalance": 2000.00,
    "ratio": 1.67
  },
  "message": "Income vs expense comparison generated successfully"
}
```

### 3. Category Analysis
**Endpoint:** `GET /api/reports/categories`

**Description:** Detailed breakdown by categories with top performers.

**Response:**
```json
{
  "success": true,
  "data": {
    "incomeCategories": [...],
    "expenseCategories": [...],
    "topIncomeCategories": [...],
    "topExpenseCategories": [...],
    "totalCategories": 12
  },
  "message": "Category analysis generated successfully"
}
```

### 4. Monthly Trends
**Endpoint:** `GET /api/reports/monthly-trends`

**Description:** Monthly financial trends over the last 12 months.

**Response:**
```json
{
  "success": true,
  "data": {
    "monthlyData": [
      {
        "month": "2024-01",
        "month_name": "January 2024",
        "income": 2500.00,
        "expense": 1500.00,
        "net": 1000.00
      }
    ],
    "totalMonths": 12,
    "averageMonthlyIncome": 2500.00,
    "averageMonthlyExpense": 1500.00
  },
  "message": "Monthly trends generated successfully"
}
```

### 5. Spending Insights
**Endpoint:** `GET /api/reports/spending-insights`

**Description:** Behavioral insights and spending patterns.

**Response:**
```json
{
  "success": true,
  "data": {
    "largestTransactions": [...],
    "topCategories": [...],
    "averageTransactionSize": {
      "income": 333.33,
      "expense": 120.00
    },
    "transactionFrequency": {
      "income": 15,
      "expense": 25
    },
    "spendingPatterns": {
      "totalSpent": 3000.00,
      "totalEarned": 5000.00,
      "savingsRate": 40.00
    }
  },
  "message": "Spending insights generated successfully"
}
```

## Usage Examples

### Get financial report for last month
```bash
curl -X GET "http://localhost:3000/api/reports/financial?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer <your-token>"
```

### Get category analysis for specific categories
```bash
curl -X GET "http://localhost:3000/api/reports/categories?categoryIds[]=1&categoryIds[]=2" \
  -H "Authorization: Bearer <your-token>"
```

### Get spending insights for current year
```bash
curl -X GET "http://localhost:3000/api/reports/spending-insights?startDate=2024-01-01" \
  -H "Authorization: Bearer <your-token>"
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Validation failed",
  "message": "Invalid date format"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Authentication required",
  "message": "No token provided"
}
```

### 429 Too Many Requests
```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "message": "Too many report requests"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Failed to generate report",
  "message": "Database connection error"
}
```

## Performance Considerations

1. **Date Range Filtering**: Always use date filters for large datasets
2. **Caching**: Consider implementing client-side caching for reports
3. **Pagination**: For very large datasets, consider implementing pagination
4. **Background Processing**: For complex reports, consider async processing

## Data Accuracy

- All reports are generated in real-time from transaction data
- No data duplication or sync issues
- Reports reflect the current state of transactions
- Historical data is preserved and accurate

## Security Features

- JWT authentication required
- Rate limiting to prevent abuse
- Input validation for all parameters
- SQL injection protection through parameterized queries
- User-specific data filtering (when implemented)

## Future Enhancements

1. **Export Functionality**: PDF/Excel export capabilities
2. **Scheduled Reports**: Email delivery of periodic reports
3. **Custom Dashboards**: User-defined report combinations
4. **Advanced Analytics**: Machine learning insights
5. **Real-time Updates**: WebSocket-based live updates 