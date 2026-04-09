import stripe
from datetime import datetime
from .tokens import SignalTokens

class StripeIntegration:
    """Handles Stripe payment processing for token purchases."""
    
    def __init__(self, stripe_secret_key):
        stripe.api_key = stripe_secret_key
    
    def create_checkout_session(self, user_id, bundle_type):
        """Create Stripe Checkout session for token purchase."""
        if bundle_type not in SignalTokens.BUNDLES:
            raise ValueError(f"Invalid bundle type: {bundle_type}")
        
        bundle = SignalTokens.BUNDLES[bundle_type]
        
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': f"{bundle_type.capitalize()} Signal Bundle",
                        'description': f"{bundle['tokens']} tokens for copy-trading",
                    },
                    'unit_amount': bundle['price'],
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url='http://localhost:3000/purchase-success',
            cancel_url='http://localhost:3000/purchase-cancel',
            metadata={
                'user_id': user_id,
                'bundle_type': bundle_type,
                'tokens': bundle['tokens'],
            }
        )
        
        return session.url
    
    def handle_webhook(self, payload, sig_header):
        """Handle Stripe webhook events."""
        event = None
        
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, 'whsec_123456789'
            )
        except ValueError as e:
            # Invalid payload
            return {"status": "error", "message": str(e)}
        except stripe.error.SignatureVerificationError as e:
            # Invalid signature
            return {"status": "error", "message": str(e)}
        
        if event["type"] == "payment_intent.succeeded":
            payment_intent = event["data"]["object"]
            self._process_successful_payment(payment_intent)
            
        return {"status": "success", "event_type": event["type"]}
    
    def _process_successful_payment(self, payment_intent):
        """Process successful payment and credit tokens."""
        metadata = payment_intent["metadata"]
        user_id = metadata.get('user_id')
        bundle_type = metadata.get('bundle_type')
        tokens = int(metadata.get('tokens', 0))
        
        if not user_id or not bundle_type or tokens == 0:
            return False
        
        # Credit tokens to user account
        token_manager = SignalTokens(user_id, None)  # Database would be injected
        success, message = token_manager.add_tokens(tokens)
        
        # Log transaction
        self._log_transaction(
            user_id=user_id,
            bundle_type=bundle_type,
            tokens=tokens,
            amount=payment_intent["amount_received"],
            payment_intent_id=payment_intent["id"]
        )
        
        return success
    
    def _log_transaction(self, user_id, bundle_type, tokens, amount, payment_intent_id):
        """Log payment transaction to database."""
        # This would be implemented with actual database connection
        print(f"Logging transaction: user_id={user_id}, bundle={bundle_type}, "
              f"tokens={tokens}, amount={amount}, pi_id={payment_intent_id}")