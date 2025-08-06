# 💸 Financial Data Analyzer with NeuroLink (LLM + Fallback)

This project uses Juspay’s [`@juspay/neurolink`](https://github.com/juspay/neurolink) to analyze financial transaction data using a Large Language Model (LLM). It handles LLM outputs intelligently, supports fallback logic, and ensures clean, consistent output for graphing.

---

## 📁 Project Structure

### `index.ts`
> 🎯 Main entry point — calls the LLM to analyze financial data and produces a cleaned JSON output.

- Sends financial data to `Gemini 2.5 Flash` model via `@juspay/neurolink`.
- Expects a structured JSON response (`graphType`, `metrics`, `totalAmount`).
- If LLM fails or outputs invalid/messy content:
  - A robust **fallback mechanism** parses or reconstructs data based on original input.
- Corrects:
  - Misleading metrics (like "Total Revenue")
  - Rounding errors in percentages
  - Inconsistent totals

---

### `index2.ts`
> 🧠 Enhanced version — focuses on extracting and parsing extra **LLM-generated insights**, along with metrics.

- Parses rich LLM explanations (observations, breakdowns, etc.)
- Extracts and displays:
  - Clean metrics
  - Graph type
  - Total amount
  - LLM commentary (e.g., "UPI is the second most used method.")
- Ideal for deeper analysis and debugging LLM behavior

---

## 🚀 Scripts

| Command              | Description                              |
|----------------------|------------------------------------------|
| `npm start`          | Runs the main analyzer (`index.ts`)      |
| `npm run start:alt`  | Runs the enhanced analyzer (`index2.ts`) |

---

## 🧰 Requirements

- Node.js `>= 18.x`
- Juspay’s `@juspay/neurolink` SDK installed and configured
- Access to Google Vertex AI with the Gemini model enabled

---

## 🔒 Output Format

Both versions aim to return a valid JSON object:

```json
{
  "graphType": "pie chart",
  "totalAmount": 300000,
  "metrics": [
    { "method": "UPI", "percentage": 23 },
    { "method": "Net banking", "percentage": 33 },
    ...
  ]
}
