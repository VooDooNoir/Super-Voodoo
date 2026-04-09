import pytest
from unittest.mock import Mock, patch
from .tokens import SignalTokens

class TestSignalTokens:
    @pytest.fixture
    def mock_db(self):
        return Mock()
    
    @pytest.fixture
    def token_manager(self, mock_db):
        return SignalTokens(user_id=123, db=mock_db)
    
    def test_get_balance_when_user_exists(self, token_manager, mock_db):
        """Test getting balance for existing user."""
        mock_db.execute.return_value = [{'token_balance': 10}]
        
        balance = token_manager.get_balance()
        
        assert balance == 10
        mock_db.execute.assert_called_once_with(
            """SELECT token_balance FROM users WHERE user_id = %s""",
            (123,)
        )
    
    def test_get_balance_when_user_does_not_exist(self, token_manager, mock_db):
        """Test getting balance for non-existent user."""
        mock_db.execute.return_value = None
        
        balance = token_manager.get_balance()
        
        assert balance == 0
        mock_db.execute.assert_called_once()
    
    def test_deduct_tokens_sufficient_balance(self, token_manager, mock_db):
        """Test deducting tokens with sufficient balance."""
        mock_db.execute.return_value = [{'token_balance': 20}]
        
        success, message = token_manager.deduct_tokens(10)
        
        assert success == True
        assert message == "Tokens deducted successfully"
        mock_db.execute.assert_called_with(
            """UPDATE users SET token_balance = token_balance - %s WHERE user_id = %s""",
            (10, 123)
        )
    
    def test_deduct_tokens_insufficient_balance(self, token_manager, mock_db):
        """Test deducting tokens with insufficient balance."""
        mock_db.execute.return_value = [{'token_balance': 5}]
        
        success, message = token_manager.deduct_tokens(10)
        
        assert success == False
        assert message == "Insufficient tokens"
        mock_db.execute.assert_called_once_with(
            """SELECT token_balance FROM users WHERE user_id = %s""",
            (123,)
        )
        assert mock_db.execute.call_count == 1
    
    def test_add_tokens(self, token_manager, mock_db):
        """Test adding tokens."""
        mock_db.execute.return_value = None
        
        success, message = token_manager.add_tokens(15)
        
        assert success == True
        assert message == "Tokens added successfully"
        mock_db.execute.assert_called_with(
            """UPDATE users SET token_balance = token_balance + %s WHERE user_id = %s""",
            (15, 123)
        )