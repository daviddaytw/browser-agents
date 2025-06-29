from fastapi import APIRouter

from app.api.routes import agents, api_keys, executions, login, teams, users, utils
from app.core.config import settings

api_router = APIRouter()
api_router.include_router(login.router)
api_router.include_router(users.router)
api_router.include_router(utils.router)
api_router.include_router(teams.router)
api_router.include_router(agents.router)
api_router.include_router(api_keys.router)
api_router.include_router(executions.router)
