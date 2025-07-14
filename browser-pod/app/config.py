import os
from pathlib import Path


class Settings:
    """Application settings."""
    
    # Server settings
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    
    # Storage settings
    STORAGE_PATH: Path = Path("storage")
    UPLOADS_PATH: Path = STORAGE_PATH / "uploads"
    SCREENSHOTS_PATH: Path = STORAGE_PATH / "screenshots"
    RECORDINGS_PATH: Path = STORAGE_PATH / "recordings"
    OUTPUTS_PATH: Path = STORAGE_PATH / "outputs"
    
    # Task settings
    MAX_CONCURRENT_TASKS: int = int(os.getenv("MAX_CONCURRENT_TASKS", "5"))
    TASK_TIMEOUT: int = int(os.getenv("TASK_TIMEOUT", "3600"))  # 1 hour
    
    # Browser settings
    BROWSER_HEADLESS: bool = os.getenv("BROWSER_HEADLESS", "true").lower() == "true"
    BROWSER_TIMEOUT: int = int(os.getenv("BROWSER_TIMEOUT", "30000"))  # 30 seconds
    
    # File settings
    MAX_FILE_SIZE: int = int(os.getenv("MAX_FILE_SIZE", "100")) * 1024 * 1024  # 100MB
    ALLOWED_FILE_TYPES: set = {
        "image/png", "image/jpeg", "image/gif", "image/webp",
        "application/pdf", "text/plain", "text/csv",
        "application/json", "application/xml"
    }
    
    def __init__(self):
        # Create storage directories
        for path in [self.UPLOADS_PATH, self.SCREENSHOTS_PATH, 
                    self.RECORDINGS_PATH, self.OUTPUTS_PATH]:
            path.mkdir(parents=True, exist_ok=True)


settings = Settings()
