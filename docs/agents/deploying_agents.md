# Deploying Agents

You can run your agents in either the foreground or as background autonomous processes.

## Running in the Foreground

To start an agent and interact with it in your terminal:

```bash
python cli.py agent start <agent_name>
```

## Running Autonomously (Background)

To deploy an agent as an autonomous background process:

```bash
python cli.py agent start <agent_name> --autonomous
```

## Checking Status

To see which agents are currently running:

```bash
python cli.py agent status
```

## Stopping Agents

To stop a background agent:

```bash
python cli.py agent stop <agent_name>
```
