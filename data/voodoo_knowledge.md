# VoodooAgents Knowledge Base

## Overview
VoodooAgents is a cutting-edge platform designed for building, managing, and deploying autonomous AI agents. Our mission is to make agentic workflows accessible and powerful for everyone.

## Features
- **Autonomous Execution**: Run agents 24/7 in the background.
- **Tool Integration**: Agents can use tools to interact with external APIs, schedule appointments, and manage social media.
- **Multi-Provider Support**: Seamlessly switch between Google Gemini, Anthropic Claude, and OpenRouter.
- **Voice Capabilities**: Real-time phone answering and voice interaction via Twilio integration.

## Referral Program & Commissions
The default referral commission is set to 10% for the first 6 months of a new user's subscription. After the initial 6 months, the commission rate drops to 5% for life. This is reflected in the system_settings and the User Rewards dashboard.

## Production Infrastructure
The VoodooAgents production backend is hosted on Render.
Backend URL: https://voodoo-agentwhat-do-you-need-from-there.onrender.com
This URL should be used for all CORS, CSP, and API configuration.

## Agent Deployment
Users can deploy agents by name via the Super Voodoo CLI. 
Command: `python cli.py agent start <agent_name> --autonomous`

## Support and Documentation
Documentation is available in the `docs/` directory of the project. For support, users can reach out via the official VoodooAgents channels.
