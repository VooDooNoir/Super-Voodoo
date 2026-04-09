import os
import re
from typing import List, Tuple

class SimpleRAGEngine:
    """A simple keyword-based RAG engine for searching a knowledge base."""

    def __init__(self, knowledge_file: str):
        self.knowledge_file = knowledge_file
        self.chunks = self._load_and_chunk()

    def _load_and_chunk(self) -> List[str]:
        if not os.path.exists(self.knowledge_file):
            return []
        
        with open(self.knowledge_file, "r") as f:
            content = f.read()
        
        # Split by double newlines to get paragraphs/sections
        chunks = re.split(r'\n\s*\n', content)
        return [c.strip() for c in chunks if c.strip()]

    def search(self, query: str, top_k: int = 1) -> str:
        """Finds the most relevant chunk based on keyword overlap."""
        if not self.chunks:
            return "No knowledge base found."

        query_words = set(re.findall(r'\w+', query.lower()))
        scored_chunks: List[Tuple[float, str]] = []

        for chunk in self.chunks:
            chunk_words = set(re.findall(r'\w+', chunk.lower()))
            intersection = query_words.intersection(chunk_words)
            score = len(intersection) / len(query_words) if query_words else 0
            scored_chunks.append((score, chunk))

        # Sort by score descending
        scored_chunks.sort(key=lambda x: x[0], reverse=True)
        
        if scored_chunks[0][0] == 0:
            return "I couldn't find specific information on that in my knowledge base."
        
        return scored_chunks[0][1]
