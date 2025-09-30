# 🔍 Financial Agent - Complete End-to-End Explanation

## Overview
This repository contains a **Financial Data Analyzer** that leverages AI (specifically Google's Gemini model) to analyze financial transaction data and generate structured insights for data visualization. The project uses Juspay's NeuroLink SDK to interface with Large Language Models (LLMs) and includes robust fallback mechanisms to ensure reliable output.

## 📊 What the Application Does

The financial agent takes raw financial transaction data (payment methods and amounts) and transforms it into a structured format suitable for creating charts and visualizations. It analyzes spending patterns, calculates percentages, and recommends appropriate chart types.

## 🏗️ Architecture Overview

```
Financial Data Input → LLM Analysis → JSON Parsing → Fallback Logic → Clean Output
```

## 📁 Project Structure

### Core Files:
- **`index.ts`** - Main implementation with robust error handling
- **`index2.ts`** - Enhanced version with detailed LLM output analysis  
- **`package.json`** - Node.js dependencies and scripts
- **`tsconfig.json`** - TypeScript configuration
- **`README.md`** - Project documentation

## 🔄 End-to-End Workflow

### 1. Data Input Phase
Both implementations start with the same hardcoded financial data:

```typescript
const financialData = [
  { method: "UPI", amount: 70000 },
  { method: "Net banking", amount: 100000 },
  { method: "Cash", amount: 30000 },
  { method: "Card", amount: 50000 },
  { method: "Wallet", amount: 50000 },
];
```

**Total Amount**: ₹300,000

### 2. LLM Integration Phase

#### NeuroLink Setup:
- Creates a `NeuroLink` instance from `@juspay/neurolink`
- Configured to use Google Vertex AI with Gemini 2.5 Flash model
- Requires Google Cloud authentication credentials

#### Prompt Engineering:
- **index.ts**: Sends specific instructions asking for JSON output with `graphType`, `totalAmount`, and `metrics`
- **index2.ts**: Uses a more open-ended prompt asking the model to analyze the data

### 3. LLM Response Processing

#### Expected Output Format:
```json
{
  "graphType": "pie chart",
  "totalAmount": 300000,
  "metrics": [
    { "method": "UPI", "percentage": 23 },
    { "method": "Net banking", "percentage": 33 },
    { "method": "Cash", "percentage": 10 },
    { "method": "Card", "percentage": 17 },
    { "method": "Wallet", "percentage": 17 }
  ]
}
```

### 4. JSON Extraction & Parsing

Both implementations include a `extractJsonBlock()` function that:
- Uses regex to find JSON code blocks in LLM responses
- Handles cases where JSON is wrapped in ```json code blocks
- Gracefully handles parsing errors

### 5. Data Cleaning & Validation

#### Common Cleaning Steps:
- **Filter out unwanted entries**: Removes "Total Revenue" or "Total Amount" from metrics
- **Recalculate totals**: Ensures accuracy by recalculating from original data
- **Percentage rounding**: Handles rounding errors to ensure percentages sum to 100%

#### Rounding Logic:
```typescript
// Calculate raw percentages
let raw = data.map(item => ({
  method: item.method,
  rawPercentage: (item.amount / total) * 100,
}));

// Round percentages
let rounded = raw.map(item => ({
  method: item.method,
  percentage: Math.round(item.rawPercentage),
}));

// Adjust for rounding differences
let diff = 100 - rounded.reduce((sum, item) => sum + item.percentage, 0);
// Add difference to the largest percentage
```

### 6. Chart Type Determination

Smart logic to recommend appropriate visualization:

```typescript
let chartType = "pie chart"; // Default

if (data.length > 5) {
  chartType = "bar chart"; // Too many categories for pie chart
} else if (Math.max(...percentages) > 70) {
  chartType = "donut chart"; // One dominant category
}
```

### 7. Fallback Mechanisms

If LLM fails or returns invalid data, both implementations have fallback strategies:

#### index.ts Fallback:
- Parses LLM text output using regex patterns
- Looks for patterns like `**Method Name: **₹Amount`
- Falls back to original data if parsing fails
- Calculates percentages manually

#### index2.ts Fallback:
- Similar text parsing approach
- More sophisticated regex handling
- Always falls back to original financial data if needed

### 8. Output Generation

#### index.ts Output:
- Clean JSON structure
- Pretty-printed breakdown with emojis
- Detailed console output for debugging

#### index2.ts Output:
- Simplified JSON output
- Raw LLM content display for analysis
- Focus on data extraction efficiency

## 🔧 Technical Implementation Details

### Dependencies:
- **@juspay/neurolink**: LLM integration SDK
- **typescript**: Type safety and compilation
- **ts-node**: Direct TypeScript execution
- **zod**: Runtime type validation (imported but not used)

### Environment Requirements:
- Node.js >= 18.x
- Google Cloud credentials for Vertex AI
- Environment variables for authentication

### Authentication Options:
1. `GOOGLE_APPLICATION_CREDENTIALS` - Path to service account JSON
2. `GOOGLE_SERVICE_ACCOUNT_KEY` - Base64 encoded key
3. Individual credentials (`GOOGLE_AUTH_CLIENT_EMAIL`, `GOOGLE_AUTH_PRIVATE_KEY`)

## 🚀 Running the Applications

### Main Application:
```bash
npm start
# Runs index.ts with structured prompts and detailed output
```

### Enhanced Application:
```bash
npm run start:alt  
# Runs index2.ts with open-ended prompts and raw analysis
```

## 🎯 Key Differences Between Implementations

| Feature | index.ts | index2.ts |
|---------|----------|-----------|
| **Prompt Style** | Structured, specific instructions | Open-ended analysis request |
| **Output Detail** | Rich console output with emojis | Simple JSON output |
| **LLM Content** | Hidden by default (commented) | Always displayed |
| **Error Handling** | Comprehensive fallback logic | Streamlined fallback |
| **Purpose** | Production-ready with user-friendly output | Development/debugging focused |

## 🔍 Error Handling Strategy

1. **LLM Provider Errors**: Clear error messages for missing credentials
2. **JSON Parsing Errors**: Graceful fallback to text parsing
3. **Data Validation**: Filters and validates all extracted metrics
4. **Mathematical Accuracy**: Ensures percentages always sum to 100%

## 📈 Use Cases

This financial agent is designed for:
- **Financial dashboards** - Converting transaction data to chart-ready format
- **Spending analysis** - Automated categorization and percentage calculation  
- **Report generation** - Structured data for financial reports
- **Data visualization** - Recommending appropriate chart types based on data distribution

## 🔮 Future Enhancements

Potential improvements could include:
- Support for multiple LLM providers
- Dynamic financial data input (APIs, file uploads)
- More sophisticated chart type recommendations
- Real-time data processing capabilities
- Custom visualization templates

This financial agent represents a practical example of combining AI capabilities with traditional data processing to create reliable, production-ready financial analysis tools.