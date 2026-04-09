import pytest
import asyncio
from unittest.mock import MagicMock, patch
from super_voodoo.agents.core.base_agent import BaseAgent
from super_voodoo.agents.config.schema import AgentConfig

class MockProvider:
    def __init__(self):
        self.generate_content = MagicMock()

class ExecutionAgent(BaseAgent):
    def __init__(self, config, provider):
        super().__init__(config)
        self.provider = provider

    async def _call_llm(self, prompt: str) -> str:
        return self.provider.generate_content(prompt, persona=self.config.persona)

    async def run(self, prompt: str) -> str:
        # Simplified loop for testing
        response = await self._call_llm(prompt)
        if "USE_TOOL:" in response:
            tool_name = response.split("USE_TOOL:")[1].strip()
            tool = self.get_tool(tool_name)
            if tool:
                tool_result = tool.execute(query=prompt)
                return await self._call_llm(f"Tool result: {tool_result}")
        return response

@pytest.mark.asyncio
async def test_agent_execution_loop():
    config = AgentConfig(name="Test", llm_provider="google", model="test")
    provider = MockProvider()
    agent = ExecutionAgent(config, provider)
    
    # Mock LLM to trigger tool use
    provider.generate_content.side_effect = ["USE_TOOL: test_tool", "Final response"]
    
    mock_tool = MagicMock()
    mock_tool.name = "test_tool"
    mock_tool.execute.return_value = "Tool worked"
    agent.add_tool(mock_tool)
    
    result = await agent.run("Do something")
    assert result == "Final response"
    assert provider.generate_content.call_count == 2
    mock_tool.execute.assert_called_once()
