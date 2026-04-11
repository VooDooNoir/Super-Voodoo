import yaml

config_path = "/Users/jerry/.hermes/config.yaml"
try:
    with open(config_path, "r") as f:
        config = yaml.safe_load(f)
        
    config["model"]["default"] = "qwen2.5-coder:14b"
    config["model"]["provider"] = "ollama"
    config["model"]["base_url"] = "http://localhost:11434/v1"
    config["fallback_providers"] = []
    
    if "smart_model_routing" in config:
        config["smart_model_routing"]["enabled"] = False
        
    with open(config_path, "w") as f:
        yaml.dump(config, f, default_flow_style=False)
        
    print("Config updated successfully.")
except Exception as e:
    print(f"Error: {e}")
