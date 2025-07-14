from fastapi import APIRouter

router = APIRouter(prefix="/api/v1", tags=["API v1.0"])


@router.get("/ping")
async def ping():
    """Use this endpoint to check if the server is running and responding."""
    return {"status": "ok", "message": "pong"}
