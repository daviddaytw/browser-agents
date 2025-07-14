import pytest
import io
from fastapi import UploadFile


def test_upload_presigned_url(client, sample_upload_request):
    """Test getting presigned URL for upload."""
    response = client.post("/api/v1/uploads/presigned-url", json=sample_upload_request)
    assert response.status_code == 200
    
    data = response.json()
    assert "upload_url" in data
    assert data["upload_url"].startswith("/api/v1/upload/")


def test_upload_presigned_url_invalid_content_type(client):
    """Test getting presigned URL with invalid content type."""
    request = {
        "file_name": "test.exe",
        "content_type": "application/x-executable"
    }
    
    response = client.post("/api/v1/uploads/presigned-url", json=request)
    assert response.status_code == 400
    assert "not allowed" in response.json()["detail"]


def test_direct_file_upload(client):
    """Test direct file upload."""
    # Create a test file
    file_content = b"This is a test file content"
    files = {"file": ("test.txt", io.BytesIO(file_content), "text/plain")}
    
    response = client.put("/api/v1/upload/test-file.txt", files=files)
    assert response.status_code == 200
    
    data = response.json()
    assert data["status"] == "uploaded"
    assert data["filename"] == "test-file.txt"


def test_direct_file_upload_too_large(client):
    """Test direct file upload with file too large."""
    # Create a large file (simulate by mocking the file size check)
    large_content = b"x" * (101 * 1024 * 1024)  # 101MB
    files = {"file": ("large.txt", io.BytesIO(large_content), "text/plain")}
    
    response = client.put("/api/v1/upload/large-file.txt", files=files)
    assert response.status_code == 413
    assert "File too large" in response.json()["detail"]


def test_get_uploaded_file_not_found(client):
    """Test getting non-existent uploaded file."""
    response = client.get("/api/v1/uploads/non-existent-file.txt")
    assert response.status_code == 404
    assert response.json()["detail"] == "File not found"


@pytest.mark.asyncio
async def test_upload_workflow(async_client, sample_upload_request):
    """Test complete upload workflow."""
    # Get presigned URL
    response = await async_client.post("/api/v1/uploads/presigned-url", json=sample_upload_request)
    assert response.status_code == 200
    
    upload_url = response.json()["upload_url"]
    
    # Extract filename from URL
    filename = upload_url.split("/")[-1]
    
    # Upload file
    file_content = b"Test file content for workflow"
    files = {"file": ("test.txt", io.BytesIO(file_content), "text/plain")}
    
    response = await async_client.put(upload_url, files=files)
    assert response.status_code == 200
    
    # Verify file was uploaded
    response = await async_client.get(f"/api/v1/uploads/{filename}")
    assert response.status_code == 200


def test_upload_validation():
    """Test upload request validation."""
    from app.models.requests import UploadFileRequest
    
    # Valid request
    valid_request = UploadFileRequest(
        file_name="test.txt",
        content_type="text/plain"
    )
    assert valid_request.file_name == "test.txt"
    assert valid_request.content_type == "text/plain"
    
    # Test with different file types
    image_request = UploadFileRequest(
        file_name="image.png",
        content_type="image/png"
    )
    assert image_request.content_type == "image/png"
