// This file is auto-generated by @hey-api/openapi-ts

export type AgentConfigurationCreate = {
  task_prompt: string
  llm_model?: string
  llm_config?: {
    [key: string]: unknown
  }
  browser_settings?: {
    [key: string]: unknown
  }
  agent_settings?: {
    [key: string]: unknown
  }
  change_description?: string | null
}

export type AgentConfigurationPublic = {
  version: number
  task_prompt: string
  llm_model?: string
  llm_config?: {
    [key: string]: unknown
  }
  browser_settings?: {
    [key: string]: unknown
  }
  agent_settings?: {
    [key: string]: unknown
  }
  change_description?: string | null
  is_current?: boolean
  id: string
  agent_id: string
  created_at: string
  created_by: string
}

export type AgentConfigurationsPublic = {
  data: Array<AgentConfigurationPublic>
  count: number
}

export type AgentCreate = {
  name: string
  description?: string | null
  is_active?: boolean
  team_id: string
  initial_config: AgentConfigurationCreate
}

export type AgentExecutionCreate = {
  task_input?: string | null
  parameters?: {
    [key: string]: unknown
  }
  sensitive_data?: {
    [key: string]: unknown
  } | null
}

export type AgentExecutionPublic = {
  status?: string
  task_input?: string | null
  parameters?: {
    [key: string]: unknown
  }
  result?: {
    [key: string]: unknown
  } | null
  execution_history?: Array<{
    [key: string]: unknown
  }>
  error_message?: string | null
  config_version_used: number
  id: string
  agent_id: string
  config_id: string
  started_by: string
  started_at: string
  completed_at: string | null
}

export type AgentExecutionsPublic = {
  data: Array<AgentExecutionPublic>
  count: number
}

export type AgentPublic = {
  name: string
  description?: string | null
  is_active?: boolean
  id: string
  team_id: string
  created_by: string
  current_config_version: number
  created_at: string
  updated_at: string
}

export type AgentsPublic = {
  data: Array<AgentPublic>
  count: number
}

export type AgentUpdate = {
  name?: string | null
  description?: string | null
  is_active?: boolean | null
}

export type APIKeyCreate = {
  name: string
  is_active?: boolean
}

export type APIKeyPublic = {
  name: string
  is_active?: boolean
  id: string
  owner_id: string
  key_prefix: string
  created_at: string
  last_used: string | null
}

export type APIKeysPublic = {
  data: Array<APIKeyPublic>
  count: number
}

export type APIKeyUpdate = {
  name?: string | null
  is_active?: boolean | null
}

export type APIKeyWithSecret = {
  name: string
  is_active?: boolean
  id: string
  owner_id: string
  key_prefix: string
  created_at: string
  last_used: string | null
  key: string
}

export type Body_login_login_access_token = {
  grant_type?: string | null
  username: string
  password: string
  scope?: string
  client_id?: string | null
  client_secret?: string | null
}

export type HTTPValidationError = {
  detail?: Array<ValidationError>
}

export type Message = {
  message: string
}

export type NewPassword = {
  token: string
  new_password: string
}

export type TeamCreate = {
  name: string
  description?: string | null
  is_active?: boolean
}

export type TeamMemberCreate = {
  user_id: string
  role?: string
}

export type TeamMemberPublic = {
  role?: string
  id: string
  user_id: string
  team_id: string
  joined_at: string
}

export type TeamMembersPublic = {
  data: Array<TeamMemberPublic>
  count: number
}

export type TeamMemberUpdate = {
  role?: string | null
}

export type TeamPublic = {
  name: string
  description?: string | null
  is_active?: boolean
  id: string
  created_at: string
  updated_at: string
}

export type TeamsPublic = {
  data: Array<TeamPublic>
  count: number
}

export type TeamUpdate = {
  name?: string | null
  description?: string | null
  is_active?: boolean | null
}

export type Token = {
  access_token: string
  token_type?: string
}

export type UpdatePassword = {
  current_password: string
  new_password: string
}

export type UserCreate = {
  email: string
  is_active?: boolean
  is_superuser?: boolean
  full_name?: string | null
  password: string
}

export type UserPublic = {
  email: string
  is_active?: boolean
  is_superuser?: boolean
  full_name?: string | null
  id: string
}

export type UserRegister = {
  email: string
  password: string
  full_name?: string | null
}

export type UsersPublic = {
  data: Array<UserPublic>
  count: number
}

export type UserUpdate = {
  email?: string | null
  is_active?: boolean
  is_superuser?: boolean
  full_name?: string | null
  password?: string | null
}

export type UserUpdateMe = {
  full_name?: string | null
  email?: string | null
}

export type ValidationError = {
  loc: Array<string | number>
  msg: string
  type: string
}

export type AgentsReadAgentsData = {
  limit?: number
  skip?: number
  teamId?: string | null
}

export type AgentsReadAgentsResponse = AgentsPublic

export type AgentsCreateAgentData = {
  requestBody: AgentCreate
}

export type AgentsCreateAgentResponse = AgentPublic

export type AgentsReadAgentData = {
  id: string
}

export type AgentsReadAgentResponse = AgentPublic

export type AgentsUpdateAgentData = {
  id: string
  requestBody: AgentUpdate
}

export type AgentsUpdateAgentResponse = AgentPublic

export type AgentsDeleteAgentData = {
  id: string
}

export type AgentsDeleteAgentResponse = Message

export type AgentsTestAgentData = {
  id: string
  requestBody: AgentExecutionCreate
}

export type AgentsTestAgentResponse = AgentExecutionPublic

export type AgentsReadAgentConfigurationsData = {
  id: string
  limit?: number
  skip?: number
}

export type AgentsReadAgentConfigurationsResponse = AgentConfigurationsPublic

export type AgentsCreateAgentConfigurationData = {
  id: string
  requestBody: AgentConfigurationCreate
}

export type AgentsCreateAgentConfigurationResponse = AgentConfigurationPublic

export type AgentsReadAgentConfigurationData = {
  configId: string
  id: string
}

export type AgentsReadAgentConfigurationResponse = AgentConfigurationPublic

export type AgentsActivateAgentConfigurationData = {
  configId: string
  id: string
}

export type AgentsActivateAgentConfigurationResponse = AgentPublic

export type ApiKeysReadApiKeysData = {
  limit?: number
  skip?: number
}

export type ApiKeysReadApiKeysResponse = APIKeysPublic

export type ApiKeysCreateApiKeyData = {
  requestBody: APIKeyCreate
}

export type ApiKeysCreateApiKeyResponse = APIKeyWithSecret

export type ApiKeysReadApiKeyData = {
  id: string
}

export type ApiKeysReadApiKeyResponse = APIKeyPublic

export type ApiKeysUpdateApiKeyData = {
  id: string
  requestBody: APIKeyUpdate
}

export type ApiKeysUpdateApiKeyResponse = APIKeyPublic

export type ApiKeysDeleteApiKeyData = {
  id: string
}

export type ApiKeysDeleteApiKeyResponse = Message

export type ExecutionsReadExecutionsData = {
  limit?: number
  skip?: number
}

export type ExecutionsReadExecutionsResponse = AgentExecutionsPublic

export type ExecutionsReadExecutionData = {
  id: string
}

export type ExecutionsReadExecutionResponse = AgentExecutionPublic

export type ExecutionsDeleteExecutionData = {
  id: string
}

export type ExecutionsDeleteExecutionResponse = Message

export type ExecutionsReadAgentExecutionsData = {
  agentId: string
  limit?: number
  skip?: number
}

export type ExecutionsReadAgentExecutionsResponse = AgentExecutionsPublic

export type ExecutionsCreateExecutionData = {
  agentId: string
  requestBody: AgentExecutionCreate
}

export type ExecutionsCreateExecutionResponse = AgentExecutionPublic

export type ExecutionsCancelExecutionData = {
  id: string
}

export type ExecutionsCancelExecutionResponse = Message

export type LoginLoginAccessTokenData = {
  formData: Body_login_login_access_token
}

export type LoginLoginAccessTokenResponse = Token

export type LoginTestTokenResponse = UserPublic

export type LoginRecoverPasswordData = {
  email: string
}

export type LoginRecoverPasswordResponse = Message

export type LoginResetPasswordData = {
  requestBody: NewPassword
}

export type LoginResetPasswordResponse = Message

export type TeamsReadTeamsData = {
  limit?: number
  skip?: number
}

export type TeamsReadTeamsResponse = TeamsPublic

export type TeamsCreateTeamData = {
  requestBody: TeamCreate
}

export type TeamsCreateTeamResponse = TeamPublic

export type TeamsReadTeamData = {
  id: string
}

export type TeamsReadTeamResponse = TeamPublic

export type TeamsUpdateTeamData = {
  id: string
  requestBody: TeamUpdate
}

export type TeamsUpdateTeamResponse = TeamPublic

export type TeamsDeleteTeamData = {
  id: string
}

export type TeamsDeleteTeamResponse = Message

export type TeamsReadTeamMembersData = {
  id: string
  limit?: number
  skip?: number
}

export type TeamsReadTeamMembersResponse = TeamMembersPublic

export type TeamsAddTeamMemberData = {
  id: string
  requestBody: TeamMemberCreate
}

export type TeamsAddTeamMemberResponse = TeamMemberPublic

export type TeamsUpdateTeamMemberData = {
  id: string
  memberId: string
  requestBody: TeamMemberUpdate
}

export type TeamsUpdateTeamMemberResponse = TeamMemberPublic

export type TeamsRemoveTeamMemberData = {
  id: string
  memberId: string
}

export type TeamsRemoveTeamMemberResponse = Message

export type UsersReadUsersData = {
  limit?: number
  skip?: number
}

export type UsersReadUsersResponse = UsersPublic

export type UsersCreateUserData = {
  requestBody: UserCreate
}

export type UsersCreateUserResponse = UserPublic

export type UsersReadUserMeResponse = UserPublic

export type UsersDeleteUserMeResponse = Message

export type UsersUpdateUserMeData = {
  requestBody: UserUpdateMe
}

export type UsersUpdateUserMeResponse = UserPublic

export type UsersUpdatePasswordMeData = {
  requestBody: UpdatePassword
}

export type UsersUpdatePasswordMeResponse = Message

export type UsersRegisterUserData = {
  requestBody: UserRegister
}

export type UsersRegisterUserResponse = UserPublic

export type UsersReadUserByIdData = {
  userId: string
}

export type UsersReadUserByIdResponse = UserPublic

export type UsersUpdateUserData = {
  requestBody: UserUpdate
  userId: string
}

export type UsersUpdateUserResponse = UserPublic

export type UsersDeleteUserData = {
  userId: string
}

export type UsersDeleteUserResponse = Message

export type UtilsHealthCheckResponse = boolean
