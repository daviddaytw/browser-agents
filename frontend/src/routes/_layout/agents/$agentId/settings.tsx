import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  Badge,
  Card,
  VStack,
  IconButton,
  Button,
  Input,
  Textarea,
  HStack,
} from "@chakra-ui/react"
import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, Link, useParams } from "@tanstack/react-router"
import { FiArrowLeft, FiEdit, FiSave, FiX } from "react-icons/fi"
import { type SubmitHandler, useForm } from "react-hook-form"

import { AgentsService } from "../../../../client"
import type { AgentUpdate } from "../../../../client"
import type { ApiError } from "../../../../client/core/ApiError"
import useCustomToast from "../../../../hooks/useCustomToast"
import { handleError } from "../../../../utils"
import { Field } from "../../../../components/ui/field"
import AgentSettingsForm from "../../../../components/Agents/AgentSettingsForm"

export const Route = createFileRoute("/_layout/agents/$agentId/settings")({
  component: AgentSettings,
})

function AgentSettings () {
  const { agentId } = useParams({ from: "/_layout/agents/$agentId.settings" })
  const { showErrorToast, showSuccessToast } = useCustomToast()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [llmConfig, setLlmConfig] = useState<Record<string, any>>({})
  const [browserSettings, setBrowserSettings] = useState<Record<string, any>>({})
  const [agentSettings, setAgentSettings] = useState<Record<string, any>>({})

  const {
    data: agent,
    isLoading: agentLoading,
    isError: agentError,
    error: agentErrorDetail,
  } = useQuery({
    queryKey: ["agent", agentId],
    queryFn: () => AgentsService.readAgent({ id: agentId }),
  })

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<AgentUpdate>({
    mode: "onBlur",
    criteriaMode: "all",
  })

  // Initialize form and settings when agent data is loaded
  useEffect(() => {
    if (agent) {
      reset({
        name: agent.name,
        description: agent.description || "",
        task_prompt: agent.task_prompt,
        llm_model: agent.llm_model,
        is_active: agent.is_active,
      })
      setLlmConfig(agent.llm_config || {})
      setBrowserSettings(agent.browser_settings || {})
      setAgentSettings(agent.agent_settings || {})
    }
  }, [agent, reset])

  const llmModel = watch("llm_model") || agent?.llm_model || "gpt-4o"

  const mutation = useMutation({
    mutationFn: (data: AgentUpdate) =>
      AgentsService.updateAgent({ id: agentId, requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Agent updated successfully.")
      setIsEditing(false)
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["agent", agentId] })
    },
  })

  const onSubmit: SubmitHandler<AgentUpdate> = (data) => {
    const agentData = {
      ...data,
      llm_config: llmConfig,
      browser_settings: browserSettings,
      agent_settings: agentSettings,
    }
    mutation.mutate(agentData)
  }

  const handleCancel = () => {
    if (agent) {
      reset({
        name: agent.name,
        description: agent.description || "",
        task_prompt: agent.task_prompt,
        llm_model: agent.llm_model,
        is_active: agent.is_active,
      })
      setLlmConfig(agent.llm_config || {})
      setBrowserSettings(agent.browser_settings || {})
      setAgentSettings(agent.agent_settings || {})
    }
    setIsEditing(false)
  }

  if (agentError) {
    const errDetail = (agentErrorDetail as any)?.body?.detail
    showErrorToast(errDetail || "Failed to load agent")
  }

  if (agentLoading) {
    return (
      <Container maxW="full">
        <Flex justify="center" py={12}>
          <Text>Loading agent...</Text>
        </Flex>
      </Container>
    )
  }

  if (!agent) {
    return (
      <Container maxW="full">
        <Flex justify="center" py={12}>
          <Text>Agent not found</Text>
        </Flex>
      </Container>
    )
  }

  return (
    <Container maxW="full">
      <Flex align="center" gap={4} pt={8} pb={4}>
        <Link to={`/agents/${agentId}`}>
          <IconButton size="sm" variant="outline" aria-label="Back to agent">
            <FiArrowLeft />
          </IconButton>
        </Link>
        <Heading size="lg">{agent.name} - Settings</Heading>
        <Badge
          colorPalette={agent.is_active ? "green" : "red"}
          variant="subtle"
        >
          {agent.is_active ? "Active" : "Inactive"}
        </Badge>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? <FiX /> : <FiEdit />}
          {isEditing ? "Cancel" : "Edit"}
        </Button>
      </Flex>

      {isEditing ? (
        <form onSubmit={handleSubmit(onSubmit)}>
          <VStack gap={6} align="stretch">
            <Card.Root>
              <Card.Header>
                <Card.Title>Basic Information</Card.Title>
              </Card.Header>
              <Card.Body>
                <VStack gap={4}>
                  <Field
                    required
                    invalid={!!errors.name}
                    errorText={errors.name?.message}
                    label="Name"
                  >
                    <Input
                      id="name"
                      {...register("name", {
                        required: "Name is required.",
                      })}
                      placeholder="Agent name"
                      type="text"
                    />
                  </Field>

                  <Field
                    invalid={!!errors.description}
                    errorText={errors.description?.message}
                    label="Description"
                  >
                    <Input
                      id="description"
                      {...register("description")}
                      placeholder="Brief description of what this agent does"
                      type="text"
                    />
                  </Field>

                  <Field
                    required
                    invalid={!!errors.task_prompt}
                    errorText={errors.task_prompt?.message}
                    label="Task Prompt"
                  >
                    <Textarea
                      id="task_prompt"
                      {...register("task_prompt", {
                        required: "Task prompt is required.",
                      })}
                      placeholder="Describe what you want the agent to do..."
                      rows={4}
                    />
                  </Field>

                  <Field
                    required
                    invalid={!!errors.llm_model}
                    errorText={errors.llm_model?.message}
                    label="LLM Model"
                  >
                    <select
                      {...register("llm_model", {
                        required: "Model is required.",
                      })}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        border: "1px solid #e2e8f0",
                        borderRadius: "6px",
                        fontSize: "14px",
                        backgroundColor: "white",
                      }}
                    >
                      <option value="gpt-4o">GPT-4o</option>
                      <option value="gpt-4o-mini">GPT-4o Mini</option>
                      <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
                      <option value="claude-3-5-haiku-20241022">Claude 3.5 Haiku</option>
                    </select>
                  </Field>

                  <Field label="Active">
                    <HStack>
                      <input
                        type="checkbox"
                        {...register("is_active")}
                        style={{
                          width: "16px",
                          height: "16px",
                          accentColor: "#3182ce",
                        }}
                      />
                      <Text fontSize="sm">Agent is active and can be executed</Text>
                    </HStack>
                  </Field>
                </VStack>
              </Card.Body>
            </Card.Root>

            <AgentSettingsForm
              llmConfig={llmConfig}
              setLlmConfig={setLlmConfig}
              browserSettings={browserSettings}
              setBrowserSettings={setBrowserSettings}
              agentSettings={agentSettings}
              setAgentSettings={setAgentSettings}
              llmModel={llmModel}
            />

            <HStack justify="flex-end" gap={4}>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!isValid}
                loading={isSubmitting}
              >
                <FiSave />
                Save Changes
              </Button>
            </HStack>
          </VStack>
        </form>
      ) : (
        <VStack gap={6} align="stretch">
          <Card.Root>
            <Card.Header>
              <Card.Title>Basic Information</Card.Title>
            </Card.Header>
            <Card.Body>
              <VStack gap={4} align="stretch">
                <Box>
                  <Text fontWeight="bold" mb={1}>Name</Text>
                  <Text color="gray.600">{agent.name}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold" mb={1}>Description</Text>
                  <Text color="gray.600">{agent.description || "No description provided"}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold" mb={1}>Task Prompt</Text>
                  <Text
                    color="gray.600"
                    whiteSpace="pre-wrap"
                    p={3}
                    bg="gray.50"
                    borderRadius="md"
                    fontSize="sm"
                  >
                    {agent.task_prompt}
                  </Text>
                </Box>
                <Box>
                  <Text fontWeight="bold" mb={1}>LLM Model</Text>
                  <Badge variant="outline">{agent.llm_model}</Badge>
                </Box>
                <Box>
                  <Text fontWeight="bold" mb={1}>Status</Text>
                  <Badge
                    colorPalette={agent.is_active ? "green" : "red"}
                    variant="subtle"
                  >
                    {agent.is_active ? "Active" : "Inactive"}
                  </Badge>
                </Box>
              </VStack>
            </Card.Body>
          </Card.Root>

          <Card.Root>
            <Card.Header>
              <Card.Title>LLM Configuration</Card.Title>
            </Card.Header>
            <Card.Body>
              <Text fontSize="sm" fontFamily="mono" color="gray.600">
                {JSON.stringify(agent.llm_config, null, 2) || "{}"}
              </Text>
            </Card.Body>
          </Card.Root>

          <Card.Root>
            <Card.Header>
              <Card.Title>Browser Settings</Card.Title>
            </Card.Header>
            <Card.Body>
              <Text fontSize="sm" fontFamily="mono" color="gray.600">
                {JSON.stringify(agent.browser_settings, null, 2) || "{}"}
              </Text>
            </Card.Body>
          </Card.Root>

          <Card.Root>
            <Card.Header>
              <Card.Title>Agent Settings</Card.Title>
            </Card.Header>
            <Card.Body>
              <Text fontSize="sm" fontFamily="mono" color="gray.600">
                {JSON.stringify(agent.agent_settings, null, 2) || "{}"}
              </Text>
            </Card.Body>
          </Card.Root>
        </VStack>
      )}
    </Container>
  )
}
