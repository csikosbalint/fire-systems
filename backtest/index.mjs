import { mySharpePort } from "@csikosbalint/fire-app/ports";
import { historicalDataPort } from "@csikosbalint/fire-app/ports/server";
import { writeFileSync } from "fs";
import {
  SSMClient,
  GetParameterCommand,
  PutParameterCommand,
} from "@aws-sdk/client-ssm";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

// yahoo: symbol used for Yahoo Finance API download
// output: symbol used in output.csv (backtest tool convention)
const TICKERS = [
  { yahoo: "IGLN.L", output: "IGLN:GB" }, // gold etf in USD
  { yahoo: "XSLR.L", output: "XSLR:GB" }, // silver etf in USD
  { yahoo: "IUES.L", output: "IUES:GB" }, // US energy etf in USD
  { yahoo: "IUIT.L", output: "IUIT:GB" }, // US it etf in USD
  { yahoo: "IUFS.L", output: "IUFS:GB" }, // US financials etf in USD
  { yahoo: "IEMB.L", output: "IEMB:GB" }, // emerging markets bonds etf in USD
  { yahoo: "IDTM.L", output: "IDTM:GB" }, // developed markets bonds etf in USD
];
const LOOKBACK = 125; // ~1 year of trading days for sharpeRatio calculation
const COOLDOWN_DAYS = 22; // ~1 month of trading days
const YEARS_OF_DATA = 10; // how many years of historical data to fetch (must be > LOOKBACK)
const OUTPUT_FILE = `./allocations/${Date.now().toString()}output_${YEARS_OF_DATA}_${LOOKBACK}_${COOLDOWN_DAYS}.csv`;

async function main() {
  const { augment } = mySharpePort();
  const { retrieve } = historicalDataPort();
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - YEARS_OF_DATA);
  const endDate = new Date();

  // Phase 1 — fetch and augment all tickers in parallel (fix: forEach + async doesn't await)
  const tickerData = await Promise.all(
    TICKERS.map(async ({ yahoo, output }) => {
      const raw = await retrieve({ ticker: yahoo, startDate, endDate });
      const records = await augment({ data: raw, lookback: LOOKBACK });
      return { key: output, records }; // key = output symbol used throughout
    }),
  );

  // Phase 2 — build a date-indexed lookup: dateMap[dateStr][outputSymbol] = record
  const dateSet = new Set();
  for (const { records } of tickerData) {
    for (const r of records) {
      dateSet.add(new Date(r.date).toISOString().split("T")[0]);
    }
  }
  const sortedDates = [...dateSet].sort(); // ISO strings sort chronologically

  const dateMap = {};
  for (const { key, records } of tickerData) {
    for (const r of records) {
      const d = new Date(r.date).toISOString().split("T")[0];
      if (!dateMap[d]) dateMap[d] = {};
      dateMap[d][key] = r; // full record for debugging
    }
  }

  // Phase 3 — winner selection with 30-trading-day cooldown
  let currentWinner = null;
  let cooldownRemaining = 0;
  const changes = []; // { date: string (YYYY-MM-DD), winner: string }

  for (const date of sortedDates) {
    const sharpes = dateMap[date] ?? {};

    const outputKeys = TICKERS.map((t) => t.output);

    // Skip dates where no ticker has a real sharpeRatio (warmup period)
    if (outputKeys.every((k) => sharpes[k]?.sharpeRatio == null)) continue;

    // Find best ticker; undefined/missing sharpeRatio treated as -Infinity
    const bestTicker = outputKeys.reduce((best, key) => {
      const s = sharpes[key]?.sharpeRatio ?? -Infinity;
      const bestS = sharpes[best]?.sharpeRatio ?? -Infinity;
      return s > bestS ? key : best;
    });

    if (cooldownRemaining > 0) {
      cooldownRemaining--;
    } else if (bestTicker !== currentWinner) {
      changes.push({ date, winner: bestTicker });
      currentWinner = bestTicker;
      cooldownRemaining = COOLDOWN_DAYS;
    }
  }

  return {
    changes,
    currentWinner,
    cooldownRemaining,
  };
}

const SSM_PARAM = "/alerts/bestTicker";
const SNS_TOPIC_ARN = "arn:aws:sns:eu-west-1:327953370525:Alerts";

export const handler = async (event, context) => {
  const { changes, currentWinner, cooldownRemaining } = await main();

  const ssm = new SSMClient();

  // Read current SSM value
  let previousWinner = null;
  try {
    const { Parameter } = await ssm.send(
      new GetParameterCommand({ Name: SSM_PARAM }),
    );
    previousWinner = Parameter.Value;
  } catch (err) {
    if (err.name !== "ParameterNotFound") throw err;
  }

  if (currentWinner === previousWinner) {
    console.log(`No change: ${SSM_PARAM} is already ${currentWinner}`);
    return { currentWinner, cooldownRemaining, changed: false };
  }

  // Publish SNS alert
  const sns = new SNSClient({ region: "eu-west-1" });
  await sns.send(
    new PublishCommand({
      TopicArn: SNS_TOPIC_ARN,
      Subject: "Best Ticker Changed",
      Message: `Best ticker changed from ${previousWinner} to ${currentWinner}.`,
    }),
  );
  console.log(`SNS alert published: ${previousWinner} → ${currentWinner}`);

  // Update SSM param
  await ssm.send(
    new PutParameterCommand({
      Name: SSM_PARAM,
      Value: currentWinner,
      Type: "String",
      Overwrite: true,
    }),
  );
  console.log(`SSM ${SSM_PARAM} updated to: ${currentWinner}`);

  return { currentWinner, cooldownRemaining, changed: true };
};

export const local = async () => {
  const { changes, currentWinner, cooldownRemaining } = await main();
  const outputKeys = TICKERS.map((t) => t.output);
  const header = ["Start Date", ...outputKeys].join(",");
  const rows = changes.map(({ date, winner }) => {
    // Format date as MM/DD/YYYY
    const [y, m, d] = date.split("-");
    const formattedDate = `${m}/${d}/${y}`;
    const cols = outputKeys.map((k) => (k === winner ? "100%" : ""));
    return [formattedDate, ...cols].join(",");
  });
  const csv = [header, ...rows].join("\n") + "\n";

  writeFileSync(OUTPUT_FILE, csv);
  console.log(`Written to ${OUTPUT_FILE}`);
  console.log(`Current winner: ${currentWinner}`);
  console.log(`Cooldown remaining: ${cooldownRemaining} days`);
};
