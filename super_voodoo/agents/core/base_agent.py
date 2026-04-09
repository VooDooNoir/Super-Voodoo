from abc import ABC, abstractmethod
from typing import Dict, Any, List
from super_voodoo.agents.config.schema import AgentConfig

class BaseAgent(ABC):
    """Abstract base class for all Super Voodoo agents."""

    def __init__(self, config: AgentConfig):
        self.config = config
        self.tools: Dict[str, Any] = {}

    @abstractmethod
    async def run(self, prompt: str) -> Any:
        """Starts the agent's main loop or execution logic."""
        pass

    @abstractmethod
    async def _call_llm(self, prompt: str) -> str:
        """Internal method to call the configured LLM provider."""
        pass

    def add_tool(self, tool: Any):
        """Adds a tool to the agent's toolbox."""
        self.tools[tool.name] = tool

    def get_tool(self, name: str) -> Any:
        """Retrieves a tool by name."""
        return self.tools.get(name)
