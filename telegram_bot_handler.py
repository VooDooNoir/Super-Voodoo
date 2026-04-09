# telegram_bot_handler.py
import logging
import os
import requests
import json
from dotenv import load_dotenv
from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, MessageHandler, filters, ContextTypes

# Load environment variables from .env file
# This file should contain:
# TELEGRAM_BOT_TOKEN=YOUR_TELEGRAM_BOT_TOKEN
# VOODOO_API_URL=http://localhost:5000/process_message (or your voodoo API endpoint)
# VOODOO_CALLBACK_URL=http://localhost:5001/send_message (or your bot's callback endpoint)
load_dotenv()

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
VOODOO_API_URL = os.getenv("VOODOO_API_URL", "http://localhost:5000/process_message") # Default to localhost:5000
VOODOO_CALLBACK_URL = os.getenv("VOODOO_CALLBACK_URL", "http://localhost:5001/send_message") # Default to localhost:5001

# Enable logging
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", level=logging.INFO
)
logger = logging.getLogger(__name__)

# Store chat_id for replying (simple in-memory storage for demo)
# In a real application, you might want a more persistent way to map chat_ids if needed.
# For this example, we'll assume commands are directed to the bot, and replies go back.
# If voodoo needs to proactively message the user, it needs the chat_id.
# We'll set up a simple endpoint for voodoo to send messages.
active_chats = {} # {chat_id: {user_id: ..., first_name: ..., ...}}

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Send a message when the command /start is issued."""
    user = update.effective_user
    chat_id = update.effective_chat.id
    
    # Store chat info for potential proactive messaging by voodoo
    active_chats[chat_id] = user.to_dict() 
    
    await update.message.reply_html(
        f"Hi {user.mention_html()}! I'm your Voodoo communication bot. "
        f"Send me a message, and I'll forward it to Voodoo. "
        f"To receive updates from Voodoo, ensure it knows your chat ID: {chat_id}",
    )
    logger.info(f"User {user.id} ({user.first_name}) started chat with ID: {chat_id}")

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Echo the user message and send it to Voodoo API."""
    user_message = update.message.text
    chat_id = update.effective_chat.id
    user_id = update.effective_user.id
    user_name = update.effective_user.first_name

    logger.info(f"Received message from chat {chat_id} (User ID: {user_id}): {user_message}")

    # Forward the message to the Voodoo project's API
    try:
        response = requests.post(VOODOO_API_URL, json={
            "chat_id": chat_id,
            "user_id": user_id,
            "user_name": user_name,
            "message": user_message
        })
        response.raise_for_status() # Raise an exception for bad status codes
        
        # If Voodoo's API responded with something to relay back immediately
        # This part depends on how Voodoo's API is designed to respond
        # For now, we assume Voodoo will use the callback URL to send messages back
        # If Voodoo's API responds with a direct message for the user:
        # voodoo_response_data = response.json()
        # if voodoo_response_data.get("reply"):
        #     await update.message.reply_text(voodoo_response_data["reply"])

        await update.message.reply_text("Message forwarded to Voodoo.")

    except requests.exceptions.RequestException as e:
        logger.error(f"Error sending message to Voodoo API: {e}")
        await update.message.reply_text(f"Sorry, I couldn't forward your message to Voodoo. Error: {e}")
    except Exception as e:
        logger.error(f"An unexpected error occurred: {e}")
        await update.message.reply_text(f"An unexpected error occurred: {e}")


async def send_message_from_voodoo(chat_id: int, message: str) -> None:
    """Sends a message to a specific Telegram chat ID."""
    # This function will be called by a separate webhook/API endpoint
    # that your voodoo project communicates with.
    try:
        # Use the bot object to send a message
        # Note: To use this within an async context managed by Application,
        # we might need to pass the bot object or context.
        # For simplicity here, assuming we can get bot access or use a global one.
        # A more robust solution would involve a webhook for the bot server.
        
        # For example, if running a web server for the bot:
        # requests.post(VOODOO_CALLBACK_URL, json={"chat_id": chat_id, "message": message})

        logger.info(f"Simulating sending message to chat {chat_id}: {message}")
        # In a real application, this would trigger the bot to send the message.
        # If you are running this bot script as a server, voodoo can call VOODOO_CALLBACK_URL.

    except Exception as e:
        logger.error(f"Error sending message from voodoo to chat {chat_id}: {e}")


def main() -> None:
    """Start the bot."""
    if not TELEGRAM_BOT_TOKEN:
        logger.error("TELEGRAM_BOT_TOKEN not found. Please set it in your .env file.")
        return

    # Create the Application and pass it your bot's token.
    application = ApplicationBuilder().token(TELEGRAM_BOT_TOKEN).build()

    # on different commands - answer in Telegram
    application.add_handler(CommandHandler("start", start))

    # on non-command messages - echo the message and forward to voodoo
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))

    # Run the bot until the user presses Ctrl-C
    logger.info("Bot started. Press Ctrl-C to stop.")
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == "__main__":
    main()
