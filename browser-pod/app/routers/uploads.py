import os
import uuid
from pathlib import Path
from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse

from ..models.requests import UploadFileRequest
from ..models.responses import UploadFileResponse
from ..config import settings

router = APIRouter(prefix="/api/v1", tags=["API v1.0"])


@router.post("/uploads/presigned-url", response_model=UploadFileResponse)
async def upload_file_presigned_url(request: UploadFileRequest):
    """
    Returns a presigned url for uploading a file to the user's files bucket.
    After uploading a file, the user can use the `included_file_names` field
    in the `RunTaskRequest` to include the files in the task.
    """
    # Validate content type
    if request.content_type not in settings.ALLOWED_FILE_TYPES:
        raise HTTPException(
            status_code=400, 
            detail=f"Content type {request.content_type} not allowed"
        )
    
    # Generate unique file ID to avoid conflicts
    file_id = str(uuid.uuid4())
    file_extension = Path(request.file_name).suffix
    unique_filename = f"{file_id}{file_extension}"
    
    # For local development, return a direct upload URL
    # In production, you would generate a presigned URL to cloud storage
    upload_url = f"/api/v1/upload/{unique_filename}"
    
    return UploadFileResponse(upload_url=upload_url)


@router.put("/upload/{filename}")
async def upload_file_direct(filename: str, file: UploadFile = File(...)):
    """
    Direct file upload endpoint for local development.
    In production, this would be handled by cloud storage with presigned URLs.
    """
    try:
        # Validate file size
        file_content = await file.read()
        if len(file_content) > settings.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Maximum size is {settings.MAX_FILE_SIZE // (1024*1024)}MB"
            )
        
        # Save file to uploads directory
        file_path = settings.UPLOADS_PATH / filename
        
        with open(file_path, "wb") as f:
            f.write(file_content)
        
        return {"status": "uploaded", "filename": filename}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.get("/uploads/{filename}")
async def get_uploaded_file(filename: str):
    """Get an uploaded file."""
    file_path = settings.UPLOADS_PATH / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    from fastapi.responses import FileResponse
    return FileResponse(
        path=str(file_path),
        filename=filename,
        media_type='application/octet-stream'
    )
