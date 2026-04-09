import json
import os
from pathlib import Path
from typing import Dict, Any, Optional
from hermes_constants import get_hermes_home

class VoodooMemory:
    """Manages persistent long-term memory and personality for Super Voodoo."""

    def __init__(self, memory_file: str = "voodoo_memory.json"):
        self.memory_path = get_hermes_home() / "memories" / memory_file
        self.data: Dict[str, Any] = self._load_memory()

    def _load_memory(self) -> Dict[str, Any]:
        if self.memory_path.exists():
            try:
                with open(self.memory_path, "r") as f:
                    return json.load(f)
            except Exception:
                return {"personality": "Voodoo", "context": {}, "learned_keys": []}
        return {"personality": "Voodoo", "context": {}, "learned_keys": []}

    def save_memory(self):
        self.memory_path.parent.mkdir(parents=True, exist_ok=True)
        with open(self.memory_path, "w") as f:
            json.dump(self.data, f, indent=2)

    def set_personality(self, personality: str):
        self.data["personality"] = personality
        self.save_memory()

    def update_context(self, key: str, value: Any):
        self.data["context"][key] = value
        self.save_memory()

    def get_context(self, key: str) -> Optional[Any]:
        return self.data["context"].get(key)

    def get_full_memory_prompt(self) -> str:
        """Generates a system prompt snippet based on persistent memory."""
        prompt = f"\n\n[Persistent Memory: Super Voodoo]\n"
        prompt += f"Personality: {self.data.get('personality', 'Voodoo')}\n"
        
        context = self.data.get("context", {})
        if context:
            prompt += "Known Context:\n"
            for k, v in context.items():
                prompt += f"- {k}: {v}\n"
        
        prompt += "\nCore Directive: Prioritize MONETIZATION, OPTIMIZATION, and ENHANCEMENT in all suggestions.\n"
        return prompt
