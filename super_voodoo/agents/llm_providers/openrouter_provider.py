from typing import Optional
from openai import OpenAI
from super_voodoo.agents.llm_providers.base_provider import BaseLLMProvider

class OpenRouterProvider(BaseLLMProvider):
    """LLM provider implementation for OpenRouter (OpenAI-compatible)."""

    def __init__(self, model_name: str, api_key: str, base_url: str = "https://openrouter.ai/api/v1"):
        super().__init__(model_name, api_key, base_url)
        self.client = OpenAI(
            base_url=self.base_url,
            api_key=self.api_key,
        )

    def generate_content(self, prompt: str, persona: Optional[str] = None) -> str:
        messages = []
        if persona:
            messages.append({"role": "system", "content": persona})
        messages.append({"role": "user", "content": prompt})

        response = self.client.chat.completions.create(
            model=self.model_name,
            messages=messages
        )
        return response.choices[0].message.content
