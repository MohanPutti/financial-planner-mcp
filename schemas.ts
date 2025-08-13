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

// Financial Planner Request Schema
export const FinancialPlannerRequestSchema = z.object({
  goal_name: z.string().describe("Name of the financial goal"),
  goal_amount: z.number().describe("Target amount for the goal in INR"),
  goal_date: z.string().describe("Target date for achieving the goal (YYYY-MM-DD)"),
  current_wealth: z.number().default(0).describe("Current wealth/portfolio value in INR"),
  monthly_inflow: z.number().default(0).describe("Monthly savings/investment capacity in INR"),
  priority: z.enum(["Low", "Medium", "High"]).default("Medium").describe("Priority of the goal"),
  inflation_rate: z.number().default(0).describe("Expected inflation rate (as decimal, e.g., 0.07 for 7%)"),
  return_rate: z.number().default(0).describe("Expected return rate on investments (as decimal)"),
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