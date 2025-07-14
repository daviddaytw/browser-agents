from enum import Enum


class TaskStatusEnum(str, Enum):
    """Enumeration of possible task states."""
    CREATED = "created"
    RUNNING = "running"
    FINISHED = "finished"
    STOPPED = "stopped"
    PAUSED = "paused"
    FAILED = "failed"


class LLMModel(str, Enum):
    """Supported LLM models."""
    GPT_4O = "gpt-4o"
    GPT_4O_MINI = "gpt-4o-mini"
    GPT_4_1 = "gpt-4.1"
    GPT_4_1_MINI = "gpt-4.1-mini"
    O4_MINI = "o4-mini"
    O3 = "o3"
    GEMINI_2_0_FLASH = "gemini-2.0-flash"
    GEMINI_2_0_FLASH_LITE = "gemini-2.0-flash-lite"
    GEMINI_2_5_FLASH_PREVIEW = "gemini-2.5-flash-preview-04-17"
    GEMINI_2_5_FLASH = "gemini-2.5-flash"
    GEMINI_2_5_PRO = "gemini-2.5-pro"
    CLAUDE_3_7_SONNET = "claude-3-7-sonnet-20250219"
    CLAUDE_SONNET_4 = "claude-sonnet-4-20250514"
    LLAMA_4_MAVERICK = "llama-4-maverick-17b-128e-instruct"


class ProxyCountryCode(str, Enum):
    """Supported proxy country codes."""
    US = "us"
    UK = "uk"
    FR = "fr"
    IT = "it"
    JP = "jp"
    AU = "au"
    DE = "de"
    FI = "fi"
    CA = "ca"
    IN = "in"
