import pytest
import os
from super_voodoo.agents.tools.phone_answerer import PhoneAnswerer
from super_voodoo.agents.tools.appointment_scheduler import AppointmentScheduler
from super_voodoo.agents.tools.voodooagents_info import VoodooagentsInfo
from super_voodoo.agents.tools.social_media_manager import SocialMediaManager

def test_phone_answerer():
    tool = PhoneAnswerer()
    assert tool.name == "phone_answerer"
    result = tool.execute(call_id="123", action="answer")
    assert "Answering call 123" in result

def test_appointment_scheduler():
    # Use a test file to avoid side effects
    tool = AppointmentScheduler(storage_file="data/test_appointments.json")
    assert tool.name == "appointment_scheduler"
    result = tool.execute(date="2026-04-10", time="10:00", service="Consultation")
    assert "Successfully scheduled Consultation" in result
    
    # Verify persistence
    result2 = tool.execute(date="2026-04-10", time="10:00", service="Consultation")
    assert "already booked" in result2

    if os.path.exists("data/test_appointments.json"):
        os.remove("data/test_appointments.json")

def test_voodooagents_info():
    tool = VoodooagentsInfo()
    assert tool.name == "voodooagents_info"
    result = tool.execute(query="What is VoodooAgents?")
    assert "VoodooAgents" in result

def test_social_media_manager():
    tool = SocialMediaManager()
    assert tool.name == "social_media_manager"
    result = tool.execute(platform="twitter", content="Hello world!")
    assert "Posted to twitter" in result
