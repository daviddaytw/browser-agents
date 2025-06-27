import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import (
    Team,
    TeamCreate,
    TeamMember,
    TeamMemberCreate,
    TeamMemberPublic,
    TeamMembersPublic,
    TeamMemberUpdate,
    TeamPublic,
    TeamsPublic,
    TeamUpdate,
    Message,
)

router = APIRouter(prefix="/teams", tags=["teams"])


@router.get("/", response_model=TeamsPublic)
def read_teams(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve teams that the current user is a member of.
    """
    if current_user.is_superuser:
        # Superusers can see all teams
        count_statement = select(func.count()).select_from(Team)
        count = session.exec(count_statement).one()
        statement = select(Team).offset(skip).limit(limit)
        teams = session.exec(statement).all()
    else:
        # Regular users can only see teams they're members of
        count_statement = (
            select(func.count())
            .select_from(Team)
            .join(TeamMember)
            .where(TeamMember.user_id == current_user.id)
            .where(Team.is_active == True)
        )
        count = session.exec(count_statement).one()
        
        statement = (
            select(Team)
            .join(TeamMember)
            .where(TeamMember.user_id == current_user.id)
            .where(Team.is_active == True)
            .offset(skip)
            .limit(limit)
        )
        teams = session.exec(statement).all()

    return TeamsPublic(data=teams, count=count)


@router.get("/{id}", response_model=TeamPublic)
def read_team(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Any:
    """
    Get team by ID.
    """
    team = session.get(Team, id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Check if user is a member of this team or is superuser
    if not current_user.is_superuser:
        membership = session.exec(
            select(TeamMember)
            .where(TeamMember.team_id == id)
            .where(TeamMember.user_id == current_user.id)
        ).first()
        if not membership:
            raise HTTPException(status_code=403, detail="Not a member of this team")
    
    return team


@router.post("/", response_model=TeamPublic)
def create_team(
    *, session: SessionDep, current_user: CurrentUser, team_in: TeamCreate
) -> Any:
    """
    Create new team and add the creator as owner.
    """
    from datetime import datetime
    
    team = Team.model_validate(
        team_in, 
        update={
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
    )
    session.add(team)
    session.commit()
    session.refresh(team)
    
    # Add creator as team owner
    team_member = TeamMember(
        user_id=current_user.id,
        team_id=team.id,
        role="owner",
        joined_at=datetime.utcnow(),
    )
    session.add(team_member)
    session.commit()
    
    return team


@router.put("/{id}", response_model=TeamPublic)
def update_team(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    team_in: TeamUpdate,
) -> Any:
    """
    Update a team (only admins and owners can update).
    """
    from datetime import datetime
    
    team = session.get(Team, id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Check if user has admin/owner permissions
    if not current_user.is_superuser:
        membership = session.exec(
            select(TeamMember)
            .where(TeamMember.team_id == id)
            .where(TeamMember.user_id == current_user.id)
            .where(TeamMember.role.in_(["admin", "owner"]))
        ).first()
        if not membership:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    update_dict = team_in.model_dump(exclude_unset=True)
    update_dict["updated_at"] = datetime.utcnow()
    team.sqlmodel_update(update_dict)
    session.add(team)
    session.commit()
    session.refresh(team)
    return team


@router.delete("/{id}")
def delete_team(
    session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Message:
    """
    Delete a team (only owners can delete).
    """
    team = session.get(Team, id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Check if user is owner
    if not current_user.is_superuser:
        membership = session.exec(
            select(TeamMember)
            .where(TeamMember.team_id == id)
            .where(TeamMember.user_id == current_user.id)
            .where(TeamMember.role == "owner")
        ).first()
        if not membership:
            raise HTTPException(status_code=403, detail="Only team owners can delete teams")
    
    session.delete(team)
    session.commit()
    return Message(message="Team deleted successfully")


# Team Member Management Endpoints

@router.get("/{id}/members", response_model=TeamMembersPublic)
def read_team_members(
    session: SessionDep, current_user: CurrentUser, id: uuid.UUID, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve team members.
    """
    team = session.get(Team, id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Check if user is a member of this team
    if not current_user.is_superuser:
        membership = session.exec(
            select(TeamMember)
            .where(TeamMember.team_id == id)
            .where(TeamMember.user_id == current_user.id)
        ).first()
        if not membership:
            raise HTTPException(status_code=403, detail="Not a member of this team")
    
    count_statement = (
        select(func.count())
        .select_from(TeamMember)
        .where(TeamMember.team_id == id)
    )
    count = session.exec(count_statement).one()
    
    statement = (
        select(TeamMember)
        .where(TeamMember.team_id == id)
        .offset(skip)
        .limit(limit)
    )
    members = session.exec(statement).all()
    
    return TeamMembersPublic(data=members, count=count)


@router.post("/{id}/members", response_model=TeamMemberPublic)
def add_team_member(
    *, session: SessionDep, current_user: CurrentUser, id: uuid.UUID, member_in: TeamMemberCreate
) -> Any:
    """
    Add a member to the team (only admins and owners can add members).
    """
    from datetime import datetime
    
    team = session.get(Team, id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Check if user has admin/owner permissions
    if not current_user.is_superuser:
        membership = session.exec(
            select(TeamMember)
            .where(TeamMember.team_id == id)
            .where(TeamMember.user_id == current_user.id)
            .where(TeamMember.role.in_(["admin", "owner"]))
        ).first()
        if not membership:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    # Check if user is already a member
    existing_member = session.exec(
        select(TeamMember)
        .where(TeamMember.team_id == id)
        .where(TeamMember.user_id == member_in.user_id)
    ).first()
    if existing_member:
        raise HTTPException(status_code=400, detail="User is already a member of this team")
    
    team_member = TeamMember.model_validate(
        member_in,
        update={
            "team_id": id,
            "joined_at": datetime.utcnow(),
        }
    )
    session.add(team_member)
    session.commit()
    session.refresh(team_member)
    return team_member


@router.put("/{id}/members/{member_id}", response_model=TeamMemberPublic)
def update_team_member(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    member_id: uuid.UUID,
    member_in: TeamMemberUpdate,
) -> Any:
    """
    Update a team member's role (only admins and owners can update).
    """
    team = session.get(Team, id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    member = session.get(TeamMember, member_id)
    if not member or member.team_id != id:
        raise HTTPException(status_code=404, detail="Team member not found")
    
    # Check if user has admin/owner permissions
    if not current_user.is_superuser:
        membership = session.exec(
            select(TeamMember)
            .where(TeamMember.team_id == id)
            .where(TeamMember.user_id == current_user.id)
            .where(TeamMember.role.in_(["admin", "owner"]))
        ).first()
        if not membership:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    update_dict = member_in.model_dump(exclude_unset=True)
    member.sqlmodel_update(update_dict)
    session.add(member)
    session.commit()
    session.refresh(member)
    return member


@router.delete("/{id}/members/{member_id}")
def remove_team_member(
    session: SessionDep, current_user: CurrentUser, id: uuid.UUID, member_id: uuid.UUID
) -> Message:
    """
    Remove a member from the team (admins/owners can remove members, users can remove themselves).
    """
    team = session.get(Team, id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    member = session.get(TeamMember, member_id)
    if not member or member.team_id != id:
        raise HTTPException(status_code=404, detail="Team member not found")
    
    # Check permissions: user can remove themselves, or admin/owner can remove others
    if not current_user.is_superuser:
        if member.user_id == current_user.id:
            # User removing themselves is allowed
            pass
        else:
            # Check if current user has admin/owner permissions
            membership = session.exec(
                select(TeamMember)
                .where(TeamMember.team_id == id)
                .where(TeamMember.user_id == current_user.id)
                .where(TeamMember.role.in_(["admin", "owner"]))
            ).first()
            if not membership:
                raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    # Prevent removing the last owner
    if member.role == "owner":
        owner_count = session.exec(
            select(func.count())
            .select_from(TeamMember)
            .where(TeamMember.team_id == id)
            .where(TeamMember.role == "owner")
        ).one()
        if owner_count <= 1:
            raise HTTPException(status_code=400, detail="Cannot remove the last owner of the team")
    
    session.delete(member)
    session.commit()
    return Message(message="Team member removed successfully")
