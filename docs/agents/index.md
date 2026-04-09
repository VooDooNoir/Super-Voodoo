# Super Voodoo Agent Framework

The Super Voodoo Agent Framework allows you to quickly build, configure, and deploy autonomous, tool-using agents powered by various LLM providers.

## Key Features

- **Multi-Provider Support**: Built-in support for Google Gemini, Anthropic Claude, and OpenRouter.
- **Autonomous Operation**: Run agents in the background with persistent state management.
- **Extensible Tool System**: Easily add custom tools for your agents to interact with the world.
- **CLI-Driven Lifecycle**: Manage agents (create, list, start, stop, status) directly from the command line.

## Architecture

Agents are defined by configuration files (YAML) that specify their persona, LLM settings, and the tools they can use. The core framework handles the interaction loop between the LLM and the tools.

## Next Steps

- [Creating Agents](creating_agents.md)
- [Deploying Agents](deploying_agents.md)
