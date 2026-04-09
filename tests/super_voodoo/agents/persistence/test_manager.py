import pytest
import os
from unittest.mock import MagicMock, patch
from super_voodoo.agents.persistence.manager import PersistenceManager

def test_persistence_manager_start_stop():
    manager = PersistenceManager(state_file="tests/test_agents.json")
    
    with patch("subprocess.Popen") as mock_popen:
        mock_popen.return_value.pid = 9999
        manager.start_agent("TestAgent")
        assert "TestAgent" in manager.list_running_agents()
        assert manager.get_agent_pid("TestAgent") == 9999
        
        with patch("os.kill") as mock_kill:
            manager.stop_agent("TestAgent")
            mock_kill.assert_called_with(9999, 15)
            assert "TestAgent" not in manager.list_running_agents()

    if os.path.exists("tests/test_agents.json"):
        os.remove("tests/test_agents.json")
