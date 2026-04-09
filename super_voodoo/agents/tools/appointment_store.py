import json
import os
from typing import List, Dict

class AppointmentStore:
    """Manages persistent storage for appointments in a JSON file."""

    def __init__(self, storage_file: str = "data/appointments.json"):
        self.storage_file = storage_file
        self.appointments: List[Dict] = self._load_appointments()

    def _load_appointments(self) -> List[Dict]:
        if os.path.exists(self.storage_file):
            try:
                with open(self.storage_file, "r") as f:
                    return json.load(f)
            except Exception:
                return []
        return []

    def _save_appointments(self):
        os.makedirs(os.path.dirname(self.storage_file), exist_ok=True)
        with open(self.storage_file, "w") as f:
            json.dump(self.appointments, f, indent=2)

    def add_appointment(self, date: str, time: str, service: str) -> bool:
        """Adds a new appointment if no conflict exists."""
        if self._has_conflict(date, time):
            return False
        
        self.appointments.append({
            "date": date,
            "time": time,
            "service": service
        })
        self._save_appointments()
        return True

    def _has_conflict(self, date: str, time: str) -> bool:
        for appt in self.appointments:
            if appt["date"] == date and appt["time"] == time:
                return True
        return False

    def list_appointments(self) -> List[Dict]:
        return self.appointments
