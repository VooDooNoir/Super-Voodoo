class SignalTokens:
    """Manages user token balances and purchases."""
    
    # Token bundle pricing
    BUNDLES = {
        'spark': {'tokens': 5, 'price': 1200},    # $12.00
        'blaze': {'tokens': 25, 'price': 4900},   # $49.00
        'inferno': {'tokens': 100, 'price': 14900} # $149.00
    }
    
    def __init__(self, user_id, db):
        self.user_id = user_id
        self.db = db
    
    def get_balance(self):
        """Get current token balance for user."""
        result = self.db.execute("""
            SELECT token_balance 
            FROM users 
            WHERE user_id = %s
        """, (self.user_id,))
        
        if result:
            return result[0]['token_balance']
        return 0
    
    def deduct_tokens(self, amount):
        """Deduct tokens from user balance."""
        current_balance = self.get_balance()
        
        if current_balance < amount:
            return False, "Insufficient tokens"
        
        self.db.execute("""
            UPDATE users 
            SET token_balance = token_balance - %s 
            WHERE user_id = %s
        """, (amount, self.user_id))
        
        return True, "Tokens deducted successfully"
    
    def add_tokens(self, amount):
        """Add tokens to user balance."""
        self.db.execute("""
            UPDATE users 
            SET token_balance = token_balance + %s 
            WHERE user_id = %s
        """, (amount, self.user_id))
        
        return True, "Tokens added successfully"