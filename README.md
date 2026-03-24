# Financial Planner MCP Server

## @mohanputti/financial-planner-mcp

A Model Context Protocol (MCP) server that provides intelligent financial planning capabilities using **Scripbox's proven financial planning algorithms**. This server enables AI assistants to help users calculate SIP requirements, investment planning, and goal achievement strategies.

## Features

- **🎯 Goal-Based Financial Planning**: Calculate exact SIP requirements for specific financial goals
- **📊 Powered by Scripbox**: Uses Scripbox's battle-tested financial planning engine and algorithms
- **💡 AI-Friendly**: Simple, intuitive interface optimized for AI assistant interactions
- **🔄 Real-time Calculations**: Get instant financial projections and investment strategies
- **📈 Comprehensive Analysis**: Detailed breakdown of required investments, future values, and goal timelines

## How It Works

This MCP server acts as a bridge between AI assistants and Scripbox's financial planning API (`https://invest.scripbox.com/api/possibility/new`). It transforms simple user inputs into comprehensive financial plans using Scripbox's sophisticated algorithms.

## Usage

### With Claude Code

**Step 1: Install globally**
```bash
npm install -g @mohanputti/financial-planner-mcp
```

**Step 2: Add to Claude Code**
```bash
claude mcp add financial-planner --scope user -- financial-planner-mcp
```

### With Claude Desktop / Cursor / Cline / Other MCP Clients

**Step 1: Install globally**
```bash
npm install -g @mohanputti/financial-planner-mcp
```

**Step 2: Add to your MCP configuration**

Find the installed binary path:
```bash
which financial-planner-mcp
```

Then add to your MCP config (e.g. `claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "financial-planner": {
      "command": "/path/to/financial-planner-mcp"
    }
  }
}
```

> **Note**: Replace `/path/to/financial-planner-mcp` with the output of `which financial-planner-mcp`. Using `npx` is not recommended as it can cause connection failures due to download delays on first run.

### Local Development

```bash
# Clone and setup
git clone <repository>
cd financial-planner-mcp

# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode
npm run dev
```

## Available Tools 🛠️

### `financial_planner`

Transform financial goals into actionable investment strategies using Scripbox's proven algorithms.

**Input Parameters:**
- `goals` (array, required): List of financial goals, each with:
  - `goal_name` (string): Name of the goal (e.g., "Child Education", "Retirement")
  - `amount` (number): Target amount in INR
  - `date` (string): Year when the goal amount is needed (YYYY format, e.g., "2035")
- `current_wealth` (array, optional): Existing investments, each with:
  - `instrument_type` (string): e.g., "Mutual Funds", "Stocks" (default: "Current Wealth")
  - `amount` (number): Current value in INR
  - `growth_rate` (number): Expected return as decimal, e.g., 0.12 for 12%
  - `lockin_date` (string, optional): Lock-in date in YYYY-MM-DD format
- `current_monthly_savings` (array, optional): Ongoing SIPs/savings, each with:
  - `instrument_type` (string): e.g., "SIP", "PF", "NPS" (default: "Current Savings")
  - `amount` (number): Monthly amount in INR
  - `growth_rate` (number): Expected return as decimal
  - `lockin_date` (string, optional): Lock-in date in YYYY-MM-DD format
- `inflation_rate` (optional): Expected inflation rate as decimal, e.g., 0.06 for 6% (default: 0.06)
- `investment_start_date` (optional): When to start investing in YYYY-MM-DD format (defaults to today)

**Example Usage with AI Assistant:**

*"I want to save ₹20 lakhs for my child's education by June 2030. I currently have ₹2 lakhs invested and can save ₹15,000 monthly. Assume 6% inflation and 12% returns."*

**What You Get Back:**

The tool returns comprehensive financial planning data including:

- **💰 Required Monthly SIP**: Exact amount you need to invest monthly
- **📈 Future Value Projections**: How your investments will grow over time  
- **⏰ Investment Timeline**: Start date, end date, and key milestones
- **📊 Shortfall Analysis**: Gap between your goal and current trajectory
- **🏦 Portfolio Breakdown**: How different sources contribute to your goal
- **🎯 Multiple Investment Scenarios**: Present value, future value, and end-of-investment calculations

**Sample Response Structure:**
```json
{
  "monthly_investment": 83400,
  "computed_sip_investment": 83333.33,
  "total_goal_amount": 2000000,
  "investment_start_date": "2025-08-13",
  "investment_end_date": "2030-05-01",
  "total_shortfall_amount": 1800000,
  "computed_monthly_investment_future": 85234.56,
  "current_portfolio_contribution": {
    "amount": 200000,
    "return_rate": 0.12
  }
}
```

## Powered by Scripbox 🚀

This MCP server leverages **Scripbox's financial planning API**, which powers their award-winning financial planning platform used by thousands of investors across India. The algorithms account for:

- **Inflation Impact**: Automatic adjustment for future value of money
- **Market Volatility**: Realistic return assumptions and risk modeling  
- **Goal Prioritization**: Smart allocation strategies for multiple goals
- **Tax Efficiency**: Optimized investment structures
- **Flexible Planning**: Handles various investment scenarios and timelines

## Example Conversations with AI

**User**: *"Help me plan for buying a house worth ₹1 crore in 5 years. I have ₹10 lakhs saved and can invest ₹25,000 monthly."*

**AI Response**: *"I'll help you create a financial plan for your house purchase goal using the financial planner. Let me calculate the optimal investment strategy..."*

**User**: *"What if I can only save ₹20,000 per month instead?"*

**AI Response**: *"Let me recalculate your financial plan with the reduced monthly investment..."*

## Technical Details

- **API Endpoint**: Uses Scripbox's `/api/possibility/new` endpoint
- **Protocol**: Model Context Protocol (MCP) 1.0
- **Transport**: STDIO (with future support for SSE/HTTP)
- **Validation**: Full input/output validation using Zod schemas
- **Error Handling**: Comprehensive error handling and user-friendly messages

## API Endpoints Used

- `POST https://invest.scripbox.com/api/possibility/new` - Scripbox's financial planning calculations engine

## Roadmap 🛣️

**Phase 1** (Current): Financial Planning
- ✅ Goal-based SIP calculations
- ✅ Investment timeline planning
- ✅ Shortfall analysis


## Contributing

This project is designed to help people make better financial decisions through AI-assisted planning. Contributions are welcome!

## License

MIT License - Feel free to use this for personal or commercial projects.

---

*Built with ❤️ for the financial planning community. Powered by Scripbox's proven algorithms.*
