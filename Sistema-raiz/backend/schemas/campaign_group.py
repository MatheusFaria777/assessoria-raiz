from pydantic import BaseModel
from typing import Optional, List


class CampaignGroupCreate(BaseModel):
    name: str
    type: str
    color: str = "#CBA135"
    keywords: str
    is_global: bool = True
    platform: str = "meta"   # meta | google | both


class CampaignGroupUpdate(CampaignGroupCreate):
    pass


class CampaignGroupOut(BaseModel):
    id: int
    name: str
    type: str
    color: str
    keywords: str
    is_global: bool
    active: bool
    platform: str = "meta"
    model_config = {"from_attributes": True}
