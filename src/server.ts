import { FastMCP } from "fastmcp";
import { z } from "zod";

import { calculateMathExpression } from "./simple-math.js";

// ポート番号を環境変数または引数から取得
const PORT = process.env.PORT
  ? parseInt(process.env.PORT, 10)
  : process.argv[2]
    ? parseInt(process.argv[2], 10)
    : 3000;

// ホスト設定 - 情報表示用（コンテナ内では0.0.0.0にバインド）
const HOST = process.env.HOST || "0.0.0.0";

const server = new FastMCP({
  name: "simple-math",
  version: "0.0.1",
});

server.addTool({
  annotations: {
    openWorldHint: false, // This tool doesn't interact with external systems
    readOnlyHint: true, // This tool doesn't modify anything
    title: "calculate-math",
  },
  description: "Calculate the result of a simple mathematical expression (including parentheses)",
  execute: async (args) => {
    try {
      const result = calculateMathExpression(args.expression);
      // 数値を文字列に変換して返す
      return result.toString();
    } catch (error) {
      return "Error: " + (error as Error).message;
    }
  },
  name: "calculate-math",
  parameters: z.object({
    expression: z
      .string()
      .describe(
        "Mathematical expression to calculate. Only math expressions are supported (+, -, *, /, parentheses, and decimal numbers)",
      ),
  }),
});

server.addResource({
  async load() {
    return {
      text: "Simple Math MCP Server - Calculates mathematical expressions",
    };
  },
  mimeType: "text/plain",
  name: "Service Information",
  uri: "file:///info/service.txt",
});

// FastMCPがホストをオプションで設定できない場合でも、
// 内部的にはコンテナ内のすべてのインターフェースにバインドされる
server.start({
  httpStream: {
    endpoint: "/",
    port: PORT,
  },
  transportType: "httpStream",
});

console.log(`Server started on port ${PORT}`);
console.log(`Container access URL: http://${HOST}:${PORT}/`);
console.log(`Local access URL: http://localhost:${PORT}/`);
