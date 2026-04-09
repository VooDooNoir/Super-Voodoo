from typing import Any
from super_voodoo.agents.core.base_tool import BaseTool

from super_voodoo.agents.tools.rag_engine import SimpleRAGEngine

class VoodooagentsInfo(BaseTool):
    """Tool for retrieving information about VoodooAgents using a RAG engine."""

    def __init__(self, knowledge_file: str = "data/voodoo_knowledge.md"):
        self.rag_engine = SimpleRAGEngine(knowledge_file)

    @property
    def name(self) -> str:
        return "voodooagents_info"

    def execute(self, query: str, **kwargs) -> str:
        """
        Retrieves information based on a query using RAG.
        
        Args:
            query: The question or topic to retrieve information about.
        """
        result = self.rag_engine.search(query)
        return f"VoodooagentsInfo: {result}"
