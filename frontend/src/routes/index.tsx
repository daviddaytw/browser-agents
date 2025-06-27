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

import { TeamsService } from "@/client"
import type { TeamPublic } from "@/client"
import useCustomToast from "@/hooks/useCustomToast"

import AddTeam from "@/components/Teams/AddTeam"

const TeamsList = () => {
  const { showErrorToast } = useCustomToast()

  const {
    data: teams,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["teams"],
    queryFn: () => TeamsService.readTeams({}),
  })

  if (isError) {
    const errDetail = (error as any)?.body?.detail
    showErrorToast(errDetail || "Something went wrong")
  }

  return (
    <Container maxW="full">
      <Heading size="lg" textAlign={{ base: "center", md: "left" }} pt={12}>
        Teams
      </Heading>

      <Flex py={8} gap={4}>
        <AddTeam />
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
                <Table.ColumnHeader>Status</Table.ColumnHeader>
                <Table.ColumnHeader>Created</Table.ColumnHeader>
                <Table.ColumnHeader>Updated</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {teams?.data?.map((team: TeamPublic) => (
                <Table.Row key={team.id}>
                  <Table.Cell fontWeight="bold">{team.name}</Table.Cell>
                  <Table.Cell>
                    <Text truncate maxW="200px">
                      {team.description || "No description"}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge
                      colorPalette={team.is_active ? "green" : "red"}
                      variant="subtle"
                    >
                      {team.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    {new Date(team.created_at).toLocaleDateString()}
                  </Table.Cell>
                  <Table.Cell>
                    {new Date(team.updated_at).toLocaleDateString()}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>

          {teams?.data?.length === 0 && (
            <Flex justify="center" py={8}>
              <Text color="gray.500">
                No teams found. Create your first team to get started!
              </Text>
            </Flex>
          )}
        </Box>
      )}
    </Container>
  )
}

export const Route = createFileRoute("/")({
  component: TeamsList,
})
