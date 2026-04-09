import os
import json
import base64
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.responses import Response
from twilio.twiml.voice_response import VoiceResponse, Connect, Stream
import uvicorn

from super_voodoo.telephony.audio_engine import AudioEngine

app = FastAPI()
audio_engine = AudioEngine()

@app.api_route("/voice", methods=["GET", "POST"])
async def handle_voice(request: Request):
    """Responds to incoming calls with TwiML to start a Media Stream."""
    response = VoiceResponse()
    response.say("Welcome to VoodooAgents. Connecting you to our autonomous AI assistant.")
    
    # The host must be accessible by Twilio (e.g., via ngrok)
    host = request.headers.get("host")
    connect = Connect()
    # In production, this should be wss://
    scheme = "wss" if request.url.scheme == "https" else "ws"
    connect.stream(url=f"{scheme}://{host}/media-stream")
    response.append(connect)
    
    return Response(content=str(response), media_type="application/xml")

@app.websocket("/media-stream")
async def handle_media_stream(websocket: WebSocket):
    """Handles the WebSocket connection from Twilio Media Streams."""
    await websocket.accept()
    print("Twilio Media Stream connected.")
    
    stream_sid = None
    
    try:
        while True:
            message = await websocket.receive_text()
            data = json.loads(message)
            
            if data['event'] == "start":
                stream_sid = data['start']['streamSid']
                print(f"Stream started: {stream_sid}")
                # Send a greeting
                greeting = "Hello! I am your Voodoo autonomous assistant. How can I help you today?"
                payload = await audio_engine.text_to_speech_base64(greeting)
                await websocket.send_text(json.dumps({
                    "event": "media",
                    "streamSid": stream_sid,
                    "media": {"payload": payload}
                }))
            
            elif data['event'] == "media":
                # In a real app, buffer audio and send to STT when silence is detected
                pass
            
            elif data['event'] == "stop":
                print(f"Stream stopped: {stream_sid}")
                break
                
    except WebSocketDisconnect:
        print("WebSocket disconnected.")
    except Exception as e:
        print(f"Telephony Error: {e}")

def start_telephony_server(host: str = "0.0.0.0", port: int = 8000):
    """Helper to start the uvicorn server."""
    uvicorn.run(app, host=host, port=port)

if __name__ == "__main__":
    start_telephony_server()
