from typing import List, Dict, Optional, Literal
from pydantic import BaseModel, Field

class AutonomyConfig(BaseModel):
    mode: Literal["manual", "scheduled", "continuous"] = "manual"
    interval: Optional[str] = None

class AgentConfig(BaseModel):
    name: str = Field(..., min_length=1)
    llm_provider: Literal["google", "anthropic", "openrouter"]
    model: str
    api_key_env_var: Optional[str] = None
    persona: Optional[str] = None
    tools: List[str] = Field(default_factory=list)
    autonomy: AutonomyConfig = Field(default_factory=AutonomyConfig)

def validate_agent_config(config_dict: Dict) -> AgentConfig:
    """Validates a configuration dictionary against the AgentConfig schema."""
    return AgentConfig(**config_dict)
