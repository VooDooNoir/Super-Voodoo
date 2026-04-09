from flask import Flask, request, jsonify
from .integration import StripeIntegration
from .tokens import SignalTokens
import os

app = Flask(__name__)
stripe_secret_key = os.getenv('STRIPE_SECRET_KEY', 'sk_test_123')
stripe_webhook_secret = os.getenv('STRIPE_WEBHOOK_SECRET', 'whsec_123456789')
stripe_integration = StripeIntegration(stripe_secret_key)

@app.route('/purchase-tokens', methods=['POST'])
def purchase_tokens():
    """Endpoint to initiate token purchase."""
    data = request.json
    user_id = data.get('user_id')
    bundle_type = data.get('bundle_type')
    
    if not user_id or not bundle_type:
        return jsonify({"error": "Missing user_id or bundle_type"}), 400
    
    try:
        checkout_url = stripe_integration.create_checkout_session(user_id, bundle_type)
        return jsonify({"checkout_url": checkout_url}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/webhook', methods=['POST'])
def webhook():
    """Stripe webhook handler."""
    payload = request.data.decode('utf-8')
    sig_header = request.headers.get('Stripe-Signature')
    
    try:
        result = stripe_integration.handle_webhook(payload, sig_header)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/token-balance', methods=['GET'])
def token_balance():
    """Get user's current token balance."""
    user_id = request.args.get('user_id')
    
    if not user_id:
        return jsonify({"error": "Missing user_id"}), 400
    
    token_manager = SignalTokens(user_id, None)  # Database would be injected
    balance = token_manager.get_balance()
    
    return jsonify({"token_balance": balance}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)