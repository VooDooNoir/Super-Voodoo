from typing import Optional
from google import genai
from google.genai import types
from super_voodoo.agents.llm_providers.base_provider import BaseLLMProvider

class GoogleProvider(BaseLLMProvider):
    """LLM provider implementation for Google Gemini."""

    def __init__(self, model_name: str, api_key: str, base_url: Optional[str] = None):
        super().__init__(model_name, api_key, base_url)
        self.client = genai.Client(api_key=self.api_key, http_options={"base_url": self.base_url} if self.base_url else None)

    def generate_content(self, prompt: str, persona: Optional[str] = None) -> str:
        config = None
        if persona:
            config = types.GenerateContentConfig(system_instruction=persona)
        
        response = self.client.models.generate_content(
            model=self.model_name,
            contents=prompt,
            config=config
        )
        return response.text
