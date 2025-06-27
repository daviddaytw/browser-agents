import {
  Box,
  Container,
  Flex,
  Heading,
  Table,
  Text,
  Badge,
  Button,
} from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { FiArrowLeft } from "react-icons/fi"

import { AgentsService, ExecutionsService } from "@/client"
import type { AgentExecutionPublic } from "@/client"
import useCustomToast from "@/hooks/useCustomToast"

const AgentExecutions = () => {
  const { agentId, teamId } = Route.useParams()
  const { showErrorToast } = useCustomToast()

  const {
    data: agent,
    isLoading: agentLoading,
  } = useQuery({
    queryKey: ["agents", agentId],
    queryFn: () => AgentsService.readAgent({ id: agentId }),
  })

  const {
    data: executions,
    isLoading: executionsLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["agent-executions", agentId],
    queryFn: () => ExecutionsService.readAgentExecutions({ agentId }),
  })

  if (isError) {
    const errDetail = (error as any)?.body?.detail
    showErrorToast(errDetail || "Something went wrong")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "green"
      case "running":
        return "blue"
      case "failed":
        return "red"
      case "cancelled":
        return "orange"
      default:
        return "gray"
    }
  }

  return (
    <Container maxW="full">
      <Flex align="center" gap={4} pt={12} mb={8}>
        <Link to="/$teamId/agents/$agentId" params={{ teamId, agentId }}>
          <Button variant="ghost" size="sm">
            <FiArrowLeft size={16} />
            Back to Agent
          </Button>
        </Link>
        <Box>
          <Heading size="lg">
            {agentLoading ? "Loading..." : agent?.name || "Agent"} - Executions
          </Heading>
          <Text color="gray.500" mt={2}>
            View all execution history for this agent
          </Text>
        </Box>
      </Flex>

      {executionsLoading ? (
        <Flex justify="center" mt={8}>
          <Text>Loading executions...</Text>
        </Flex>
      ) : (
        <Box overflowX="auto" mt={8}>
          <Table.Root size="sm">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Status</Table.ColumnHeader>
                <Table.ColumnHeader>Started</Table.ColumnHeader>
                <Table.ColumnHeader>Completed</Table.ColumnHeader>
                <Table.ColumnHeader>Task Input</Table.ColumnHeader>
                <Table.ColumnHeader>Config Version</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {executions?.data?.map((execution: AgentExecutionPublic) => (
                <Table.Row key={execution.id}>
                  <Table.Cell>
                    <Badge
                      colorPalette={getStatusColor(execution.status || "unknown")}
                      variant="subtle"
                    >
                      {execution.status || "unknown"}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    {execution.started_at ? new Date(execution.started_at).toLocaleString() : "N/A"}
                  </Table.Cell>
                  <Table.Cell>
                    {execution.completed_at
                      ? new Date(execution.completed_at).toLocaleString()
                      : "-"}
                  </Table.Cell>
                  <Table.Cell>
                    <Text truncate maxW="200px">
                      {execution.task_input || "Default task"}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge variant="outline" size="sm">
                      v{execution.config_version_used}
                    </Badge>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>

          {executions?.data?.length === 0 && (
            <Flex justify="center" py={8}>
              <Text color="gray.500">
                No executions found for this agent.
              </Text>
            </Flex>
          )}
        </Box>
      )}
    </Container>
  )
}

export const Route = createFileRoute("/$teamId/agents/$agentId/executions")({
  component: AgentExecutions,
})
