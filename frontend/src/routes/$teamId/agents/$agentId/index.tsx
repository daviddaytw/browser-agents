import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  Badge,
  Card,
  Button,
  SimpleGrid,
} from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { FiSettings, FiPlay, FiClock } from "react-icons/fi"

import { AgentsService, ExecutionsService } from "@/client"
import type { AgentPublic, AgentExecutionPublic } from "@/client"
import useCustomToast from "@/hooks/useCustomToast"

const AgentDetail = () => {
  const { agentId, teamId } = Route.useParams()
  const { showErrorToast } = useCustomToast()

  const {
    data: agent,
    isLoading: agentLoading,
    isError: agentError,
    error: agentErrorData,
  } = useQuery({
    queryKey: ["agents", agentId],
    queryFn: () => AgentsService.readAgent({ id: agentId }),
  })

  const {
    data: executions,
    isLoading: executionsLoading,
    isError: executionsError,
    error: executionsErrorData,
  } = useQuery({
    queryKey: ["agent-executions", agentId],
    queryFn: () => ExecutionsService.readAgentExecutions({ agentId, limit: 5 }),
  })

  if (agentError) {
    const errDetail = (agentErrorData as any)?.body?.detail
    showErrorToast(errDetail || "Failed to load agent")
  }

  if (executionsError) {
    const errDetail = (executionsErrorData as any)?.body?.detail
    showErrorToast(errDetail || "Failed to load executions")
  }

  if (agentLoading) {
    return (
      <Container maxW="full">
        <Flex justify="center" align="center" h="200px">
          <Text>Loading agent...</Text>
        </Flex>
      </Container>
    )
  }

  if (!agent) {
    return (
      <Container maxW="full">
        <Flex justify="center" align="center" h="200px">
          <Text>Agent not found</Text>
        </Flex>
      </Container>
    )
  }

  return (
    <Container maxW="full">
      <Flex justify="space-between" align="start" pt={12} mb={8}>
        <Box>
          <Heading size="lg">{agent.name}</Heading>
          <Text color="gray.500" mt={2}>
            {agent.description || "No description provided"}
          </Text>
          <Flex gap={2} mt={4}>
            <Badge
              colorPalette={agent.is_active ? "green" : "red"}
              variant="subtle"
            >
              {agent.is_active ? "Active" : "Inactive"}
            </Badge>
            <Badge variant="outline">v{agent.current_config_version}</Badge>
          </Flex>
        </Box>
        <Flex gap={2}>
          <Link to="/$teamId/agents/$agentId/settings" params={{ teamId, agentId }}>
            <Button variant="outline" size="sm">
              <FiSettings size={16} />
              Settings
            </Button>
          </Link>
          <Button size="sm">
            <FiPlay size={16} />
            Run Agent
          </Button>
        </Flex>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2 }} gap={6} mb={8}>
        <Card.Root>
          <Card.Header>
            <Heading size="md">Agent Information</Heading>
          </Card.Header>
          <Card.Body>
            <Box>
              <Text fontWeight="bold" mb={2}>
                Team ID
              </Text>
              <Text color="gray.500" mb={4} fontFamily="mono" fontSize="sm">
                {agent.team_id}
              </Text>
              
              <Text fontWeight="bold" mb={2}>
                Created By
              </Text>
              <Text color="gray.500" mb={4} fontFamily="mono" fontSize="sm">
                {agent.created_by}
              </Text>
              
              <Text fontWeight="bold" mb={2}>
                Created
              </Text>
              <Text color="gray.500">
                {new Date(agent.created_at).toLocaleString()}
              </Text>
            </Box>
          </Card.Body>
        </Card.Root>

        <Card.Root>
          <Card.Header>
            <Flex justify="space-between" align="center">
              <Heading size="md">Recent Executions</Heading>
              <Link to="/$teamId/agents/$agentId/executions" params={{ teamId, agentId }}>
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </Flex>
          </Card.Header>
          <Card.Body>
            {executionsLoading ? (
              <Text>Loading executions...</Text>
            ) : executions?.data && executions.data.length > 0 ? (
              <Box>
                {executions.data.slice(0, 3).map((execution: AgentExecutionPublic) => (
                  <Flex
                    key={execution.id}
                    justify="space-between"
                    align="center"
                    py={2}
                    borderBottom="1px solid"
                    borderColor="gray.100"
                    _last={{ borderBottom: "none" }}
                  >
                    <Box>
                      <Badge
                        colorPalette={
                          execution.status === "completed"
                            ? "green"
                            : execution.status === "running"
                            ? "blue"
                            : execution.status === "failed"
                            ? "red"
                            : "gray"
                        }
                        variant="subtle"
                        size="sm"
                      >
                        {execution.status}
                      </Badge>
                    </Box>
                    <Flex align="center" gap={1} color="gray.500" fontSize="sm">
                      <FiClock size={12} />
                      <Text>
                        {new Date(execution.started_at).toLocaleDateString()}
                      </Text>
                    </Flex>
                  </Flex>
                ))}
              </Box>
            ) : (
              <Text color="gray.500">No executions yet</Text>
            )}
          </Card.Body>
        </Card.Root>
      </SimpleGrid>
    </Container>
  )
}

export const Route = createFileRoute("/$teamId/agents/$agentId/")({
  component: AgentDetail,
})
