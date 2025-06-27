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

import { UsersService } from "@/client"
import type { UserPublic } from "@/client"
import useCustomToast from "@/hooks/useCustomToast"

import AddUser from "@/components/Admin/AddUser"
import EditUser from "@/components/Admin/EditUser"
import DeleteUser from "@/components/Admin/DeleteUser"

const AdminPage = () => {
  const { showErrorToast } = useCustomToast()

  const {
    data: users,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["users"],
    queryFn: () => UsersService.readUsers({}),
  })

  if (isError) {
    const errDetail = (error as any)?.body?.detail
    showErrorToast(errDetail || "Something went wrong")
  }

  return (
    <Container maxW="full">
      <Heading size="lg" textAlign={{ base: "center", md: "left" }} pt={12}>
        User Administration
      </Heading>

      <Flex py={8} gap={4}>
        <AddUser />
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
                <Table.ColumnHeader>Full Name</Table.ColumnHeader>
                <Table.ColumnHeader>Email</Table.ColumnHeader>
                <Table.ColumnHeader>Status</Table.ColumnHeader>
                <Table.ColumnHeader>Role</Table.ColumnHeader>
                <Table.ColumnHeader>Actions</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {users?.data?.map((user: UserPublic) => (
                <Table.Row key={user.id}>
                  <Table.Cell fontWeight="bold">
                    {user.full_name || "N/A"}
                  </Table.Cell>
                  <Table.Cell>{user.email}</Table.Cell>
                  <Table.Cell>
                    <Badge
                      colorPalette={user.is_active ? "green" : "red"}
                      variant="subtle"
                    >
                      {user.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge
                      colorPalette={user.is_superuser ? "purple" : "blue"}
                      variant="subtle"
                    >
                      {user.is_superuser ? "Admin" : "User"}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Flex gap={2}>
                      <EditUser user={user} />
                      <DeleteUser id={user.id} />
                    </Flex>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>

          {users?.data?.length === 0 && (
            <Flex justify="center" py={8}>
              <Text color="gray.500">No users found.</Text>
            </Flex>
          )}
        </Box>
      )}
    </Container>
  )
}

export const Route = createFileRoute("/$teamId/admin")({
  component: AdminPage,
})
