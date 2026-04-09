import os
import re
from pathlib import Path
from typing import Optional
from hermes_constants import get_hermes_home

class LearningEngine:
    """Distills lessons into persistent skills for Super Voodoo."""

    def __init__(self, learned_dir: str = "data/learned"):
        self.learned_dir = Path(learned_dir)
        self.skills_dir = get_hermes_home() / "skills" / "learned"
        self.learned_dir.mkdir(parents=True, exist_ok=True)
        self.skills_dir.mkdir(parents=True, exist_ok=True)

    def learn_from_text(self, title: str, content: str, source: Optional[str] = None) -> Path:
        """Saves a learned lesson as a markdown file and creates a corresponding skill."""
        filename = re.sub(r'[^\w\s-]', '', title.lower()).replace(' ', '_') + ".md"
        lesson_path = self.learned_dir / filename
        
        with open(lesson_path, "w") as f:
            f.write(f"# {title}\n")
            if source:
                f.write(f"**Source:** {source}\n\n")
            f.write(content)

        self._create_skill_from_lesson(title, content, filename)
        return lesson_path

    def _create_skill_from_lesson(self, title: str, content: str, filename: str):
        """Creates a Hermes-compatible SKILL.md in the learned skills directory."""
        skill_path = self.skills_dir / filename.replace(".md", "")
        skill_path.mkdir(parents=True, exist_ok=True)
        
        skill_md = skill_path / "SKILL.md"
        
        description = content[:100].replace("\n", " ") + "..."
        
        with open(skill_md, "w") as f:
            f.write("---\n")
            f.write(f"name: learned-{filename.replace('.md', '').replace('_', '-')}\n")
            f.write(f"description: Learned from: {title}. {description}\n")
            f.write("---\n\n")
            f.write(f"# Learned Skill: {title}\n\n")
            f.write("## Context\n")
            f.write(f"This skill was automatically distilled from a troubleshooting session or external source: {title}.\n\n")
            f.write("## Content\n")
            f.write(content)

    def list_learned_lessons(self):
        return [f.name for f in self.learned_dir.glob("*.md")]
