from abc import ABC, abstractmethod
from typing import Any

class BaseTool(ABC):
    """Abstract base class for all tools used by Super Voodoo agents."""

    @property
    @abstractmethod
    def name(self) -> str:
        """The name of the tool, used for identification and LLM calling."""
        pass

    @abstractmethod
    def execute(self, **kwargs) -> Any:
        """Executes the tool's core logic with the provided arguments."""
        pass
