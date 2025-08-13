#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import fetch from "node-fetch";
import { zodToJsonSchema } from "zod-to-json-schema";
import {
  FinancialPlannerRequestSchema,
  FinancialPlannerResponseSchema,
  type FinancialPlannerRequest,
  type ScripboxAPIRequest,
} from "./schemas.js";

// Server configuration
const SERVER_VERSION = "1.0.0";

const server = new Server(
  {
    name: "financial-planner-mcp-server",
    version: SERVER_VERSION,
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Scripbox API configuration
const SCRIPBOX_BASE_URL = "https://invest.scripbox.com/api";
const FINANCIAL_PLANNER_ENDPOINT = `${SCRIPBOX_BASE_URL}/possibility/new`;

// Helper function to calculate investment end date (1 month before goal date)
function calculateInvestmentEndDate(goalDate: string): string {
  const date = new Date(goalDate);
  date.setMonth(date.getMonth() - 1);
  return date.toISOString().split('T')[0];
}

// Helper function to get today's date in YYYY-MM-DD format
function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

// Helper function to calculate end date for monthly inflows (30 years from start)
function calculateInflowEndDate(startDate: string): string {
  const date = new Date(startDate);
  date.setFullYear(date.getFullYear() + 30);
  return date.toISOString().split('T')[0];
}

// Transform user input to Scripbox API format
function transformToScripboxRequest(input: FinancialPlannerRequest): ScripboxAPIRequest {
  const investmentStartDate = input.investment_start_date || getTodayDate();
  const investmentEndDate = calculateInvestmentEndDate(input.goal_date);
  const inflowEndDate = calculateInflowEndDate(investmentStartDate);

  return {
    current_portfolio: [
      {
        amount: input.current_wealth,
        return_rate: input.return_rate,
        type: "All",
        locked_till: null,
        on_date: null,
      },
    ],
    goals: [
      {
        title: input.goal_name,
        priority: input.priority,
        outflow: {
          first_date: input.goal_date,
          per_year: 1,
          inflation_rate: input.inflation_rate,
          total_years: "1",
        },
        goal: {
          amount: input.goal_amount.toString(),
          on_date: null,
          inflation_rate: input.inflation_rate,
        },
        future_annual_contribution: "0",
        investment_end_date: investmentEndDate,
        scripbox_portfolio_return_rate: input.return_rate,
      },
    ],
    monthly_inflows: [
      {
        amount: input.monthly_inflow,
        start_date: investmentStartDate,
        end_date: inflowEndDate,
        return_rate: input.return_rate,
        annual_increment_rate: 0,
        locked_till: null,
      },
    ],
    scripbox_portfolio: [],
    investment_start_date: investmentStartDate,
    annual_investment_increment_rate: 0,
    currency: {
      appreciation_rate: 0,
      type: "INR",
      exchange_rate: 1,
    },
    scripbox_portfolio_return_rate: input.return_rate,
    sip_stepper: 1000,
    sip_stepper_start: null,
    compute_min_sip: false,
  };
}

// Financial planner tool implementation
async function callFinancialPlanner(input: FinancialPlannerRequest) {
  try {
    // Transform input to Scripbox API format
    const apiRequest = transformToScripboxRequest(input);

    // Make API call to Scripbox
    const response = await fetch(FINANCIAL_PLANNER_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json, text/plain, */*",
        "User-Agent": "scripbox-mcp/1.0.0",
      },
      body: JSON.stringify(apiRequest),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const responseData = await response.json();
    
    // Validate response structure
    const validatedResponse = FinancialPlannerResponseSchema.parse(responseData);
    
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(validatedResponse.data, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error in financial planning: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
}

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "financial_planner",
        description: "Calculate SIP requirements and investment planning for financial goals using Scripbox's financial planning engine. Provides detailed breakdown of required monthly investments, future values, and goal achievement strategy.",
        inputSchema: zodToJsonSchema(FinancialPlannerRequestSchema),
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "financial_planner": {
      try {
        const input = FinancialPlannerRequestSchema.parse(args);
        return await callFinancialPlanner(input);
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Invalid input for financial planner: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }

    default:
      return {
        content: [
          {
            type: "text",
            text: `Unknown tool: ${name}`,
          },
        ],
        isError: true,
      };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Financial Planner MCP server running on stdio");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
  });
}