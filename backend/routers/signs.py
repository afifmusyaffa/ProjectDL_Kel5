import json
from pathlib import Path
from fastapi import APIRouter, HTTPException
from typing import List
from schemas import TrafficSign

router = APIRouter(prefix="/traffic-signs", tags=["traffic-signs"])

SIGNS_FILE = Path(__file__).parent.parent / "traffic_signs.json"


def load_signs() -> List[dict]:
    with open(SIGNS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


@router.get("", response_model=List[TrafficSign])
def get_traffic_signs():
    return load_signs()


@router.get("/{sign_id}", response_model=TrafficSign)
def get_traffic_sign(sign_id: str):
    signs = load_signs()
    for sign in signs:
        if sign["id"] == sign_id:
            return sign
    raise HTTPException(status_code=404, detail="Rambu tidak ditemukan.")
