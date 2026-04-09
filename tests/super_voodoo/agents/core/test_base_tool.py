import pytest
from super_voodoo.agents.core.base_tool import BaseTool

class ConcreteTool(BaseTool):
    @property
    def name(self) -> str:
        return "concrete_tool"

    def execute(self, **kwargs):
        return f"Executed with {kwargs}"

def test_base_tool_instantiation():
    tool = ConcreteTool()
    assert tool.name == "concrete_tool"
    assert tool.execute(param="value") == "Executed with {'param': 'value'}"

def test_base_tool_abstract_method_error():
    # Testing that we cannot instantiate BaseTool directly
    with pytest.raises(TypeError):
        BaseTool()
