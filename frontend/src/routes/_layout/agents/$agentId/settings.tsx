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
} from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Link, useParams } from "@tanstack/react-router"
import { FiArrowLeft } from "react-icons/fi"

import { AgentsService } from "../../../../client"
import useCustomToast from "../../../../hooks/useCustomToast"

export const Route = createFileRoute("/_layout/agents/$agentId/settings")({
  component: AgentSettings,
})

function AgentSettings () {
  const { agentId } = useParams({ from: "/_layout/agents/$agentId.settings" })
  const { showErrorToast } = useCustomToast()

  const {
    data: agent,
    isLoading: agentLoading,
    isError: agentError,
    error: agentErrorDetail,
  } = useQuery({
    queryKey: ["agent", agentId],
    queryFn: () => AgentsService.readAgent({ id: agentId }),
  })

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
      </Flex>

      <VStack gap={6} align="stretch">
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
    </Container>
  )
}