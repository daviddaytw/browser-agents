import { Box, Flex, Icon, Text } from "@chakra-ui/react"
import { useQueryClient } from "@tanstack/react-query"
import { Link as RouterLink, useParams } from "@tanstack/react-router"
import { FiHome, FiSettings, FiUsers, FiCpu, FiPlay, FiKey, FiBook } from "react-icons/fi"
import type { IconType } from "react-icons/lib"

import type { UserPublic } from "@/client"

const items = [
  { icon: FiHome, title: "Dashboard", path: "/" },
  { icon: FiCpu, title: "Agents", path: "/agents" },
  { icon: FiPlay, title: "Executions", path: "/executions" },
  { icon: FiKey, title: "API Keys", path: "/api-keys" },
  { icon: FiBook, title: "API Documentation", path: "/api/docs", external: true },
  { icon: FiSettings, title: "User Settings", path: "/settings" },
]

interface SidebarItemsProps {
  onClose?: () => void
}

interface Item {
  icon: IconType
  title: string
  path: string
  external?: boolean
}

const SidebarItems = ({ onClose }: SidebarItemsProps) => {
  const queryClient = useQueryClient()
  const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"])
  
  // Try to get teamId from current route params
  let teamId: string | undefined
  try {
    const params = useParams({ strict: false })
    teamId = (params as any)?.teamId
  } catch {
    // If we can't get teamId from params, we'll handle it below
  }

  // Create team-based paths if we have a teamId
  const getPath = (basePath: string) => {
    if (teamId && !basePath.startsWith('/api/')) {
      return `/${teamId}${basePath}`
    }
    return basePath
  }

  const teamItems = [
    { icon: FiHome, title: "Dashboard", path: getPath("/") },
    { icon: FiCpu, title: "Agents", path: getPath("/agents") },
    { icon: FiPlay, title: "Executions", path: getPath("/executions") },
    { icon: FiKey, title: "API Keys", path: getPath("/api-keys") },
    { icon: FiBook, title: "API Documentation", path: "/api/docs", external: true },
    { icon: FiSettings, title: "User Settings", path: "/settings" },
  ]

  const finalItems: Item[] = currentUser?.is_superuser
    ? [...teamItems, { icon: FiUsers, title: "Admin", path: getPath("/admin") }]
    : teamItems

  const listItems = finalItems.map(({ icon, title, path, external }) => {
    const content = (
      <Flex
        gap={4}
        px={4}
        py={2}
        _hover={{
          background: "gray.subtle",
        }}
        alignItems="center"
        fontSize="sm"
        cursor="pointer"
      >
        <Icon as={icon} alignSelf="center" />
        <Text ml={2}>{title}</Text>
      </Flex>
    )

    if (external) {
      return (
        <Box
          key={title}
          onClick={() => {
            window.open(path, '_blank')
            onClose?.()
          }}
        >
          {content}
        </Box>
      )
    }

    return (
      <RouterLink key={title} to={path} onClick={onClose}>
        {content}
      </RouterLink>
    )
  })

  return (
    <>
      <Text fontSize="xs" px={4} py={2} fontWeight="bold">
        Menu
      </Text>
      <Box>{listItems}</Box>
    </>
  )
}

export default SidebarItems
