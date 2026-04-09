import os
import sys
import json
from typing import Optional
from super_voodoo.learning.engine import LearningEngine
from super_voodoo.memory.manager import VoodooMemory
from super_voodoo.monetization.advisor import MonetizationAdvisor

def voodoo_cli(action: str, target: Optional[str] = None, content: Optional[str] = None, tool_id: Optional[str] = None, name: Optional[str] = None):
    """
    Super Voodoo Advanced CLI.
    
    Actions:
        tool install --tool_id <id>: Install a tool/skill from the hub.
        learn --target <title> --content <text>: Distill a lesson into a persistent skill.
        memory show: Show current persistent memory.
        memory clear: Clear all persistent memory.
        config personality --name <name>: Set Voodoo's persona.
    """
    learning_engine = LearningEngine()
    memory = VoodooMemory()
    advisor = MonetizationAdvisor()

    if action == "tool":
        if target == "install":
            tid = tool_id or name
            if not tid:
                print("Error: Tool ID required. Usage: python cli.py voodoo tool install --tool_id <id>")
                return
            from hermes_cli.skills_hub import do_install
            print(f"Installing tool: {tid}...")
            do_install(tid)
        else:
            print(f"Unknown tool action: {target}")

    elif action == "learn":
        title = target
        if not title or not content:
            print("Usage: python cli.py voodoo learn --target '<title>' --content '<text>'")
            return
        
        path = learning_engine.learn_from_text(title, content)
        print(f"Lesson learned! Saved to {path} and created a new skill.")

    elif action == "memory":
        if target == "show":
            print(json.dumps(memory.data, indent=2))
        elif target == "clear":
            memory.data = {"personality": "Voodoo", "context": {}, "learned_keys": []}
            memory.save_memory()
            print("Memory cleared.")
        else:
            print(f"Unknown memory action: {target}")

    elif action == "config":
        if target == "personality":
            p_name = name or content or tool_id
            if not p_name:
                print("Error: Personality name required. Usage: python cli.py voodoo config personality --name <name>")
                return
            memory.set_personality(p_name)
            print(f"Personality set to: {p_name}")

    else:
        print(f"Unknown voodoo action: {action}")
