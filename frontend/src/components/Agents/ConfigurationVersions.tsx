import React, { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  VStack,
  HStack,
  Text,
  Button,
  Box,
  Badge,
  Textarea,
  Input,
  Spinner,
} from "@chakra-ui/react"
import { FiPlus, FiCheck, FiClock, FiUser } from "react-icons/fi"
import { Field } from "../ui/field"
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTrigger,
  DialogTitle,
} from "../ui/dialog"
import { AgentsService } from "../../client"
import type { ApiError } from "../../client/core/ApiError"
import useCustomToast from "../../hooks/useCustomToast"
import { handleError } from "../../utils"

interface ConfigurationVersionsProps {
  agentId: string
  currentVersion: number
  onVersionChange?: () => void
}

interface ConfigurationVersion {
  id: string
  version: number
  task_prompt: string
  llm_model?: string
  llm_config?: { [key: string]: unknown }
  browser_settings?: { [key: string]: unknown }
  agent_settings?: { [key: string]: unknown }
  change_description?: string | null
  is_current?: boolean
  created_at: string
  created_by: string
}

const ConfigurationVersions: React.FC<ConfigurationVersionsProps> = ({
  agentId,
  currentVersion,
  onVersionChange,
}) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newPrompt, setNewPrompt] = useState("")
  const [newLlmModel, setNewLlmModel] = useState("gpt-4o")
  const [newDescription, setNewDescription] = useState("")
  const [selectedVersion, setSelectedVersion] = useState<ConfigurationVersion | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  // Fetch configuration versions
  const {
    data: versionsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["agent-configurations", agentId],
    queryFn: () => AgentsService.readAgentConfigurations({ id: agentId }),
  })

  // Create new version mutation
  const createVersionMutation = useMutation({
    mutationFn: (data: {
      task_prompt: string
      llm_model: string
      change_description?: string
    }) =>
      AgentsService.createAgentConfiguration({
        id: agentId,
        requestBody: {
          task_prompt: data.task_prompt,
          llm_model: data.llm_model,
          llm_config: {},
          browser_settings: {},
          agent_settings: {},
          change_description: data.change_description,
        },
      }),
    onSuccess: () => {
      showSuccessToast("New configuration version created successfully")
      setIsCreateDialogOpen(false)
      setNewPrompt("")
      setNewLlmModel("gpt-4o")
      setNewDescription("")
      queryClient.invalidateQueries({ queryKey: ["agent-configurations", agentId] })
      queryClient.invalidateQueries({ queryKey: ["agents"] })
      onVersionChange?.()
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
  })

  // Activate version mutation
  const activateVersionMutation = useMutation({
    mutationFn: (configId: string) =>
      AgentsService.activateAgentConfiguration({
        id: agentId,
        configId,
      }),
    onSuccess: () => {
      showSuccessToast("Configuration version activated successfully")
      queryClient.invalidateQueries({ queryKey: ["agent-configurations", agentId] })
      queryClient.invalidateQueries({ queryKey: ["agents"] })
      onVersionChange?.()
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
  })

  const handleCreateVersion = () => {
    if (!newPrompt.trim()) {
      showErrorToast("Prompt cannot be empty")
      return
    }

    createVersionMutation.mutate({
      task_prompt: newPrompt,
      llm_model: newLlmModel,
      change_description: newDescription || undefined,
    })
  }

  const handleActivateVersion = (version: ConfigurationVersion) => {
    if (version.is_current) return
    activateVersionMutation.mutate(version.id)
  }

  const handleViewVersion = (version: ConfigurationVersion) => {
    setSelectedVersion(version)
    setIsViewDialogOpen(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="lg" />
        <Text mt={4}>Loading configuration versions...</Text>
      </Box>
    )
  }

  if (error) {
    return (
      <Box p={4} bg="red.50" borderRadius="md" border="1px" borderColor="red.200">
        <Text color="red.600">Failed to load configuration versions</Text>
      </Box>
    )
  }

  const versions = versionsData?.data || []

  return (
    <VStack gap={4} align="stretch">
      <HStack justify="space-between">
        <Text fontSize="lg" fontWeight="semibold">
          Configuration Versions ({versions.length})
        </Text>
        <DialogRoot
          open={isCreateDialogOpen}
          onOpenChange={({ open }) => setIsCreateDialogOpen(open)}
        >
          <DialogTrigger asChild>
            <Button size="sm" colorPalette="blue">
              <FiPlus />
              New Version
            </Button>
          </DialogTrigger>
          <DialogContent maxWidth="2xl">
            <DialogHeader>
              <DialogTitle>Create New Configuration Version</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <VStack gap={4} align="stretch">
                <Field label="Task Prompt" required>
                  <Textarea
                    value={newPrompt}
                    onChange={(e) => setNewPrompt(e.target.value)}
                    placeholder="Enter the task prompt..."
                    rows={8}
                  />
                </Field>
                <Field label="LLM Model" required>
                  <select
                    value={newLlmModel}
                    onChange={(e) => setNewLlmModel(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "6px",
                      fontSize: "14px",
                      backgroundColor: "white",
                    }}
                  >
                    <option value="gpt-4o">GPT-4o</option>
                    <option value="gpt-4o-mini">GPT-4o Mini</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
                    <option value="claude-3-5-haiku-20241022">Claude 3.5 Haiku</option>
                    <option value="o3-mini">O3 Mini</option>
                  </select>
                </Field>
                <Field label="Change Description">
                  <Input
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Describe what changed in this version..."
                  />
                </Field>
              </VStack>
            </DialogBody>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                colorPalette="blue"
                onClick={handleCreateVersion}
                loading={createVersionMutation.isPending}
              >
                Create Version
              </Button>
            </DialogFooter>
            <DialogCloseTrigger />
          </DialogContent>
        </DialogRoot>
      </HStack>

      {versions.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Text color="gray.500">No configuration versions found</Text>
        </Box>
      ) : (
        <VStack gap={3} align="stretch">
          {versions.map((version: ConfigurationVersion) => (
            <Box
              key={version.id}
              p={4}
              border="1px"
              borderColor={version.is_current ? "blue.200" : "gray.200"}
              borderRadius="md"
              bg={version.is_current ? "blue.50" : "white"}
            >
              <HStack justify="space-between" mb={2}>
                <HStack gap={2}>
                  <Text fontWeight="semibold">Version {version.version}</Text>
                  {version.is_current && (
                    <Badge colorPalette="blue" size="sm">
                      <FiCheck size={12} />
                      Current
                    </Badge>
                  )}
                  <Badge colorPalette="gray" size="sm">
                    {version.llm_model}
                  </Badge>
                </HStack>
                <HStack gap={2}>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewVersion(version)}
                  >
                    View
                  </Button>
                  {!version.is_current && (
                    <Button
                      size="sm"
                      colorPalette="green"
                      onClick={() => handleActivateVersion(version)}
                      loading={activateVersionMutation.isPending}
                    >
                      Activate
                    </Button>
                  )}
                </HStack>
              </HStack>

              <Text fontSize="sm" color="gray.600" mb={2}>
                {version.change_description || "No description provided"}
              </Text>

              <HStack gap={4} fontSize="xs" color="gray.500">
                <HStack gap={1}>
                  <FiClock />
                  <Text>{formatDate(version.created_at)}</Text>
                </HStack>
                <HStack gap={1}>
                  <FiUser />
                  <Text>User {version.created_by.slice(0, 8)}...</Text>
                </HStack>
              </HStack>

              <Box
                fontSize="sm"
                mt={2}
                color="gray.700"
                fontFamily="mono"
                bg="gray.50"
                p={2}
                borderRadius="sm"
                overflow="hidden"
                maxHeight="3em"
              >
                <Text>{version.task_prompt}</Text>
              </Box>
            </Box>
          ))}
        </VStack>
      )}

      {/* View Version Dialog */}
      <DialogRoot
        open={isViewDialogOpen}
        onOpenChange={({ open }) => setIsViewDialogOpen(open)}
      >
        <DialogContent maxWidth="4xl">
          <DialogHeader>
            <DialogTitle>
              Version {selectedVersion?.version}
              {selectedVersion?.is_current && (
                <Badge colorPalette="blue" size="sm" ml={2}>
                  Current
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          <DialogBody>
            <VStack gap={4} align="stretch">
              <Box>
                <Text fontWeight="semibold" mb={2}>
                  LLM Model:
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {selectedVersion?.llm_model}
                </Text>
              </Box>

              <Box>
                <Text fontWeight="semibold" mb={2}>
                  Change Description:
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {selectedVersion?.change_description || "No description provided"}
                </Text>
              </Box>

              <Box>
                <Text fontWeight="semibold" mb={2}>
                  Created:
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {selectedVersion && formatDate(selectedVersion.created_at)}
                </Text>
              </Box>

              <Box>
                <Text fontWeight="semibold" mb={2}>
                  Task Prompt:
                </Text>
                <Textarea
                  value={selectedVersion?.task_prompt || ""}
                  readOnly
                  rows={12}
                  fontFamily="mono"
                  fontSize="sm"
                />
              </Box>
            </VStack>
          </DialogBody>
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
            {selectedVersion && !selectedVersion.is_current && (
              <Button
                colorPalette="green"
                onClick={() => {
                  handleActivateVersion(selectedVersion)
                  setIsViewDialogOpen(false)
                }}
                loading={activateVersionMutation.isPending}
              >
                Activate This Version
              </Button>
            )}
          </DialogFooter>
          <DialogCloseTrigger />
        </DialogContent>
      </DialogRoot>
    </VStack>
  )
}

export default ConfigurationVersions
