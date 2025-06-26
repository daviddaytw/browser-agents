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
  Table,
  IconButton,
  Textarea,
} from "@chakra-ui/react"
import { useState } from "react"
import {
  DialogRoot,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
} from "../../../../components/ui/dialog"
import { Field } from "../../../../components/ui/field"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { FiArrowLeft, FiPlay } from "react-icons/fi"

import { AgentsService, ExecutionsService } from "../../../../client"
import type { AgentExecutionPublic } from "../../../../client"
import useCustomToast from "../../../../hooks/useCustomToast"

export const Route = createFileRoute("/_layout/agents/$agentId/executions")({
  component: AgentExecutions,
})

function AgentExecutions() {
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
        <Link to={`/agents/${agentId}`}>
          <IconButton size="sm" variant="outline" aria-label="Back to agent">
            <FiArrowLeft />
          </IconButton>
        </Link>
        <Heading size="lg">{agent.name} - Executions</Heading>
        <Badge
          colorPalette={agent.is_active ? "green" : "red"}
          variant="subtle"
        >
          {agent.is_active ? "Active" : "Inactive"}
        </Badge>
      </Flex>

      <Card.Root>
        <Card.Header>
          <Flex justify="space-between" align="center">
            <Card.Title>Recent Executions</Card.Title>
            <DialogRoot open={isExecuteModalOpen} onOpenChange={(details) => setIsExecuteModalOpen(details.open)}>
              <DialogTrigger asChild>
                <Button 
                  variant="solid" 
                  colorPalette="blue"
                  disabled={!agent.is_active}
                  size="sm"
                >
                  <FiPlay />
                  Execute Agent
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Execute Agent</DialogTitle>
                </DialogHeader>
                <DialogBody>
                  <Field label="Parameters (JSON, Optional)">
                    <Textarea
                      value={parameters}
                      onChange={(e) => setParameters(e.target.value)}
                      placeholder='{"key": "value"}'
                      rows={4}
                      fontFamily="mono"
                      fontSize="sm"
                    />
                  </Field>
                </DialogBody>
                <DialogFooter>
                  <DialogCloseTrigger asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogCloseTrigger>
                  <Button
                    colorPalette="blue"
                    onClick={handleExecuteAgent}
                    loading={executeAgentMutation.isPending}
                  >
                    Execute
                  </Button>
                </DialogFooter>
              </DialogContent>
            </DialogRoot>
          </Flex>
        </Card.Header>
        <Card.Body>
          {executionsLoading ? (
            <Flex justify="center" py={8}>
              <Text>Loading executions...</Text>
            </Flex>
          ) : executions?.data?.length === 0 ? (
            <Flex justify="center" py={8}>
              <Text color="gray.500">
                No executions yet. Run this agent to see execution history.
              </Text>
            </Flex>
          ) : (
            <Box overflowX="auto">
              <Table.Root size="sm">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>Status</Table.ColumnHeader>
                    <Table.ColumnHeader>Started</Table.ColumnHeader>
                    <Table.ColumnHeader>Completed</Table.ColumnHeader>
                    <Table.ColumnHeader>Duration</Table.ColumnHeader>
                    <Table.ColumnHeader>Actions</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {executions?.data?.map((execution: AgentExecutionPublic) => (
                    <Table.Row key={execution.id}>
                      <Table.Cell>
                        <Badge
                          colorPalette={
                            execution.status === "completed"
                              ? "green"
                              : execution.status === "failed"
                              ? "red"
                              : execution.status === "running"
                              ? "blue"
                              : "gray"
                          }
                          variant="subtle"
                        >
                          {execution.status}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        {new Date(execution.started_at).toLocaleString()}
                      </Table.Cell>
                      <Table.Cell>
                        {execution.completed_at
                          ? new Date(execution.completed_at).toLocaleString()
                          : "-"}
                      </Table.Cell>
                      <Table.Cell>
                        {execution.completed_at
                          ? `${Math.round(
                              (new Date(execution.completed_at).getTime() -
                                new Date(execution.started_at).getTime()) /
                                1000
                            )}s`
                          : "-"}
                      </Table.Cell>
                      <Table.Cell>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewDetails(execution)}
                        >
                          View Details
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Box>
          )}
        </Card.Body>
      </Card.Root>

      {/* Execution Details Modal */}
      <DialogRoot open={isDetailsModalOpen} onOpenChange={(details) => setIsDetailsModalOpen(details.open)}>
        <DialogContent maxW="4xl">
          <DialogHeader>
            <DialogTitle>Execution Details</DialogTitle>
            <DialogCloseTrigger />
          </DialogHeader>
          <DialogBody>
            {selectedExecution && (
              <VStack gap={6} align="stretch">
                <HStack gap={6}>
                  <Box>
                    <Text fontWeight="bold" mb={1}>Status</Text>
                    <Badge
                      colorPalette={
                        selectedExecution.status === "completed"
                          ? "green"
                          : selectedExecution.status === "failed"
                          ? "red"
                          : selectedExecution.status === "running"
                          ? "blue"
                          : "gray"
                      }
                      variant="subtle"
                    >
                      {selectedExecution.status}
                    </Badge>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" mb={1}>Started</Text>
                    <Text fontSize="sm" color="gray.600">
                      {new Date(selectedExecution.started_at).toLocaleString()}
                    </Text>
                  </Box>
                  {selectedExecution.completed_at && (
                    <Box>
                      <Text fontWeight="bold" mb={1}>Completed</Text>
                      <Text fontSize="sm" color="gray.600">
                        {new Date(selectedExecution.completed_at).toLocaleString()}
                      </Text>
                    </Box>
                  )}
                </HStack>

                {selectedExecution.task_input && (
                  <Box>
                    <Text fontWeight="bold" mb={2}>Task Input</Text>
                    <Text
                      p={3}
                      bg="gray.50"
                      borderRadius="md"
                      fontSize="sm"
                      whiteSpace="pre-wrap"
                    >
                      {selectedExecution.task_input}
                    </Text>
                  </Box>
                )}

                {selectedExecution.parameters && Object.keys(selectedExecution.parameters).length > 0 && (
                  <Box>
                    <Text fontWeight="bold" mb={2}>Parameters</Text>
                    <Text
                      p={3}
                      bg="gray.50"
                      borderRadius="md"
                      fontSize="sm"
                      fontFamily="mono"
                    >
                      {JSON.stringify(selectedExecution.parameters, null, 2)}
                    </Text>
                  </Box>
                )}

                {selectedExecution.result && (
                  <Box>
                    <Text fontWeight="bold" mb={2}>Result</Text>
                    <Text
                      p={3}
                      bg="gray.50"
                      borderRadius="md"
                      fontSize="sm"
                      fontFamily="mono"
                      maxH="300px"
                      overflowY="auto"
                    >
                      {JSON.stringify(selectedExecution.result, null, 2)}
                    </Text>
                  </Box>
                )}

                {selectedExecution.error_message && (
                  <Box>
                    <Text fontWeight="bold" mb={2} color="red.500">Error Message</Text>
                    <Text
                      p={3}
                      bg="red.50"
                      borderRadius="md"
                      fontSize="sm"
                      color="red.700"
                    >
                      {selectedExecution.error_message}
                    </Text>
                  </Box>
                )}

                {selectedExecution.execution_history && selectedExecution.execution_history.length > 0 && (
                  <Box>
                    <Text fontWeight="bold" mb={2}>Execution History</Text>
                    <Text
                      p={3}
                      bg="gray.50"
                      borderRadius="md"
                      fontSize="sm"
                      fontFamily="mono"
                      maxH="300px"
                      overflowY="auto"
                    >
                      {JSON.stringify(selectedExecution.execution_history, null, 2)}
                    </Text>
                  </Box>
                )}
              </VStack>
            )}
          </DialogBody>
        </DialogContent>
      </DialogRoot>
    </Container>
  )
}
