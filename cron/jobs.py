from hermes_agent.cron import cron
from hermes_agent.core import delegate_to

@cron("0 8 * * *")
async def trigger_daily_magic():
    await delegate_to("Agent Supreme", "Generate today's 4 viral assets (Banner, Clip Script, LinkedIn, Facebook).")

@cron("0 9 * * 1")
async def trigger_revenue_audit():
    await delegate_to("Claudio", "Run the weekly zero-cost revenue optimization audit.")
