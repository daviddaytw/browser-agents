import { Box, Button, Flex, Text } from "@chakra-ui/react"
import { Link } from "@tanstack/react-router"
import { FaUserAstronaut } from "react-icons/fa"
import { FiBook, FiLogOut, FiUser } from "react-icons/fi"

import useAuth from "@/hooks/useAuth"
import { MenuContent, MenuItem, MenuRoot, MenuTrigger } from "../ui/menu"

const UserMenu = () => {
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    logout()
  }

  return (
    <>
      {/* Desktop */}
      <Flex>
        <MenuRoot>
          <MenuTrigger asChild p={2}>
            <Button data-testid="user-menu" variant="solid" maxW="sm" truncate>
              <FaUserAstronaut fontSize="18" />
              <Text>{user?.full_name || "User"}</Text>
            </Button>
          </MenuTrigger>

          <MenuContent>
            <Link to="settings">
              <MenuItem
                closeOnSelect
                value="user-settings"
                gap={2}
                py={2}
                style={{ cursor: "pointer" }}
              >
                <FiUser fontSize="18px" />
                <Box flex="1">My Profile</Box>
              </MenuItem>
            </Link>

            <MenuItem
              value="api-docs"
              gap={2}
              py={2}
              onClick={() => window.open('/api/docs', '_blank')}
              style={{ cursor: "pointer" }}
            >
              <FiBook fontSize="18px" />
              <Box flex="1">API Documentation</Box>
            </MenuItem>

            <MenuItem
              value="logout"
              gap={2}
              py={2}
              onClick={handleLogout}
              style={{ cursor: "pointer" }}
            >
              <FiLogOut />
              Log Out
            </MenuItem>
          </MenuContent>
        </MenuRoot>
      </Flex>
    </>
  )
}

export default UserMenu
