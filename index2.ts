import { NeuroLink } from "@juspay/neurolink";
import { z } from "zod";

function extractJsonBlock(text: string): any | null {
  const match = text.match(/```(?:json)?\s*({[\s\S]+?})\s*```/);
  if (!match || !match[1]) return null;
  try {
    return JSON.parse(match[1]);
  } catch (e) {
    console.warn("Failed to parse JSON block:", e);
    return null;
  }
}

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

        Please use any model to analyze this data and return the result.
    `;

  const result = await neurolink.generate({
    input: { text: prompt },
    provider: "googlevertex",
    model: "gemini-2.5-flash",
  });

  const content = result.content;
  console.log("LLM output content:\n", content);

  const jsonBlock = extractJsonBlock(content);

  let metrics: { method: string; amount: number }[] = [];
  if (jsonBlock?.metrics && Array.isArray(jsonBlock.metrics)) {
    const methodMap = new Map(financialData.map(f => [f.method.toLowerCase(), f.amount]));
    metrics = jsonBlock.metrics
        .filter((m: any) => typeof m.method === 'string')
        .map((m: any) => {
        const amount = methodMap.get(m.method.toLowerCase()) ?? 0;
        return { method: m.method, amount };
        })
        .filter((m: { method: string; amount: number }) => m.method.toLowerCase() !== "total revenue");
    }

  if (metrics.length === 0) {
    const lines = content.split("\n");
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
          method.toLowerCase() !== "total revenue" &&
          method.toLowerCase() !== "total amount"
        ) {
          metrics.push({ method, amount });
        }
      }
    }

    if (metrics.length === 0) {
      metrics = financialData;
    }
  }

  const total = metrics.reduce((sum, item) => sum + item.amount, 0);

  let raw = metrics.map(item => ({
    method: item.method,
    rawPercentage: (item.amount / total) * 100,
  }));

  let rounded = raw.map(item => ({
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
  if (metrics.length > 5) chartType = "bar chart";
  else if (Math.max(...raw.map(r => r.rawPercentage)) > 70) chartType = "donut chart";

  const output = {
    graphType: chartType,
    totalAmount: total,
    metrics: rounded,
  };

  console.log(JSON.stringify(output, null, 2));
}

main().catch(console.error);
