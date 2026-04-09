import os
import yaml
import shutil
from typing import Optional
from super_voodoo.agents.config.schema import validate_agent_config

from super_voodoo.agents.persistence.manager import PersistenceManager

AGENT_CONFIG_DIR = "agents"
TEMPLATE_PATH = "super_voodoo/agents/config/templates/default_agent_config.yaml"
persistence_manager = PersistenceManager()

def agent_cli(action: str, agent_name: Optional[str] = None, autonomous: bool = False):
    """
    CLI interface for managing Super Voodoo agents.
    
    Actions:
        create <name>: Creates a new agent configuration.
        list: Lists all available agent configurations.
        start <name>: Starts an agent.
        stop <name>: Stops a running agent.
        status: Shows status of agents.
    """
    if action == "create":
        if not agent_name:
            print("Error: Agent name is required for 'create' action.")
            return
        
        os.makedirs(AGENT_CONFIG_DIR, exist_ok=True)
        target_path = os.path.join(AGENT_CONFIG_DIR, f"{agent_name}.yaml")
        
        if os.path.exists(target_path):
            print(f"Error: Agent '{agent_name}' already exists at {target_path}")
            return
        
        shutil.copy2(TEMPLATE_PATH, target_path)
        print(f"Created agent configuration for '{agent_name}' at {target_path}")

    elif action == "list":
        if not os.path.exists(AGENT_CONFIG_DIR):
            print("No agents configured yet.")
        else:
            agents = [f.replace(".yaml", "") for f in os.listdir(AGENT_CONFIG_DIR) if f.endswith(".yaml")]
            if not agents:
                print("No agents configured yet.")
            else:
                print("Configured agents:")
                for agent in agents:
                    running = " (RUNNING)" if agent in persistence_manager.list_running_agents() else ""
                    print(f"  - {agent}{running}")

    elif action == "start":
        if not agent_name:
            print("Error: Agent name is required for 'start' action.")
            return
        
        if autonomous:
            pid = persistence_manager.start_agent(agent_name)
            print(f"Started agent '{agent_name}' in background (PID: {pid})")
        else:
            print(f"Starting agent '{agent_name}' in foreground...")
            # Foreground implementation

    elif action == "stop":
        if not agent_name:
            print("Error: Agent name is required for 'stop' action.")
            return
        
        if persistence_manager.stop_agent(agent_name):
            print(f"Stopped agent '{agent_name}'.")
        else:
            print(f"Error: Agent '{agent_name}' is not running in background.")

    elif action == "status":
        running = persistence_manager.list_running_agents()
        if not running:
            print("No agents currently running in background.")
        else:
            print("Running agents:")
            for agent in running:
                pid = persistence_manager.get_agent_pid(agent)
                print(f"  - {agent} (PID: {pid})")

    elif action == "telephony":
        if agent_name == "start":
            from super_voodoo.telephony.server import start_telephony_server
            print("Starting Voodoo Telephony Server...")
            start_telephony_server()
        else:
            print("Usage: python cli.py agent telephony start")

    else:
        print(f"Unknown action: {action}")
