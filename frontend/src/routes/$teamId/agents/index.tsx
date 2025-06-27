import { createFileRoute, useParams } from "@tanstack/react-router"
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

export const Route = createFileRoute("/$teamId/agents/")({
  component: AgentsList,
})

function AgentsList() {
  const { teamId } = useParams({ from: "/_layout/$teamId/agents/" })
  const { showErrorToast } = useCustomToast()

  const {
    data: agents,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["agents", teamId],
    queryFn: () => AgentsService.readAgents({ teamId }),
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
          <AddAgent teamId={teamId} />
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
                    to="/$teamId/agents/$agentId" 
                    params={{ teamId, agentId: agent.id }}
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
                        <Badge variant="outline">Version {agent.current_config_version}</Badge>
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
