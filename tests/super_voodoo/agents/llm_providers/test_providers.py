import pytest
from unittest.mock import MagicMock, patch
from super_voodoo.agents.llm_providers.google_provider import GoogleProvider
from super_voodoo.agents.llm_providers.anthropic_provider import AnthropicProvider
from super_voodoo.agents.llm_providers.openrouter_provider import OpenRouterProvider

def test_google_provider_generation():
    with patch("super_voodoo.agents.llm_providers.google_provider.genai.Client") as mock_client_class:
        mock_client = mock_client_class.return_value
        mock_response = MagicMock()
        mock_response.text = "Hello from Google"
        mock_client.models.generate_content.return_value = mock_response
        
        provider = GoogleProvider(model_name="gemini-2.0-flash", api_key="test_key")
        response = provider.generate_content("Hi")
        assert response == "Hello from Google"

def test_anthropic_provider_generation():
    with patch("super_voodoo.agents.llm_providers.anthropic_provider.anthropic.Anthropic") as mock_client_class:
        mock_client = mock_client_class.return_value
        mock_response = MagicMock()
        mock_response.content = [MagicMock(text="Hello from Anthropic")]
        mock_client.messages.create.return_value = mock_response
        
        provider = AnthropicProvider(model_name="claude-3-5-sonnet", api_key="test_key")
        response = provider.generate_content("Hi")
        assert response == "Hello from Anthropic"

def test_openrouter_provider_generation():
    with patch("super_voodoo.agents.llm_providers.openrouter_provider.OpenAI") as mock_client_class:
        mock_client = mock_client_class.return_value
        mock_response = MagicMock()
        mock_response.choices = [MagicMock(message=MagicMock(content="Hello from OpenRouter"))]
        mock_client.chat.completions.create.return_value = mock_response
        
        provider = OpenRouterProvider(model_name="meta-llama/llama-3-70b", api_key="test_key")
        response = provider.generate_content("Hi")
        assert response == "Hello from OpenRouter"
