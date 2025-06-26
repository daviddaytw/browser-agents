import hashlib
import secrets
import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import (
    APIKey,
    APIKeyCreate,
    APIKeyPublic,
    APIKeysPublic,
    APIKeyUpdate,
    APIKeyWithSecret,
    Message,
)

router = APIRouter(prefix="/api-keys", tags=["api-keys"])


def generate_api_key() -> tuple[str, str, str]:
    """Generate a new API key and return (key, hash, prefix)"""
    key = f"ba_{secrets.token_urlsafe(32)}"  # ba = browser agents
    key_hash = hashlib.sha256(key.encode()).hexdigest()
    key_prefix = key[:8]  # First 8 characters for display
    return key, key_hash, key_prefix


@router.get("/", response_model=APIKeysPublic)
def read_api_keys(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve API keys.
    """
    count_statement = (
        select(func.count())
        .select_from(APIKey)
        .where(APIKey.owner_id == current_user.id)
    )
    count = session.exec(count_statement).one()
    statement = (
        select(APIKey)
        .where(APIKey.owner_id == current_user.id)
        .offset(skip)
        .limit(limit)
    )
    api_keys = session.exec(statement).all()

    return APIKeysPublic(data=api_keys, count=count)


@router.get("/{id}", response_model=APIKeyPublic)
def read_api_key(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Any:
    """
    Get API key by ID.
    """
    api_key = session.get(APIKey, id)
    if not api_key:
        raise HTTPException(status_code=404, detail="API key not found")
    if api_key.owner_id != current_user.id:
        raise HTTPException(status_code=400, detail="Not enough permissions")
    return api_key


@router.post("/", response_model=APIKeyWithSecret)
def create_api_key(
    *, session: SessionDep, current_user: CurrentUser, api_key_in: APIKeyCreate
) -> Any:
    """
    Create new API key.
    """
    from datetime import datetime
    
    key, key_hash, key_prefix = generate_api_key()
    
    api_key = APIKey.model_validate(
        api_key_in,
        update={
            "owner_id": current_user.id,
            "key_hash": key_hash,
            "key_prefix": key_prefix,
            "created_at": datetime.utcnow(),
        }
    )
    session.add(api_key)
    session.commit()
    session.refresh(api_key)
    
    # Return the API key with the secret (only time it's shown)
    return APIKeyWithSecret(
        **api_key.model_dump(),
        key=key
    )


@router.put("/{id}", response_model=APIKeyPublic)
def update_api_key(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    api_key_in: APIKeyUpdate,
) -> Any:
    """
    Update an API key.
    """
    api_key = session.get(APIKey, id)
    if not api_key:
        raise HTTPException(status_code=404, detail="API key not found")
    if api_key.owner_id != current_user.id:
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    update_dict = api_key_in.model_dump(exclude_unset=True)
    api_key.sqlmodel_update(update_dict)
    session.add(api_key)
    session.commit()
    session.refresh(api_key)
    return api_key


@router.delete("/{id}")
def delete_api_key(
    session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Message:
    """
    Delete an API key.
    """
    api_key = session.get(APIKey, id)
    if not api_key:
        raise HTTPException(status_code=404, detail="API key not found")
    if api_key.owner_id != current_user.id:
        raise HTTPException(status_code=400, detail="Not enough permissions")
    session.delete(api_key)
    session.commit()
    return Message(message="API key deleted successfully")
