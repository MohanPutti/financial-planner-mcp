import fetch from 'node-fetch';

// Test the financial planner API directly
async function testFinancialPlanner() {
  const testData = {
    current_portfolio: [
      {
        amount: 0,
        return_rate: 0,
        type: "All",
        locked_till: null,
        on_date: null
      }
    ],
    goals: [
      {
        title: "Test Goal",
        priority: "Medium",
        outflow: {
          first_date: "2026-08-13",
          per_year: 1,
          inflation_rate: 0,
          total_years: "1"
        },
        goal: {
          amount: "1000000",
          on_date: null,
          inflation_rate: 0
        },
        future_annual_contribution: "0",
        investment_end_date: "2026-07-13",
        scripbox_portfolio_return_rate: 0
      }
    ],
    monthly_inflows: [
      {
        amount: 0,
        start_date: "2025-08-13",
        end_date: "2055-08-13",
        return_rate: 0,
        annual_increment_rate: 0,
        locked_till: null
      }
    ],
    scripbox_portfolio: [],
    investment_start_date: "2025-08-13",
    annual_investment_increment_rate: 0,
    currency: {
      appreciation_rate: 0,
      type: "INR",
      exchange_rate: 1
    },
    scripbox_portfolio_return_rate: 0,
    sip_stepper: 1000,
    sip_stepper_start: null,
    compute_min_sip: false
  };

  try {
    console.log('Testing Scripbox Financial Planner API...');
    
    const response = await fetch('https://invest.scripbox.com/api/possibility/new', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*',
        'User-Agent': 'scripbox-mcp/1.0.0'
      },
      body: JSON.stringify(testData)
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const responseData = await response.json();
    console.log('✅ API Response received successfully!');
    console.log('Response structure:');
    console.log('- Goals:', responseData.data?.goals?.length || 0);
    if (responseData.data?.goals?.[0]) {
      const goal = responseData.data.goals[0];
      console.log('- Monthly Investment Required:', goal.monthly_investment);
      console.log('- Computed SIP Investment:', goal.computed_sip_investment);
      console.log('- Total Goal Amount:', goal.total_goal_amount);
    }
    
    return true;
  } catch (error) {
    console.error('❌ API Test failed:', error.message);
    return false;
  }
}

testFinancialPlanner().then(success => {
  if (success) {
    console.log('\n🎉 Financial Planner API is working correctly!');
    console.log('The scripbox-mcp server should be ready to use.');
  } else {
    console.log('\n❌ There might be an issue with the API connection.');
  }
}).catch(console.error);