import { Container, Heading, Tabs } from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"

import Appearance from "@/components/UserSettings/Appearance"
import ChangePassword from "@/components/UserSettings/ChangePassword"
import DeleteAccount from "@/components/UserSettings/DeleteAccount"
import UserInformation from "@/components/UserSettings/UserInformation"

const UserSettings = () => {
  const tabsData = [
    {
      label: "My profile",
      content: <UserInformation />,
    },
    {
      label: "Password",
      content: <ChangePassword />,
    },
    {
      label: "Appearance",
      content: <Appearance />,
    },
    {
      label: "Danger zone",
      content: <DeleteAccount />,
    },
  ]

  return (
    <Container maxW="full">
      <Heading size="lg" textAlign={{ base: "center", md: "left" }} pt={12}>
        User Settings
      </Heading>

      <Tabs.Root
        defaultValue={tabsData[0].label}
        size="sm"
        variant="enclosed"
        mt={8}
      >
        <Tabs.List>
          {tabsData.map((tab, index) => (
            <Tabs.Trigger key={index} value={tab.label}>
              {tab.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        {tabsData.map((tab, index) => (
          <Tabs.Content key={index} value={tab.label}>
            {tab.content}
          </Tabs.Content>
        ))}
      </Tabs.Root>
    </Container>
  )
}

export const Route = createFileRoute("/settings")({
  component: UserSettings,
})
