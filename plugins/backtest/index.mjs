import { mySharpePort } from "@csikosbalint/fire-app/ports";
import { historicalDataPort } from "@csikosbalint/fire-app/ports/server";
import { writeFileSync } from "fs";
import {
  SSMClient,
  GetParameterCommand,
  PutParameterCommand,
} from "@aws-sdk/client-ssm";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

// yahoo: symbol used for Yahoo Finance API download - https://finance.yahoo.com/
// portfoliovisualizer: symbol used in output.csv (backtest tool convention) - https://www.portfoliovisualizer.com/
const TICKERS = [
  { yahoo: "IGLN.L", portfoliovisualizer: "IGLN:GB", profit: "acc", desc: "gold", class: "commodities", currency: "USD", market: "LSE" },
  { yahoo: "IUES.L", portfoliovisualizer: "IUES:GB", profit: "acc", desc: "s&p energy sector", class: "stock", currency: "USD", market: "LSE" },
  { yahoo: "IUIT.L", portfoliovisualizer: "IUIT:GB", profit: "acc", desc: "s&p infotech sector", class: "stocks", currency: "USD", market: "LSE" },
  { yahoo: "IUFS.L", portfoliovisualizer: "IUFS:GB", profit: "acc", desc: "s&p finance sector", class: "stocks", currency: "USD", market: "LSE" },
  { inPortfolio: [
      { start: "2026-10-08"}
    ], yahoo: "IUHC.L", portfoliovisualizer: "IUHC:GB", profit: "acc", desc: "s&p healthcare sector", class: "stocks", currency: "USD", market: "LSE"},
  { yahoo: "IEMB.L", portfoliovisualizer: "IEMB:GB", profit: "dist", desc: "emerging markets", class: "bonds", currency: "USD", market: "LSE" },
  { yahoo: "IDTM.L", portfoliovisualizer: "IDTM:GB", profit: "dist", desc: "developed markets", class: "bonds", currency: "USD", market: "LSE" },
];
const toDateStr = (d) => new Date(d).toISOString().split("T")[0];

function isInPortfolio({ inPortfolio }, dateStr) {
  if (!inPortfolio?.length) return true;
  return inPortfolio.some(
    ({ start, end } = {}) =>
      (start == null || dateStr >= toDateStr(start)) && (end == null || dateStr <= toDateStr(end)),
  );
}

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
    TICKERS.map(async ({ yahoo, portfoliovisualizer }) => {
      const raw = await retrieve({ ticker: yahoo, startDate, endDate });
      const records = await augment({ data: raw, lookback: LOOKBACK });
      return { key: portfoliovisualizer, records }; // key = portfoliovisualizer symbol used throughout
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

    const candidateKeys = TICKERS.filter((t) => isInPortfolio(t, date)).map((t) => t.portfoliovisualizer);

    // Skip dates where no ticker has a real sharpeRatio (warmup period)
    if (candidateKeys.every((k) => sharpes[k]?.sharpeRatio == null)) continue;

    // Find best ticker; undefined/missing sharpeRatio treated as -Infinity
    const bestTicker = candidateKeys.reduce((best, key) => {
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
const USERS_TOPIC_ARN = "arn:aws:sns:eu-west-1:327953370525:Users";

export const handler = async (event, context) => {
  const { changes, currentWinner, cooldownRemaining } = await main();

  const sns = new SNSClient({ region: "eu-west-1" });
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

  await sns.send(
    new PublishCommand({
      TopicArn: USERS_TOPIC_ARN,
      Subject: "bestTicker status",
      Message: `Current best ticker: ${currentWinner} (cooldown remaining: ${cooldownRemaining} days).`,
    }),
  );
  console.log(`SNS status published: currentWinner=${currentWinner}`);

  if (currentWinner === previousWinner) {
    console.log(`No change: ${SSM_PARAM} is already ${currentWinner}`);
    return { currentWinner, cooldownRemaining, changed: false };
  }

  // Publish SNS alert
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
  const portfoliovisualizerKeys = TICKERS.map((t) => t.portfoliovisualizer);
  const header = ["Start Date", ...portfoliovisualizerKeys].join(",");
  const rows = changes.map(({ date, winner }) => {
    // Format date as MM/DD/YYYY
    const [y, m, d] = date.split("-");
    const formattedDate = `${m}/${d}/${y}`;
    const cols = portfoliovisualizerKeys.map((k) => (k === winner ? "100%" : ""));
    return [formattedDate, ...cols].join(",");
  });
  const csv = [header, ...rows].join("\n") + "\n";

  writeFileSync(OUTPUT_FILE, csv);
  console.log(`Written to ${OUTPUT_FILE}`);
  console.log(`Current winner: ${currentWinner}`);
  console.log(`Cooldown remaining: ${cooldownRemaining} days`);
};
