import { z } from "zod";

// Base schemas for financial planning
export const CurrencySchema = z.object({
  appreciation_rate: z.number().default(0),
  type: z.string().default("INR"),
  exchange_rate: z.number().default(1),
});

export const CurrentPortfolioItemSchema = z.object({
  amount: z.number().default(0),
  return_rate: z.number().default(0),
  type: z.string().default("All"),
  locked_till: z.string().nullable().default(null),
  on_date: z.string().nullable().default(null),
});

export const GoalOutflowSchema = z.object({
  first_date: z.string(),
  per_year: z.number().default(1),
  inflation_rate: z.number().default(0),
  total_years: z.string(),
});

export const GoalAmountSchema = z.object({
  amount: z.string(),
  on_date: z.string().nullable().default(null),
  inflation_rate: z.number().default(0),
});

export const GoalSchema = z.object({
  title: z.string(),
  priority: z.enum(["Low", "Medium", "High"]).default("Medium"),
  outflow: GoalOutflowSchema,
  goal: GoalAmountSchema,
  future_annual_contribution: z.string().default("0"),
  investment_end_date: z.string(),
  scripbox_portfolio_return_rate: z.number().default(0),
});

export const MonthlyInflowSchema = z.object({
  amount: z.number().default(0),
  start_date: z.string(),
  end_date: z.string(),
  return_rate: z.number().default(0),
  annual_increment_rate: z.number().default(0),
  locked_till: z.string().nullable().default(null),
});

// Goal schema for multiple goals support
export const GoalItemSchema = z.object({
  goal_name: z.string().describe("The specific goal name"),
  amount: z.number().describe("The future value of the goal amount in rupee terms"),
  date: z.string().describe("The year in which the goal amount is needed in YYYY format"),
});

// Current wealth item schema
export const CurrentWealthItemSchema = z.object({
  instrument_type: z.string().default("Current Wealth").describe("Optional product or instrument type like mutual funds, stocks etc"),
  amount: z.number().describe("The current amount of the wealth item in rupee terms"),
  growth_rate: z.number().describe("Percentage growth rate returns for the specific instrument (as decimal, e.g., 0.10 for 10%)"),
  lockin_date: z.string().nullable().default(null).describe("The lockin date to which the amount is locked in YYYY-MM-DD format"),
});

// Current monthly savings item schema  
export const CurrentMonthlySavingsItemSchema = z.object({
  instrument_type: z.string().default("Current Savings").describe("Optional product or instrument type like mutual funds SIP, PF, NPS, RD etc"),
  amount: z.number().describe("The current monthly savings amount in rupee terms"),
  growth_rate: z.number().describe("Percentage growth rate returns for the specific instrument (as decimal, e.g., 0.10 for 10%)"),
  lockin_date: z.string().nullable().default(null).describe("The lockin date to which accumulated amount is locked in YYYY-MM-DD format"),
});

// Updated Financial Planner Request Schema supporting multiple goals
export const FinancialPlannerRequestSchema = z.object({
  goals: z.array(GoalItemSchema).min(1).describe("The list of all goals of the user"),
  current_wealth: z.array(CurrentWealthItemSchema).default([]).describe("The list of all current wealth of the user"),
  current_monthly_savings: z.array(CurrentMonthlySavingsItemSchema).default([]).describe("The list of all current monthly savings the user is already doing"),
  inflation_rate: z.number().default(0.06).describe("Expected inflation rate (as decimal, e.g., 0.06 for 6%)"),
  investment_start_date: z.string().optional().describe("When to start investing (YYYY-MM-DD). Defaults to today"),
});

// Response schemas based on API response structure
export const GoalOutflowResponseSchema = z.object({
  date: z.string(),
  total_outflow_amount: z.number(),
  net_outflow_amount: z.number(),
  annual_contribution_amount: z.number(),
  current_portfolio_contribution_amount: z.number(),
  scripbox_portfolio_contribution_amount: z.number(),
  shortfall_amount: z.number(),
});

export const PortfolioContributionSchema = z.object({
  amount: z.number(),
  return_rate: z.number(),
  sources: z.array(z.string()).optional(),
});

export const GoalResponseSchema = z.object({
  outflows: z.array(GoalOutflowResponseSchema),
  current_portfolio_contribution: PortfolioContributionSchema,
  monthly_investment: z.number(),
  monthly_investment_future: z.number(),
  monthly_investment_end: z.number(),
  start_date: z.string(),
  investment_start_date: z.string(),
  investment_end_date: z.string(),
  total_shortfall_amount: z.number(),
  total_planned_investment_amount: z.number(),
  total_future_goal_amount: z.number(),
  scripbox_portfolio_contribution: PortfolioContributionSchema,
  computed_monthly_investment: z.number(),
  title: z.string(),
  id: z.string().nullable(),
  total_shortfall_amount_on_goal_date: z.number(),
  total_external_portfolio_amount_on_goal_date: z.number(),
  current_scripbox_holdings_amount_on_goal_date: z.number(),
  total_goal_amount: z.number(),
  total_future_goal_amount_on_goal_date: z.number(),
  current_value_of_shortfall_amount: z.number(),
  computed_sip_investment: z.number(),
  computed_monthly_investment_future: z.number(),
  computed_monthly_investment_end: z.number(),
  total_shortfall_amount_on_investment_end_date: z.number(),
});

export const FinancialPlannerResponseSchema = z.object({
  data: z.object({
    goals: z.array(GoalResponseSchema),
    min_monthly_investment: z.record(z.unknown()),
    optimise_monthly_investment: z.unknown().nullable(),
  }),
});

// Internal API request schema (what we send to Scripbox API)
export const ScripboxAPIRequestSchema = z.object({
  current_portfolio: z.array(CurrentPortfolioItemSchema),
  goals: z.array(GoalSchema),
  monthly_inflows: z.array(MonthlyInflowSchema),
  scripbox_portfolio: z.array(z.unknown()),
  investment_start_date: z.string(),
  annual_investment_increment_rate: z.number(),
  currency: CurrencySchema,
  scripbox_portfolio_return_rate: z.number(),
  sip_stepper: z.number(),
  sip_stepper_start: z.string().nullable(),
  compute_min_sip: z.boolean(),
});

// Type exports
export type FinancialPlannerRequest = z.infer<typeof FinancialPlannerRequestSchema>;
export type FinancialPlannerResponse = z.infer<typeof FinancialPlannerResponseSchema>;
export type ScripboxAPIRequest = z.infer<typeof ScripboxAPIRequestSchema>;
export type GoalResponse = z.infer<typeof GoalResponseSchema>;
export type GoalItem = z.infer<typeof GoalItemSchema>;
export type CurrentWealthItem = z.infer<typeof CurrentWealthItemSchema>;
export type CurrentMonthlySavingsItem = z.infer<typeof CurrentMonthlySavingsItemSchema>;