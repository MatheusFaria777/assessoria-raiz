from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class AdsetBase(BaseModel):
    label: str
    adset_id: str
    page_id: Optional[str] = None
    whatsapp: Optional[str] = None
    instagram_actor_id: Optional[str] = None
    store_name: Optional[str] = None
    store_description: Optional[str] = None
    store_address: Optional[str] = None
    store_phone: Optional[str] = None
    store_whatsapp_display: Optional[str] = None
    store_website: Optional[str] = None
    template_ad_id: Optional[str] = None
    lead_gen_form_id: Optional[str] = None
    active: bool = True


class AdsetCreate(AdsetBase):
    id: Optional[int] = None  # presente ao atualizar adsets existentes


class AdsetOut(AdsetBase):
    id: int
    client_id: int
    model_config = {"from_attributes": True}


class ClientCreate(BaseModel):
    name: str
    has_meta: bool = False
    meta_account_id: Optional[str] = None
    meta_access_token: Optional[str] = None
    has_google: bool = False
    google_customer_id: Optional[str] = None
    google_credentials: Optional[str] = None
    sheets_id: Optional[str] = None
    sheets_tabs: Optional[str] = None
    report_days: Optional[str] = None
    cadencia_ativa: bool = True
    cadencia_contexto: Optional[str] = None
    campaign_group_ids: List[int] = []
    adsets: List[AdsetCreate] = []


class ClientUpdate(ClientCreate):
    pass


class CampaignGroupRef(BaseModel):
    id: int
    name: str
    type: str
    color: str
    model_config = {"from_attributes": True}


class ClientOut(BaseModel):
    id: int
    name: str
    active: bool
    has_meta: bool
    meta_account_id: Optional[str] = None
    meta_token_expires: Optional[datetime] = None
    has_google: bool
    google_customer_id: Optional[str] = None
    sheets_id: Optional[str] = None
    sheets_tabs: Optional[str] = None
    report_days: Optional[str] = None
    cadencia_ativa: bool = True
    cadencia_contexto: Optional[str] = None
    created_at: datetime
    campaign_groups: List[CampaignGroupRef] = []
    adsets: List[AdsetOut] = []
    model_config = {"from_attributes": True}
