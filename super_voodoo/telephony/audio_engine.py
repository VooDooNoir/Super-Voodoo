import asyncio
import base64
import io
import edge_tts
from pydub import AudioSegment
from typing import Optional

class AudioEngine:
    """Handles STT and TTS for the telephony server."""

    def __init__(self, voice: str = "en-US-GuyNeural"):
        self.voice = voice

    async def text_to_speech_base64(self, text: str) -> str:
        """Converts text to 8000Hz mu-law base64 for Twilio."""
        communicate = edge_tts.Communicate(text, self.voice)
        
        audio_data = b""
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_data += chunk["data"]

        if not audio_data:
            return ""

        # Convert to Twilio format (mu-law, 8000Hz, mono)
        audio = AudioSegment.from_file(io.BytesIO(audio_data))
        audio = audio.set_frame_rate(8000).set_channels(1)

        with io.BytesIO() as mulaw_io:
            audio.export(mulaw_io, format="mulaw")
            mulaw_data = mulaw_io.getvalue()

        return base64.b64encode(mulaw_data).decode("utf-8")

    async def speech_to_text_mock(self, audio_base64: str) -> str:
        """Mock STT - returns a hardcoded string after a delay."""
        await asyncio.sleep(0.1)
        # This would normally call Deepgram or similar
        return "This is a transcribed message from the user."

# Example usage pattern for the server
# engine = AudioEngine()
# payload = await engine.text_to_speech_base64("Hello world")
# message = {"event": "media", "streamSid": sid, "media": {"payload": payload}}
