# Creating Agents

To create a new agent, use the CLI command:

```bash
python cli.py agent create <agent_name>
```

This will create a configuration file at `agents/<agent_name>.yaml`.

## Configuration Options

The configuration file supports the following options:

- `name`: The unique name of the agent.
- `llm_provider`: The LLM provider (`google`, `anthropic`, `openrouter`).
- `model`: The specific model ID (e.g., `gemini-2.0-flash`).
- `persona`: A description of the agent's personality and goals.
- `tools`: A list of tool names the agent can use.
- `autonomy`: Settings for autonomous execution.

## Example Configuration

```yaml
name: "SocialBot"
llm_provider: "google"
model: "gemini-2.0-flash"
persona: "You are a social media manager for VoodooAgents."
tools:
  - "social_media_manager"
  - "voodooagents_info"
autonomy:
  mode: "continuous"
```
