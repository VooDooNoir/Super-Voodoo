import pytest
from unittest.mock import MagicMock, patch
from super_voodoo.cli_commands.agent import agent_cli

def test_agent_create():
    with patch("super_voodoo.cli_commands.agent.os.makedirs") as mock_makedirs, \
         patch("super_voodoo.cli_commands.agent.shutil.copy2") as mock_copy:
        agent_cli("create", "NewAgent")
        mock_makedirs.assert_called()
        mock_copy.assert_called()

def test_agent_list():
    with patch("super_voodoo.cli_commands.agent.os.path.exists") as mock_exists, \
         patch("super_voodoo.cli_commands.agent.os.listdir") as mock_listdir:
        mock_exists.return_value = True
        mock_listdir.return_value = ["agent1.yaml", "agent2.yaml"]
        agent_cli("list")
        mock_listdir.assert_called()
