from typing import Any, Optional
from super_voodoo.agents.core.base_tool import BaseTool
from super_voodoo.memory.manager import VoodooMemory

class VoodooMemoryTool(BaseTool):
    """Tool for reading and writing to Super Voodoo's persistent memory."""

    @property
    def name(self) -> str:
        return "voodoo_memory"

    def execute(self, action: str, key: str, value: Optional[Any] = None, **kwargs) -> str:
        """
        Interacts with persistent memory.
        
        Args:
            action: 'get' or 'set'.
            key: The memory key.
            value: The value to set (if action is 'set').
        """
        memory = VoodooMemory()
        if action == "get":
            val = memory.get_context(key)
            return f"Memory[{key}]: {val}"
        elif action == "set":
            memory.update_context(key, value)
            return f"Memory[{key}] updated to: {value}"
        else:
            return f"Unknown memory action: {action}"
