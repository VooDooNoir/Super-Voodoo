# voodoo_api_adapter.py
from flask import Flask, request, jsonify
import requests
import threading
import time
import os
from dotenv import load_dotenv

# Load environment variables from .env file
# This file should contain:
# TELEGRAM_BOT_TOKEN=YOUR_TELEGRAM_BOT_TOKEN (needed if bot runs separately and voodoo calls it)
# VOODOO_API_PORT=5000 (port for this API)
# BOT_SEND_MESSAGE_URL=http://localhost:5001/send_message (URL of the Telegram bot handler)
load_dotenv()

app = Flask(__name__)

VOODOO_API_PORT = int(os.getenv("VOODOO_API_PORT", 5000))
BOT_SEND_MESSAGE_URL = os.getenv("BOT_SEND_MESSAGE_URL", "http://localhost:5001/send_message") # Default to localhost:5001

# --- Voodoo's Internal State/Logic ---
# In a real "voodoo" project, this would be your actual application logic.
# For demonstration, we'll simulate some internal state and command processing.
voodoo_internal_state = {
    "status": "idle",
    "last_command": None,
    "message_history": []
}
# --- End Voodoo's Internal State ---

def send_message_to_telegram_bot(chat_id: int, message: str):
    """
    Sends a message from Voodoo back to the Telegram bot handler.
    This function is called by Voodoo when it needs to notify the user.
    """
    try:
        response = requests.post(BOT_SEND_MESSAGE_URL, json={
            "chat_id": chat_id,
            "message": message
        })
        response.raise_for_status()
        print(f"Message sent to Telegram bot handler: {message}")
    except requests.exceptions.RequestException as e:
        print(f"Error sending message to Telegram bot handler: {e}")
    except Exception as e:
        print(f"An unexpected error occurred when sending message to Telegram bot handler: {e}")

@app.route('/process_message', methods=['POST'])
def process_message_from_telegram():
    """
    Receives messages from the Telegram bot and processes them for Voodoo.
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid JSON"}), 400

    chat_id = data.get("chat_id")
    user_id = data.get("user_id")
    user_name = data.get("user_name")
    message = data.get("message")

    if not all([chat_id, user_id, user_name, message]):
        return jsonify({"error": "Missing required fields: chat_id, user_id, user_name, message"}), 400

    print(f"Received from Telegram Bot (Chat ID: {chat_id}, User: {user_name}): {message}")

    # --- Voodoo Project's Logic ---
    # Process the message and update internal state
    voodoo_internal_state["last_command"] = message
    voodoo_internal_state["message_history"].append({"user": user_name, "message": message})

    response_message_to_user = f"Voodoo received: '{message}'"
    
    # Simulate some processing and potential updates
    if "status" in message.lower():
        response_message_to_user = f"Voodoo's current status is: {voodoo_internal_state['status']}"
    elif "hello" in message.lower():
        response_message_to_user = f"Hello {user_name}! Voodoo acknowledges your greeting."
    else:
        # Simulate some background task
        threading.Thread(target=run_simulated_voodoo_task, args=(chat_id, user_name, message)).start()
        response_message_to_user = f"Voodoo is processing your request '{message}'..."

    # Return a response to the Telegram bot handler (which might relay it back to the user)
    # Or, let the background task send proactive updates.
    return jsonify({"reply": response_message_to_user})
    # --- End Voodoo's Logic ---

def run_simulated_voodoo_task(chat_id: int, user_name: str, command: str):
    """Simulates a background task in Voodoo and sends a notification."""
    print(f"Simulating background task for command: {command}")
    time.sleep(5) # Simulate work
    
    update_message = f"Background task for '{command}' completed for {user_name}."
    voodoo_internal_state["status"] = "completed task"
    
    # Send the update back to the user via the Telegram bot handler
    send_message_to_telegram_bot(chat_id, update_message)
    print(f"Sent update to Telegram bot handler for chat {chat_id}")


@app.route('/send_message', methods=['POST'])
def send_message_to_user():
    """
    API endpoint for the Voodoo project to send messages to the user via Telegram.
    The Telegram bot handler will call this when it needs to send a message.
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid JSON"}), 400

    chat_id = data.get("chat_id")
    message = data.get("message")

    if not all([chat_id, message]):
        return jsonify({"error": "Missing required fields: chat_id, message"}), 400

    # This endpoint is called by the Voodoo project to send a message to the user.
    # It needs to tell the Telegram bot script to send this message.
    # The Telegram bot script is assumed to be running and listening on VOODOO_CALLBACK_URL.
    # So, this voodoo_api_adapter would actually call the Telegram bot API
    # or a dedicated endpoint on the bot handler.
    
    print(f"Voodoo project received request to send message to chat {chat_id}: {message}")
    
    # Forward the message to the bot handler to actually send it via Telegram
    send_message_to_telegram_bot(chat_id, message)
    
    return jsonify({"status": "message queued for sending"})

@app.route('/')
def index():
    return "Voodoo API is running. Use /process_message to receive messages from Telegram."

if __name__ == '__main__':
    print(f"Starting Voodoo API adapter on port {VOODOO_API_PORT}")
    # To run this:
    # 1. Save this code as voodoo_api_adapter.py
    # 2. Create a .env file in the same directory with:
    #    TELEGRAM_BOT_TOKEN=8626532449:AAEaexVVV_9SO0waKVImKgLi8F4c8pAn5os
    #    VOODOO_API_PORT=5000
    #    BOT_SEND_MESSAGE_URL=http://localhost:5001/send_message # Assuming bot runs on 5001
    # 3. Run: python voodoo_api_adapter.py
    
    app.run(port=VOODOO_API_PORT, debug=True)
