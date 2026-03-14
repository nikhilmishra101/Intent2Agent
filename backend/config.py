from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # App
    app_name: str = "CheckoutMind API"
    debug: bool = True

    # Anthropic / Claude
    anthropic_api_key: str = ""

    # Pine Labs
    pinelabs_base_url: str = "https://pluraluat.v2.pinepg.in"
    pinelabs_merchant_id: str = "demo_merchant_001"
    pinelabs_client_id: str = ""
    pinelabs_client_secret: str = ""

    # Data paths
    intent_output_path: str = "data/intent.json"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
