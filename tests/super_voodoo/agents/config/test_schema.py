import pytest
from pydantic import ValidationError
from super_voodoo.agents.config.schema import validate_agent_config

def test_invalid_config_missing_required_fields():
    """Test that a configuration missing required fields raises ValidationError."""
    invalid_config = {
        "llm_provider": "google",
        "model": "gemini-2.0-flash",
        # Missing 'name'
    }
    with pytest.raises(ValidationError):
        validate_agent_config(invalid_config)

def test_valid_config():
    """Test that a valid configuration passes validation."""
    valid_config = {
        "name": "SocialBot",
        "llm_provider": "google",
        "model": "gemini-2.0-flash",
        "persona": "A helpful social media manager.",
        "tools": ["social_media_manager"],
        "autonomy": {"mode": "continuous"}
    }
    validated = validate_agent_config(valid_config)
    assert validated.name == "SocialBot"
    assert validated.llm_provider == "google"
