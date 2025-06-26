import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  Card,
  SimpleGrid,
  Badge,
  Button,
} from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { FiCpu, FiPlay, FiKey, FiPlus } from "react-icons/fi"

import { AgentsService, ExecutionsService, ApiKeysService } from "@/client"

const Dashboard = () => {
  const { data: agents } = useQuery({
    queryKey: ["agents"],
    queryFn: () => AgentsService.readAgents({ limit: 5 }),
  })

  const { data: executions } = useQuery({
    queryKey: ["executions"],
    queryFn: () => ExecutionsService.readExecutions({ limit: 5 }),
  })

  const { data: apiKeys } = useQuery({
    queryKey: ["api-keys"],
    queryFn: () => ApiKeysService.readApiKeys({ limit: 5 }),
  })

  return (
    <Container maxW="full">
      <Heading size="lg" textAlign={{ base: "center", md: "left" }} pt={12}>
        Browser Agents Dashboard
      </Heading>
      <Text color="gray.500" mt={2}>
        Manage and monitor your AI browser automation agents
      </Text>

      <SimpleGrid columns={{ base: 1, md: 3 }} gap={6} mt={8}>
        <Card.Root>
          <Card.Header>
            <Flex align="center" gap={3}>
              <Box p={2} bg="blue.100" borderRadius="md">
                <FiCpu size={20} color="blue" />
              </Box>
              <Box>
                <Text fontWeight="bold">Agents</Text>
                <Text fontSize="2xl" fontWeight="bold">
                  {agents?.count || 0}
                </Text>
              </Box>
            </Flex>
          </Card.Header>
          <Card.Body>
            <Text color="gray.500" mb={4}>
              Active browser automation agents
            </Text>
            <Link to="/agents">
              <Button size="sm" variant="outline" width="full">
                <FiPlus size={16} />
                Manage Agents
              </Button>
            </Link>
          </Card.Body>
        </Card.Root>

        <Card.Root>
          <Card.Header>
            <Flex align="center" gap={3}>
              <Box p={2} bg="green.100" borderRadius="md">
                <FiPlay size={20} color="green" />
              </Box>
              <Box>
                <Text fontWeight="bold">Executions</Text>
                <Text fontSize="2xl" fontWeight="bold">
                  {executions?.count || 0}
                </Text>
              </Box>
            </Flex>
          </Card.Header>
          <Card.Body>
            <Text color="gray.500" mb={4}>
              Total agent executions
            </Text>
            <Link to="/executions">
              <Button size="sm" variant="outline" width="full">
                View History
              </Button>
            </Link>
          </Card.Body>
        </Card.Root>

        <Card.Root>
          <Card.Header>
            <Flex align="center" gap={3}>
              <Box p={2} bg="purple.100" borderRadius="md">
                <FiKey size={20} color="purple" />
              </Box>
              <Box>
                <Text fontWeight="bold">API Keys</Text>
                <Text fontSize="2xl" fontWeight="bold">
                  {apiKeys?.count || 0}
                </Text>
              </Box>
            </Flex>
          </Card.Header>
          <Card.Body>
            <Text color="gray.500" mb={4}>
              Active API keys for automation
            </Text>
            <Link to="/api-keys">
              <Button size="sm" variant="outline" width="full">
                Manage Keys
              </Button>
            </Link>
          </Card.Body>
        </Card.Root>
      </SimpleGrid>

      <Box mt={8}>
        <Heading size="md" mb={4}>
          Recent Agents
        </Heading>
        {agents?.data && agents.data.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
            {agents.data.slice(0, 4).map((agent) => (
              <Card.Root key={agent.id} size="sm">
                <Card.Body>
                  <Flex justify="space-between" align="start" mb={2}>
                    <Text fontWeight="bold">{agent.name}</Text>
                    <Badge
                      colorPalette={agent.is_active ? "green" : "red"}
                      variant="subtle"
                      size="sm"
                    >
                      {agent.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </Flex>
                  <Text color="gray.500" fontSize="sm" mb={2}>
                    {agent.description || "No description"}
                  </Text>
                  <Badge variant="outline" size="sm">
                    {agent.llm_model}
                  </Badge>
                </Card.Body>
              </Card.Root>
            ))}
          </SimpleGrid>
        ) : (
          <Card.Root>
            <Card.Body textAlign="center" py={8}>
              <Text color="gray.500" mb={4}>
                No agents created yet
              </Text>
              <Link to="/agents">
                <Button>
                  <FiPlus size={16} />
                  Create Your First Agent
                </Button>
              </Link>
            </Card.Body>
          </Card.Root>
        )}
      </Box>
    </Container>
  )
}

export const Route = createFileRoute("/_layout/")({
  component: Dashboard,
})
