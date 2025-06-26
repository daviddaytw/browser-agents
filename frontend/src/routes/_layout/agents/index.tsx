import { createFileRoute } from "@tanstack/react-router"
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
import { Link } from "@tanstack/react-router"

import { AgentsService } from "@/client"
import type { AgentPublic } from "@/client"
import useCustomToast from "@/hooks/useCustomToast"

import AddAgent from "@/components/Agents/AddAgent"

export const Route = createFileRoute("/_layout/agents/")({
  component: AgentsList,
})

function AgentsList() {
  const { showErrorToast } = useCustomToast()

  const {
    data: agents,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["agents"],
    queryFn: () => AgentsService.readAgents({}),
  })

  if (isError) {
    const errDetail = (error as any)?.body?.detail
    showErrorToast(errDetail || "Something went wrong")
  }

  return (
    <>
      <Container maxW="full">
        <Heading size="lg" textAlign={{ base: "center", md: "left" }} pt={12}>
          Browser Agents
        </Heading>

        <Flex py={8} gap={4}>
          <AddAgent />
        </Flex>

        {isLoading ? (
          <Flex justify="center">
            <Text>Loading...</Text>
          </Flex>
        ) : (
          <Box overflowX="auto">
            <Table.Root size="sm">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Name</Table.ColumnHeader>
                  <Table.ColumnHeader>Description</Table.ColumnHeader>
                  <Table.ColumnHeader>Model</Table.ColumnHeader>
                  <Table.ColumnHeader>Status</Table.ColumnHeader>
                  <Table.ColumnHeader>Created</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {agents?.data?.map((agent: AgentPublic) => (
                  <Link 
                    key={agent.id} 
                    to="/agents/$agentId" 
                    params={{ agentId: agent.id }}
                    style={{ display: "contents" }}
                  >
                    <Table.Row 
                      _hover={{ bg: "gray.50" }}
                      cursor="pointer"
                    >
                      <Table.Cell fontWeight="bold">{agent.name}</Table.Cell>
                      <Table.Cell>
                        <Text truncate maxW="200px">
                          {agent.description || "No description"}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge variant="outline">{agent.llm_model}</Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge
                          colorPalette={agent.is_active ? "green" : "red"}
                          variant="subtle"
                        >
                          {agent.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        {new Date(agent.created_at).toLocaleDateString()}
                      </Table.Cell>
                    </Table.Row>
                  </Link>
                ))}
              </Table.Body>
            </Table.Root>

            {agents?.data?.length === 0 && (
              <Flex justify="center" py={8}>
                <Text color="gray.500">
                  No agents found. Create your first agent to get started!
                </Text>
              </Flex>
            )}
          </Box>
        )}
      </Container>
    </>
  )
}
