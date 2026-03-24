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
  type GoalItem,
  type CurrentWealthItem,
  type CurrentMonthlySavingsItem,
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
  // If goalDate is just a year (YYYY), convert to full date
  let fullDate: Date;
  if (goalDate.length === 4 && /^\d{4}$/.test(goalDate)) {
    fullDate = new Date(`${goalDate}-12-31`);
  } else {
    fullDate = new Date(goalDate);
  }
  fullDate.setMonth(fullDate.getMonth() - 1);
  return fullDate.toISOString().split('T')[0];
}

// Helper function to convert year to full date
function convertYearToDate(yearOrDate: string): string {
  if (yearOrDate.length === 4 && /^\d{4}$/.test(yearOrDate)) {
    return `${yearOrDate}-12-31`;
  }
  return yearOrDate;
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
  const inflowEndDate = calculateInflowEndDate(investmentStartDate);

  // Calculate default return rate based on wealth instruments
  const defaultReturnRate = 0.12; // 12% default return rate

  // Transform current wealth items to current_portfolio format
  const currentPortfolio = input.current_wealth.length > 0 
    ? input.current_wealth.map((wealth: CurrentWealthItem) => ({
        amount: wealth.amount,
        return_rate: wealth.growth_rate,
        type: wealth.instrument_type,
        locked_till: wealth.lockin_date,
        on_date: null,
      }))
    : [{
        amount: 0,
        return_rate: defaultReturnRate,
        type: "All",
        locked_till: null,
        on_date: null,
      }];

  // Transform goals array to Scripbox goals format
  const goals = input.goals.map((goal: GoalItem) => {
    const goalDate = convertYearToDate(goal.date);
    const investmentEndDate = calculateInvestmentEndDate(goalDate);
    
    return {
      title: goal.goal_name,
      priority: "Medium" as const,
      outflow: {
        first_date: goalDate,
        per_year: 1,
        inflation_rate: input.inflation_rate,
        total_years: "1",
      },
      goal: {
        amount: goal.amount.toString(),
        on_date: null,
        inflation_rate: input.inflation_rate,
      },
      future_annual_contribution: "0",
      investment_end_date: investmentEndDate,
      scripbox_portfolio_return_rate: defaultReturnRate,
    };
  });

  // Transform current monthly savings to monthly_inflows format
  const monthlyInflows = input.current_monthly_savings.length > 0
    ? input.current_monthly_savings.map((savings: CurrentMonthlySavingsItem) => ({
        amount: savings.amount,
        start_date: investmentStartDate,
        end_date: inflowEndDate,
        return_rate: savings.growth_rate,
        annual_increment_rate: 0,
        locked_till: savings.lockin_date,
      }))
    : [{
        amount: 0,
        start_date: investmentStartDate,
        end_date: inflowEndDate,
        return_rate: defaultReturnRate,
        annual_increment_rate: 0,
        locked_till: null,
      }];

  return {
    current_portfolio: currentPortfolio,
    goals: goals,
    monthly_inflows: monthlyInflows,
    scripbox_portfolio: [],
    investment_start_date: investmentStartDate,
    annual_investment_increment_rate: 0,
    currency: {
      appreciation_rate: 0,
      type: "INR",
      exchange_rate: 1,
    },
    scripbox_portfolio_return_rate: defaultReturnRate,
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
        description: "Calculate SIP requirements and investment planning for financial goals using Scripbox's financial planning engine. Return ONLY the raw data from the API response. Do NOT add any suggestions, investment strategies, tips, fund recommendations, or any information that is not present in the API response itself.",
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

// Debug: Check if this script is being executed directly
console.error("Starting MCP server...");

// Always run when executed as a script
main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});