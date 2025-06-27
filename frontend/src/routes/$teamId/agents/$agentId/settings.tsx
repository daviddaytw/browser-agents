import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  Button,
  Tabs,
} from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { FiArrowLeft } from "react-icons/fi"
import { useState } from "react"

import { AgentsService } from "@/client"
import useCustomToast from "@/hooks/useCustomToast"

import AgentSettingsForm from "@/components/Agents/AgentSettingsForm"
import ConfigurationVersions from "@/components/Agents/ConfigurationVersions"
import DeleteAgent from "@/components/Agents/DeleteAgent"

const AgentSettings = () => {
  const { agentId, teamId } = Route.useParams()
  const { showErrorToast } = useCustomToast()
  
  // State for agent settings form
  const [llmConfig, setLlmConfig] = useState({})
  const [browserSettings, setBrowserSettings] = useState({})
  const [agentSettings, setAgentSettings] = useState({})

  const {
    data: agent,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["agents", agentId],
    queryFn: () => AgentsService.readAgent({ id: agentId }),
  })

  if (isError) {
    const errDetail = (error as any)?.body?.detail
    showErrorToast(errDetail || "Failed to load agent")
  }

  if (isLoading) {
    return (
      <Container maxW="full">
        <Flex justify="center" align="center" h="200px">
          <Text>Loading agent settings...</Text>
        </Flex>
      </Container>
    )
  }

  if (!agent) {
    return (
      <Container maxW="full">
        <Flex justify="center" align="center" h="200px">
          <Text>Agent not found</Text>
        </Flex>
      </Container>
    )
  }

  const tabsData = [
    {
      label: "General",
      content: (
        <Box>
          <Heading size="md" mb={4}>
            Agent Settings
          </Heading>
          <Text mb={4} color="gray.600">
            Configure advanced settings for this agent.
          </Text>
          <AgentSettingsForm
            llmConfig={llmConfig}
            setLlmConfig={setLlmConfig}
            browserSettings={browserSettings}
            setBrowserSettings={setBrowserSettings}
            agentSettings={agentSettings}
            setAgentSettings={setAgentSettings}
            llmModel="gpt-4o"
          />
        </Box>
      ),
    },
    {
      label: "Configuration Versions",
      content: <ConfigurationVersions agentId={agentId} currentVersion={agent.current_config_version} />,
    },
    {
      label: "Danger Zone",
      content: (
        <Box>
          <Heading size="md" mb={4} color="red.500">
            Danger Zone
          </Heading>
          <Text mb={4} color="gray.600">
            Once you delete an agent, there is no going back. Please be certain.
          </Text>
          <DeleteAgent id={agentId} />
        </Box>
      ),
    },
  ]

  return (
    <Container maxW="full">
      <Flex align="center" gap={4} pt={12} mb={8}>
        <Link to="/$teamId/agents/$agentId" params={{ teamId, agentId }}>
          <Button variant="ghost" size="sm">
            <FiArrowLeft size={16} />
            Back to Agent
          </Button>
        </Link>
        <Box>
          <Heading size="lg">{agent.name} - Settings</Heading>
          <Text color="gray.500" mt={2}>
            Manage agent configuration and settings
          </Text>
        </Box>
      </Flex>

      <Tabs.Root
        defaultValue={tabsData[0].label}
        orientation="vertical"
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

export const Route = createFileRoute("/$teamId/agents/$agentId/settings")({
  component: AgentSettings,
})
