import { createClient } from "@clickhouse/client";
import "dotenv/config";

export const clickhouse = createClient({
  url: `https://${process.env.CLICKHOUSE_HOST}:${process.env.CLICKHOUSE_PORT || 8443}`,
  username: process.env.CLICKHOUSE_USER,
  password: process.env.CLICKHOUSE_PASSWORD,
  database: process.env.CLICKHOUSE_DATABASE,
});