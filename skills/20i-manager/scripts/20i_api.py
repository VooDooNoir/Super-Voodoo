import os
import requests
from typing import Dict, Any

class Reseller20iAPI:
    BASE_URL = "https://api.20i.com"
    
    def __init__(self):
        self.token = os.environ.get("20I_BEARER_TOKEN")
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }

    def list_packages(self) -> Dict[str, Any]:
        response = requests.get(f"{self.BASE_URL}/package", headers=self.headers)
        return response.json()

    def create_package(self, domain: str, package_type_id: int) -> Dict[str, Any]:
        payload = {"domain": domain, "type": package_type_id}
        response = requests.post(f"{self.BASE_URL}/package", headers=self.headers, json=payload)
        return response.json()

def get_tools():
    client = Reseller20iAPI()
    return [
        {"name": "20i_list_packages", "func": client.list_packages, "description": "List all 20i hosting packages"},
        {"name": "20i_create_package", "func": client.create_package, "description": "Create a new 20i hosting package"}
    ]
