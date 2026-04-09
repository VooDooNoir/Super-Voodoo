import pytest
from super_voodoo.agents.core.base_agent import BaseAgent
from super_voodoo.agents.config.schema import AgentConfig

class ConcreteAgent(BaseAgent):
    async def run(self, prompt: str):
        return f"Agent is running with {prompt}"

    async def _call_llm(self, prompt: str):
        return "LLM response"

@pytest.mark.asyncio
async def test_base_agent_instantiation():
    config = AgentConfig(
        name="TestAgent",
        llm_provider="google",
        model="gemini-2.0-flash"
    )
    agent = ConcreteAgent(config)
    assert agent.config.name == "TestAgent"
    assert await agent.run("test") == "Agent is running with test"

def test_base_agent_abstract_method_error():
    config = AgentConfig(
        name="TestAgent",
        llm_provider="google",
        model="gemini-2.0-flash"
    )
    # Testing that we cannot instantiate BaseAgent directly
    with pytest.raises(TypeError):
        BaseAgent(config)
