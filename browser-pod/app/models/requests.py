from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from .enums import LLMModel, ProxyCountryCode


class RunTaskRequest(BaseModel):
    """Request model for running a browser automation task."""
    task: str = Field(..., description="What should the agent do")
    secrets: Optional[Dict[str, str]] = Field(None, description="Dictionary of secrets to be used by the agent")
    allowed_domains: Optional[List[str]] = Field(None, description="List of domains that the agent is allowed to visit")
    save_browser_data: Optional[bool] = Field(False, description="If set to True, the browser cookies and other data will be saved")
    structured_output_json: Optional[str] = Field(None, description="JSON schema for structured output")
    llm_model: Optional[LLMModel] = Field(None, description="LLM model to use")
    use_adblock: Optional[bool] = Field(True, description="If set to True, the agent will use an adblocker")
    use_proxy: Optional[bool] = Field(True, description="If set to True, the agent will use a proxy")
    proxy_country_code: Optional[ProxyCountryCode] = Field(ProxyCountryCode.US, description="Country code for residential proxy")
    highlight_elements: Optional[bool] = Field(True, description="If set to True, the agent will highlight the elements on the page")
    included_file_names: Optional[List[str]] = Field(None, description="File names to include in the task")
    browser_viewport_width: Optional[int] = Field(1280, description="Width of the browser viewport in pixels")
    browser_viewport_height: Optional[int] = Field(960, description="Height of the browser viewport in pixels")
    max_agent_steps: Optional[int] = Field(75, description="Maximum number of agent steps to take")
    enable_public_share: Optional[bool] = Field(False, description="Enable public sharing of the task")


class UploadFileRequest(BaseModel):
    """Request model for file upload presigned URL."""
    file_name: str = Field(..., description="Name of the file to upload")
    content_type: str = Field(..., description="Content type of the file to upload")
