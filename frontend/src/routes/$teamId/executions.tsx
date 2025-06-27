import {
  Box,
  Container,
  Flex,
  Heading,
  Table,
  Text,
  Badge,
} from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

import { ExecutionsService } from "@/client"
import type { AgentExecutionPublic } from "@/client"
import useCustomToast from "@/hooks/useCustomToast"

const ExecutionsList = () => {
  const { showErrorToast } = useCustomToast()

  const {
    data: executions,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["executions"],
    queryFn: () => ExecutionsService.readExecutions({}),
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
      <Heading size="lg" textAlign={{ base: "center", md: "left" }} pt={12}>
        Agent Executions
      </Heading>

      {isLoading ? (
        <Flex justify="center" mt={8}>
          <Text>Loading...</Text>
        </Flex>
      ) : (
        <Box overflowX="auto" mt={8}>
          <Table.Root size="sm">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Agent ID</Table.ColumnHeader>
                <Table.ColumnHeader>Status</Table.ColumnHeader>
                <Table.ColumnHeader>Started</Table.ColumnHeader>
                <Table.ColumnHeader>Completed</Table.ColumnHeader>
                <Table.ColumnHeader>Task Input</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {executions?.data?.map((execution: AgentExecutionPublic) => (
                <Table.Row key={execution.id}>
                  <Table.Cell fontFamily="mono" fontSize="sm">
                    {execution.agent_id ? execution.agent_id.slice(0, 8) + "..." : "N/A"}
                  </Table.Cell>
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
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>

          {executions?.data?.length === 0 && (
            <Flex justify="center" py={8}>
              <Text color="gray.500">
                No executions found. Run some agents to see execution history!
              </Text>
            </Flex>
          )}
        </Box>
      )}
    </Container>
  )
}

export const Route = createFileRoute("/$teamId/executions")({
  component: ExecutionsList,
})
