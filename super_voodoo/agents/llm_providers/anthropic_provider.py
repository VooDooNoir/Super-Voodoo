from typing import Optional
import anthropic
from super_voodoo.agents.llm_providers.base_provider import BaseLLMProvider

class AnthropicProvider(BaseLLMProvider):
    """LLM provider implementation for Anthropic Claude."""

    def __init__(self, model_name: str, api_key: str, base_url: Optional[str] = None):
        super().__init__(model_name, api_key, base_url)
        self.client = anthropic.Anthropic(api_key=self.api_key, base_url=self.base_url)

    def generate_content(self, prompt: str, persona: Optional[str] = None) -> str:
        response = self.client.messages.create(
            model=self.model_name,
            max_tokens=1024,
            system=persona if persona else "",
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        return response.content[0].text
