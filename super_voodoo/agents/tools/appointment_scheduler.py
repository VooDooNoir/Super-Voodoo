from typing import Any
from super_voodoo.agents.core.base_tool import BaseTool

from super_voodoo.agents.tools.appointment_store import AppointmentStore

class AppointmentScheduler(BaseTool):
    """Tool for scheduling and managing appointments with persistent storage."""

    def __init__(self, storage_file: str = "data/appointments.json"):
        self.store = AppointmentStore(storage_file)

    @property
    def name(self) -> str:
        return "appointment_scheduler"

    def execute(self, date: str, time: str, service: str, **kwargs) -> str:
        """
        Schedules an appointment.
        
        Args:
            date: The date of the appointment (YYYY-MM-DD).
            time: The time of the appointment (HH:MM).
            service: The service being booked.
        """
        success = self.store.add_appointment(date, time, service)
        if success:
            return f"AppointmentScheduler: Successfully scheduled {service} for {date} at {time}."
        else:
            return f"AppointmentScheduler: Error - The slot {date} at {time} is already booked."
