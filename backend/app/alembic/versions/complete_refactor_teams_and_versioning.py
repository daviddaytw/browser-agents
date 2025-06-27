"""Complete refactor: teams and full agent configuration versioning

Revision ID: complete_refactor_teams_and_versioning
Revises: f1234567890a
Create Date: 2025-01-26 19:48:00.000000

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'complete_refactor_teams_and_versioning'
down_revision = 'f1234567890a'
branch_labels = None
depends_on = None


def upgrade():
    # Drop all existing tables to start fresh (ignoring backward compatibility)
    op.execute("DROP TABLE IF EXISTS agentpromptversion CASCADE")
    op.execute("DROP TABLE IF EXISTS agentwebhook CASCADE")
    op.execute("DROP TABLE IF EXISTS agentexecution CASCADE")
    op.execute("DROP TABLE IF EXISTS agent CASCADE")
    op.execute("DROP TABLE IF EXISTS apikey CASCADE")
    
    # Create team table
    op.create_table('team',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.String(length=1000), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create team_member table (many-to-many between user and team)
    op.create_table('teammember',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('team_id', sa.UUID(), nullable=False),
        sa.Column('role', sa.String(length=50), nullable=False),
        sa.Column('joined_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['team_id'], ['team.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create agent table (simplified, configurations are versioned separately)
    op.create_table('agent',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.String(length=1000), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('team_id', sa.UUID(), nullable=False),
        sa.Column('created_by', sa.UUID(), nullable=False),
        sa.Column('current_config_version', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['created_by'], ['user.id'], ),
        sa.ForeignKeyConstraint(['team_id'], ['team.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create agent configuration table (versioned configurations)
    op.create_table('agentconfiguration',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('version', sa.Integer(), nullable=False),
        sa.Column('task_prompt', sa.Text(), nullable=False),
        sa.Column('llm_model', sa.String(length=100), nullable=False),
        sa.Column('llm_config', sa.JSON(), nullable=False),
        sa.Column('browser_settings', sa.JSON(), nullable=False),
        sa.Column('agent_settings', sa.JSON(), nullable=False),
        sa.Column('change_description', sa.String(length=1000), nullable=True),
        sa.Column('is_current', sa.Boolean(), nullable=False),
        sa.Column('agent_id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('created_by', sa.UUID(), nullable=False),
        sa.ForeignKeyConstraint(['agent_id'], ['agent.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['created_by'], ['user.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create apikey table (updated to reference user)
    op.create_table('apikey',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('owner_id', sa.UUID(), nullable=False),
        sa.Column('key_hash', sa.String(length=255), nullable=False),
        sa.Column('key_prefix', sa.String(length=10), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('last_used', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['owner_id'], ['user.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create agent execution table (updated to reference started_by user and config used)
    op.create_table('agentexecution',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('task_input', sa.Text(), nullable=True),
        sa.Column('parameters', sa.JSON(), nullable=False),
        sa.Column('result', sa.JSON(), nullable=True),
        sa.Column('execution_history', sa.JSON(), nullable=False),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('config_version_used', sa.Integer(), nullable=False),
        sa.Column('agent_id', sa.UUID(), nullable=False),
        sa.Column('config_id', sa.UUID(), nullable=False),
        sa.Column('started_by', sa.UUID(), nullable=False),
        sa.Column('started_at', sa.DateTime(), nullable=False),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['agent_id'], ['agent.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['config_id'], ['agentconfiguration.id'], ),
        sa.ForeignKeyConstraint(['started_by'], ['user.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create agent webhook table
    op.create_table('agentwebhook',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('url', sa.String(length=500), nullable=False),
        sa.Column('secret', sa.String(length=255), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('agent_id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['agent_id'], ['agent.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for better performance
    op.create_index('ix_teammember_user_id', 'teammember', ['user_id'])
    op.create_index('ix_teammember_team_id', 'teammember', ['team_id'])
    op.create_index('ix_agent_team_id', 'agent', ['team_id'])
    op.create_index('ix_agent_created_by', 'agent', ['created_by'])
    op.create_index('ix_agentconfiguration_agent_id', 'agentconfiguration', ['agent_id'])
    op.create_index('ix_agentconfiguration_version', 'agentconfiguration', ['agent_id', 'version'], unique=True)
    op.create_index('ix_agentexecution_agent_id', 'agentexecution', ['agent_id'])
    op.create_index('ix_agentexecution_started_by', 'agentexecution', ['started_by'])
    op.create_index('ix_agentwebhook_agent_id', 'agentwebhook', ['agent_id'])


def downgrade():
    # Drop all tables (since we're doing a complete refactor)
    op.drop_index('ix_agentwebhook_agent_id', table_name='agentwebhook')
    op.drop_index('ix_agentexecution_started_by', table_name='agentexecution')
    op.drop_index('ix_agentexecution_agent_id', table_name='agentexecution')
    op.drop_index('ix_agentconfiguration_version', table_name='agentconfiguration')
    op.drop_index('ix_agentconfiguration_agent_id', table_name='agentconfiguration')
    op.drop_index('ix_agent_created_by', table_name='agent')
    op.drop_index('ix_agent_team_id', table_name='agent')
    op.drop_index('ix_teammember_team_id', table_name='teammember')
    op.drop_index('ix_teammember_user_id', table_name='teammember')
    
    op.drop_table('agentwebhook')
    op.drop_table('agentexecution')
    op.drop_table('apikey')
    op.drop_table('agentconfiguration')
    op.drop_table('agent')
    op.drop_table('teammember')
    op.drop_table('team')
