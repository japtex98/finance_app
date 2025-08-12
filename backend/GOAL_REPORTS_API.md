# Goal Reports API Documentation

This document describes the comprehensive goal and goal transaction reporting system for the Finance App backend. All reports are generated dynamically from goal and transaction data.

## Overview

The goal reporting system provides detailed insights into savings goals, progress tracking, risk assessment, and completion forecasting. All reports support filtering by date range and goal status.

## Base URL
```
/api/goal-reports
```

## Authentication
All goal report endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Rate Limiting
Goal report endpoints have rate limiting (50 requests per 15 minutes) due to their resource-intensive nature.

## Available Goal Reports

### 1. Goal Overview Report
**Endpoint:** `GET /api/goal-reports/overview`

**Description:** Comprehensive overview of all goals with detailed statistics and progress tracking.

**Query Parameters:**
- `startDate` (optional): Start date filter (ISO 8601 format)
- `endDate` (optional): End date filter (ISO 8601 format)
- `status` (optional): Goal status filter ('active', 'completed', 'cancelled')

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalGoals": 10,
      "activeGoals": 7,
      "completedGoals": 2,
      "cancelledGoals": 1,
      "totalGoalAmount": 50000.00,
      "totalSavedAmount": 25000.00,
      "overallProgress": 50.00,
      "averageProgress": 45.50
    },
    "goals": [
      {
        "id": 1,
        "name": "Vacation Fund",
        "goal_amount": 5000.00,
        "saved_amount": 3000.00,
        "progress": 60.00,
        "daysRemaining": 45,
        "isOverdue": false,
        "isOnTrack": true,
        "transactions": [...],
        "totalContributed": 3000.00,
        "transactionCount": 12
      }
    ],
    "goalsByStatus": {
      "active": [...],
      "completed": [...],
      "cancelled": [...]
    },
    "topPerformingGoals": [...],
    "goalsAtRisk": [...],
    "monthlyContributions": [...]
  },
  "message": "Goal overview report generated successfully"
}
```

### 2. Goal Transaction Analysis
**Endpoint:** `GET /api/goal-reports/transactions`

**Description:** Detailed analysis of goal contributions and transaction patterns.

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalTransactions": 150,
      "totalContributed": 25000.00,
      "averageContribution": 166.67,
      "recentActivityCount": 25,
      "recentActivityTotal": 5000.00
    },
    "transactions": [...],
    "largestContributions": [...],
    "recentActivity": [...],
    "contributionsByGoal": [...],
    "monthlyTrends": [...],
    "contributionFrequency": [...]
  },
  "message": "Goal transaction analysis generated successfully"
}
```

### 3. Goal Progress Tracking
**Endpoint:** `GET /api/goal-reports/progress`

**Description:** Detailed progress tracking with time-based analysis and forecasting.

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalGoals": 10,
      "activeGoals": 7,
      "onTrackGoals": 5,
      "behindGoals": 2,
      "completedGoals": 2,
      "averageProgress": 45.50,
      "averageTimeProgress": 60.00
    },
    "progressData": [
      {
        "goalId": 1,
        "goalName": "Vacation Fund",
        "goalAmount": 5000.00,
        "savedAmount": 3000.00,
        "progress": 60.00,
        "timeProgress": 75.00,
        "daysRemaining": 45,
        "requiredDailySavings": 44.44,
        "actualDailyAverage": 50.00,
        "isOnTrack": true
      }
    ],
    "onTrackGoals": [...],
    "behindGoals": [...],
    "completedGoals": [...]
  },
  "message": "Goal progress tracking generated successfully"
}
```

### 4. Goals at Risk
**Endpoint:** `GET /api/goal-reports/at-risk`

**Description:** Identifies goals that are at risk of not being completed on time.

**Response:**
```json
{
  "success": true,
  "data": {
    "atRiskGoals": [
      {
        "goalId": 2,
        "goalName": "Emergency Fund",
        "goalAmount": 10000.00,
        "savedAmount": 2000.00,
        "progress": 20.00,
        "daysRemaining": 15,
        "isOverdue": false,
        "requiredDailySavings": 533.33,
        "riskLevel": "critical"
      }
    ],
    "totalAtRisk": 3,
    "criticalRisk": 1,
    "highRisk": 1,
    "mediumRisk": 1
  },
  "message": "Goals at risk analysis generated successfully"
}
```

### 5. Top Performing Goals
**Endpoint:** `GET /api/goal-reports/top-performers`

**Description:** Shows the best performing goals based on progress and completion rates.

**Response:**
```json
{
  "success": true,
  "data": {
    "topPerformers": [
      {
        "goalId": 1,
        "goalName": "Vacation Fund",
        "goalAmount": 5000.00,
        "savedAmount": 3000.00,
        "progress": 60.00,
        "daysRemaining": 45,
        "transactionCount": 12,
        "averageContribution": 250.00,
        "completionRate": 0.60
      }
    ],
    "totalTopPerformers": 5,
    "averageProgress": 65.50
  },
  "message": "Top performing goals analysis generated successfully"
}
```

### 6. Goal Contribution Trends
**Endpoint:** `GET /api/goal-reports/contribution-trends`

**Description:** Monthly and daily contribution patterns and trends.

**Response:**
```json
{
  "success": true,
  "data": {
    "monthlyTrends": [
      {
        "month": "2024-01",
        "month_name": "January 2024",
        "total_contributed": 5000.00,
        "transaction_count": 30,
        "avg_contribution": 166.67
      }
    ],
    "contributionFrequency": [...],
    "averageMonthlyContribution": 5000.00,
    "totalMonths": 6,
    "recentActivity": {
      "count": 25,
      "total": 5000.00,
      "average": 200.00
    }
  },
  "message": "Goal contribution trends generated successfully"
}
```

### 7. Goal Completion Forecast
**Endpoint:** `GET /api/goal-reports/completion-forecast`

**Description:** Predicts completion dates and success probability for active goals.

**Response:**
```json
{
  "success": true,
  "data": {
    "forecasts": [
      {
        "goalId": 1,
        "goalName": "Vacation Fund",
        "goalAmount": 5000.00,
        "savedAmount": 3000.00,
        "remainingAmount": 2000.00,
        "progress": 60.00,
        "daysRemaining": 45,
        "actualDailyAverage": 50.00,
        "requiredDailySavings": 44.44,
        "estimatedCompletionDate": "2024-03-15T00:00:00.000Z",
        "estimatedDaysToComplete": 40,
        "isOnTrack": true,
        "completionProbability": "high"
      }
    ],
    "summary": {
      "totalGoals": 7,
      "onTrackGoals": 5,
      "highProbability": 5,
      "mediumProbability": 1,
      "lowProbability": 1,
      "averageEstimatedDays": 35
    }
  },
  "message": "Goal completion forecast generated successfully"
}
```

## Usage Examples

### Get goal overview for current year
```bash
curl -X GET "http://localhost:3000/api/goal-reports/overview?startDate=2024-01-01" \
  -H "Authorization: Bearer <your-token>"
```

### Get goals at risk
```bash
curl -X GET "http://localhost:3000/api/goal-reports/at-risk" \
  -H "Authorization: Bearer <your-token>"
```

### Get completion forecast for active goals
```bash
curl -X GET "http://localhost:3000/api/goal-reports/completion-forecast" \
  -H "Authorization: Bearer <your-token>"
```

### Get transaction analysis for completed goals
```bash
curl -X GET "http://localhost:3000/api/goal-reports/transactions?status=completed" \
  -H "Authorization: Bearer <your-token>"
```

## Key Metrics Explained

### Progress Metrics
- **Progress**: Percentage of goal amount saved (saved_amount / goal_amount * 100)
- **Time Progress**: Percentage of time elapsed (elapsed_days / total_days * 100)
- **Days Remaining**: Days left until goal deadline
- **Is On Track**: Whether current savings rate meets required rate

### Risk Assessment
- **Critical Risk**: Goals with ≤7 days remaining and <50% progress
- **High Risk**: Goals with ≤30 days remaining and <50% progress
- **Medium Risk**: Goals with ≤60 days remaining and <50% progress

### Completion Forecasting
- **Estimated Completion Date**: Based on current daily average
- **Completion Probability**: 
  - High: On track or close to required rate
  - Medium: Within 80% of required rate
  - Low: Below 80% of required rate

## Performance Considerations

1. **Date Range Filtering**: Use date filters for large datasets
2. **Status Filtering**: Filter by status to reduce data processing
3. **Caching**: Consider client-side caching for frequently accessed reports
4. **Pagination**: For very large datasets, consider implementing pagination

## Data Accuracy

- All reports are generated in real-time from goal and transaction data
- Progress calculations are based on actual saved amounts
- Time-based calculations use current date for accuracy
- Risk assessments are updated daily

## Security Features

- JWT authentication required
- Rate limiting to prevent abuse
- Input validation for all parameters
- SQL injection protection through parameterized queries

## Future Enhancements

1. **Goal Templates**: Predefined goal categories and amounts
2. **Social Features**: Goal sharing and collaboration
3. **Milestone Tracking**: Intermediate goal checkpoints
4. **Automated Alerts**: Notifications for goals at risk
5. **Goal Recommendations**: AI-powered goal suggestions
6. **Export Functionality**: PDF/Excel export of goal reports 