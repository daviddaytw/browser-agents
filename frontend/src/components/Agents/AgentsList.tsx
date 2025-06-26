import {
  Box,
  Container,
  Flex,
  Heading,
  Table,
  Text,
  Badge,
  IconButton,
} from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { FiPlay } from "react-icons/fi"

import { AgentsService } from "@/client"
import type { AgentPublic } from "@/client"
import useCustomToast from "@/hooks/useCustomToast"

import AddAgent from "./AddAgent"
import EditAgent from "./EditAgent"
import DeleteAgent from "./DeleteAgent"

const AgentsList = () => {
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
                  <Table.ColumnHeader>Actions</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {agents?.data?.map((agent: AgentPublic) => (
                  <Table.Row key={agent.id}>
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
                    <Table.Cell>
                      <Flex gap={2}>
                        <IconButton
                          size="sm"
                          variant="outline"
                          aria-label="Test agent"
                        >
                          <FiPlay />
                        </IconButton>
                        <EditAgent agent={agent} />
                        <DeleteAgent id={agent.id} />
                      </Flex>
                    </Table.Cell>
                  </Table.Row>
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

export default AgentsList
