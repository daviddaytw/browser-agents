import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  Badge,
  Button,
  Card,
  VStack,
  HStack,
  IconButton,
} from "@chakra-ui/react"
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { FiArrowLeft } from "react-icons/fi"

import { AgentsService, ExecutionsService } from "@/client"
import type { AgentExecutionPublic } from "@/client"
import useCustomToast from "@/hooks/useCustomToast"

import DeleteAgent from "@/components/Agents/DeleteAgent"


export const Route = createFileRoute("/_layout/agents/$agentId/")({
  component: AgentDetail,
})

function AgentDetail() {
  const { agentId } = Route.useParams()
  const { showErrorToast, showSuccessToast } = useCustomToast()
  const queryClient = useQueryClient()
  
  // State for execution modal
  const [isExecuteModalOpen, setIsExecuteModalOpen] = useState(false)
  const [parameters, setParameters] = useState("")
  
  // State for execution details modal
  const [selectedExecution, setSelectedExecution] = useState<AgentExecutionPublic | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

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
    data: executions,
    isLoading: executionsLoading,
    isError: executionsError,
    error: executionsErrorDetail,
  } = useQuery({
    queryKey: ["agent-executions", agentId],
    queryFn: () => ExecutionsService.readAgentExecutions({ agentId }),
    refetchInterval: 5000, // Poll every 5 seconds to get real-time updates
  })

  const executeAgentMutation = useMutation({
    mutationFn: (data: { task_input: string | null; parameters: any }) =>
      AgentsService.executeAgentAsync({
        id: agentId,
        requestBody: data,
      }),
    onSuccess: () => {
      showSuccessToast("Agent execution started successfully")
      // Refresh executions list
      queryClient.invalidateQueries({ queryKey: ["agent-executions", agentId] })
      // Close modal and reset form
      setIsExecuteModalOpen(false)
      setParameters("")
    },
    onError: (error: any) => {
      const errDetail = error?.body?.detail || "Failed to execute agent"
      showErrorToast(errDetail)
    },
  })

  const handleExecuteAgent = () => {
    if (!agent?.is_active) {
      showErrorToast("Agent is not active")
      return
    }
    
    let parsedParameters = {}
    if (parameters.trim()) {
      try {
        parsedParameters = JSON.parse(parameters)
      } catch (e) {
        showErrorToast("Invalid JSON format in parameters")
        return
      }
    }
    
    executeAgentMutation.mutate({
      task_input: null,
      parameters: parsedParameters,
    })
  }

  const handleViewDetails = (execution: AgentExecutionPublic) => {
    setSelectedExecution(execution)
    setIsDetailsModalOpen(true)
  }

  if (agentError) {
    const errDetail = (agentErrorDetail as any)?.body?.detail
    showErrorToast(errDetail || "Failed to load agent")
  }

  if (executionsError) {
    const errDetail = (executionsErrorDetail as any)?.body?.detail
    showErrorToast(errDetail || "Failed to load executions")
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
        <Link to="/agents">
          <IconButton size="sm" variant="outline" aria-label="Back to agents">
            <FiArrowLeft />
          </IconButton>
        </Link>
        <Heading size="lg">{agent.name}</Heading>
        <Badge
          colorPalette={agent.is_active ? "green" : "red"}
          variant="subtle"
        >
          {agent.is_active ? "Active" : "Inactive"}
        </Badge>
      </Flex>


      {/* Navigation Links */}
      <Flex gap={4} mb={6}>
        <Link to={`/agents/${agentId}/executions`}>
          <Button variant="outline" size="sm">
            Executions {executions?.count ? `(${executions.count})` : ""}
          </Button>
        </Link>
        <Link to={`/agents/${agentId}/settings`}>
          <Button variant="outline" size="sm">
            Settings
          </Button>
        </Link>
      </Flex>

      {/* Overview Content */}
      <VStack gap={6} align="stretch">
        <Card.Root>
          <Card.Header>
            <Card.Title>Agent Information</Card.Title>
          </Card.Header>
          <Card.Body>
            <VStack gap={4} align="stretch">
              <Box>
                <Text fontWeight="bold" mb={1}>
                  Description
                </Text>
                <Text color="gray.600">
                  {agent.description || "No description provided"}
                </Text>
              </Box>
              <Box>
                <Text fontWeight="bold" mb={1}>
                  Task Prompt
                </Text>
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
              <HStack>
                <Box>
                  <Text fontWeight="bold" mb={1}>
                    Model
                  </Text>
                  <Badge variant="outline">{agent.llm_model}</Badge>
                </Box>
                <Box>
                  <Text fontWeight="bold" mb={1}>
                    Created
                  </Text>
                  <Text color="gray.600">
                    {new Date(agent.created_at).toLocaleDateString()}
                  </Text>
                </Box>
                <Box>
                  <Text fontWeight="bold" mb={1}>
                    Last Updated
                  </Text>
                  <Text color="gray.600">
                    {new Date(agent.updated_at).toLocaleDateString()}
                  </Text>
                </Box>
              </HStack>
            </VStack>
          </Card.Body>
        </Card.Root>

        <Card.Root borderColor="red.200">
          <Card.Header>
            <Card.Title color="red.600">Danger Zone</Card.Title>
          </Card.Header>
          <Card.Body>
            <VStack gap={4} align="stretch">
              <Box>
                <Text fontWeight="bold" mb={2} color="red.600">
                  Delete Agent
                </Text>
                <Text fontSize="sm" color="gray.600" mb={4}>
                  Once you delete an agent, there is no going back. This will permanently delete the agent and all its execution history.
                </Text>
                <DeleteAgent id={agent.id} />
              </Box>
            </VStack>
          </Card.Body>
        </Card.Root>
      </VStack>
    </Container>
  )
}
