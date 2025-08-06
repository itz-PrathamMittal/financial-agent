import { NeuroLink } from "@juspay/neurolink";
import { z } from "zod";

async function main() {
  const neurolink = new NeuroLink();

  const financialData = [
    { method: "UPI", amount: 70000 },
    { method: "Net banking", amount: 100000 },
    { method: "Cash", amount: 30000 },
    { method: "Card", amount: 50000 },
    { method: "Wallet", amount: 50000 },
  ];

  const prompt = `
    Financial data: ${JSON.stringify(financialData)}

    Analyze this data and return a JSON object with:
    - graphType (pie chart, bar chart, or donut chart)
    - totalAmount (sum of all method amounts)
    - metrics: array of { method, percentage }

    Do NOT include "Total Revenue" as a separate metric.
    Only include individual payment methods in the metrics array.
    Return only the JSON output inside a code block like \`\`\`json.
  `;

  const result = await neurolink.generate({
    input: { text: prompt },
    provider: "googlevertex",
    model: "gemini-2.5-flash",
  });

  // ---- LLM Response Parsing ----
  const content = result.content;
//   console.log("LLM output content:\n", content);

  function extractJsonBlock(text: string): any | null {
    const match = text.match(/```(?:json)?\s*({[\s\S]+?})\s*```/);
    const jsonString = match?.[1];
    if (!jsonString) return null;
    try {
        return JSON.parse(jsonString);
    } catch (e) {
        console.warn("Failed to parse JSON block:", e);
        return null;
    }
    }


  const parsedJson = extractJsonBlock(content);

  if (parsedJson && parsedJson.metrics) {
    // Remove any unwanted entries like "Total Revenue"
    parsedJson.metrics = parsedJson.metrics.filter(
      (m: any) => m.method.toLowerCase() !== "total revenue"
    );

    // Recalculate total if needed
    parsedJson.totalAmount = financialData.reduce(
      (sum, item) => sum + item.amount,
      0
    );

    // ✅ Final JSON Output
    console.log("\nClean JSON Output:");
    console.log(JSON.stringify(parsedJson, null, 2));

    // 🧼 Optional: Pretty Display
    console.log("\n📊 Graph Type:", parsedJson.graphType);
    console.log("💰 Total Amount:", parsedJson.totalAmount);
    console.log("📈 Breakdown:");
    for (const metric of parsedJson.metrics) {
      console.log(`- ${metric.method}: ${metric.percentage}%`);
    }

    return;
  }

  // ---- Fallback: Manual Parsing if JSON not returned ----
  console.warn("\n⚠️ Falling back to manual parsing...");

  const lines = content.split("\n");
  const metrics: { method: string; amount: number }[] = [];

  const regex = /\*\*\s*([\w\s]+):\s*\*\*\s*₹?\s*([\d,]+(?:\.\d+)?)/i;

  for (const line of lines) {
    const match = line.match(regex);
    if (match && match.length >= 3) {
      const method = match[1]?.trim();
      const amountStr = match[2]?.replace(/,/g, "");
      const amount = amountStr ? parseFloat(amountStr) : 0;

      if (
        method &&
        amount > 0 &&
        method.toLowerCase() !== "total amount" &&
        method.toLowerCase() !== "total revenue"
      ) {
        metrics.push({ method, amount });
      }
    }
  }

  const fallbackData = metrics.length > 0 ? metrics : financialData;

  const total = fallbackData.reduce((sum, item) => sum + item.amount, 0);

  let raw = fallbackData.map((item) => ({
    method: item.method,
    rawPercentage: (item.amount / total) * 100,
  }));

  let rounded = raw.map((item) => ({
    method: item.method,
    percentage: Math.round(item.rawPercentage),
  }));

  let diff = 100 - rounded.reduce((sum, item) => sum + item.percentage, 0);
  if (diff !== 0 && rounded.length > 0) {
      const maxIndex = rounded.reduce((maxIdx, item, idx, arr) => {
        const currentMax = arr[maxIdx];
        if (!currentMax) return idx;
        return item.percentage > currentMax.percentage ? idx : maxIdx;
      }, 0);
      if (rounded[maxIndex]) {
        rounded[maxIndex].percentage += diff;
      }
  }

  let chartType = "pie chart";
  if (fallbackData.length > 5) {
    chartType = "bar chart";
  } else {
    const maxRaw = Math.max(...raw.map((r) => r.rawPercentage));
    if (maxRaw > 70) {
      chartType = "donut chart";
    }
  }

  const output = {
    graphType: chartType,
    totalAmount: total,
    metrics: rounded,
  };

  console.log("\nClean JSON Output (Fallback):");
  console.log(JSON.stringify(output, null, 2));
}

main().catch(console.error);
