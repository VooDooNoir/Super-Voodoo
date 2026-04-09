import os
import json
import subprocess
import signal
from typing import Dict, List, Optional

class PersistenceManager:
    """Manages running agents as background processes."""

    def __init__(self, state_file: str = "agents_state.json"):
        self.state_file = state_file
        self.running_agents: Dict[str, int] = self._load_state()

    def _load_state(self) -> Dict[str, int]:
        if os.path.exists(self.state_file):
            try:
                with open(self.state_file, "r") as f:
                    return json.load(f)
            except Exception:
                return {}
        return {}

    def _save_state(self):
        with open(self.state_file, "w") as f:
            json.dump(self.running_agents, f)

    def start_agent(self, agent_name: str):
        """Starts an agent in the background."""
        # In a real implementation, this would call 'python cli.py agent start <name>'
        # For now, we mock the process creation.
        process = subprocess.Popen(["python3", "-c", "import time; time.sleep(3600)"])
        self.running_agents[agent_name] = process.pid
        self._save_state()
        return process.pid

    def stop_agent(self, agent_name: str):
        """Stops a running agent background process."""
        pid = self.running_agents.get(agent_name)
        if pid:
            try:
                os.kill(pid, signal.SIGTERM)
            except ProcessLookupError:
                pass # Already dead
            del self.running_agents[agent_name]
            self._save_state()
            return True
        return False

    def list_running_agents(self) -> List[str]:
        """Lists names of currently running agents."""
        return list(self.running_agents.keys())

    def get_agent_pid(self, agent_name: str) -> Optional[int]:
        """Gets the PID of a running agent."""
        return self.running_agents.get(agent_name)
