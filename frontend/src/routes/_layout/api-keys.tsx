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

import { ApiKeysService } from "@/client"
import type { APIKeyPublic } from "@/client"
import useCustomToast from "@/hooks/useCustomToast"

import AddApiKey from "@/components/ApiKeys/AddApiKey"
import DeleteApiKey from "@/components/ApiKeys/DeleteApiKey"

const ApiKeysList = () => {
  const { showErrorToast } = useCustomToast()

  const {
    data: apiKeys,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["api-keys"],
    queryFn: () => ApiKeysService.readApiKeys({}),
  })

  if (isError) {
    const errDetail = (error as any)?.body?.detail
    showErrorToast(errDetail || "Something went wrong")
  }

  return (
    <Container maxW="full">
      <Heading size="lg" textAlign={{ base: "center", md: "left" }} pt={12}>
        API Keys
      </Heading>

      <Flex py={8} gap={4}>
        <AddApiKey />
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
                <Table.ColumnHeader>Key Prefix</Table.ColumnHeader>
                <Table.ColumnHeader>Status</Table.ColumnHeader>
                <Table.ColumnHeader>Created</Table.ColumnHeader>
                <Table.ColumnHeader>Last Used</Table.ColumnHeader>
                <Table.ColumnHeader>Actions</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {apiKeys?.data?.map((apiKey: APIKeyPublic) => (
                <Table.Row key={apiKey.id}>
                  <Table.Cell fontWeight="bold">{apiKey.name}</Table.Cell>
                  <Table.Cell fontFamily="mono">
                    {apiKey.key_prefix}...
                  </Table.Cell>
                  <Table.Cell>
                    <Badge
                      colorPalette={apiKey.is_active ? "green" : "red"}
                      variant="subtle"
                    >
                      {apiKey.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    {new Date(apiKey.created_at).toLocaleDateString()}
                  </Table.Cell>
                  <Table.Cell>
                    {apiKey.last_used
                      ? new Date(apiKey.last_used).toLocaleDateString()
                      : "Never"}
                  </Table.Cell>
                  <Table.Cell>
                    <DeleteApiKey id={apiKey.id} name={apiKey.name} />
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>

          {apiKeys?.data?.length === 0 && (
            <Flex justify="center" py={8}>
              <Text color="gray.500">
                No API keys found. Create an API key to enable external access!
              </Text>
            </Flex>
          )}
        </Box>
      )}
    </Container>
  )
}

export const Route = createFileRoute("/_layout/api-keys")({
  component: ApiKeysList,
})
