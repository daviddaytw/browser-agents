import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { type SubmitHandler, useForm } from "react-hook-form"

import {
  Button,
  DialogActionTrigger,
  DialogTitle,
  Input,
  Text,
  VStack,
  Textarea,
  Select,
} from "@chakra-ui/react"
import { useState } from "react"
import { FiPlus } from "react-icons/fi"

import { type AgentCreate, AgentsService, TeamsService } from "../../client"
import type { ApiError } from "../../client/core/ApiError"
import useCustomToast from "../../hooks/useCustomToast"
import { handleError } from "../../utils"
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTrigger,
} from "../ui/dialog"
import { Field } from "../ui/field"

interface AddAgentProps {
  teamId?: string
}

const AddAgent = ({ teamId }: AddAgentProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast } = useCustomToast()

  // Fetch teams for selection
  const { data: teamsData } = useQuery({
    queryKey: ["teams"],
    queryFn: () => TeamsService.readTeams({}),
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<{
    name: string
  }>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      name: "",
    },
  })

  const mutation = useMutation({
    mutationFn: (data: AgentCreate) =>
      AgentsService.createAgent({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Agent created successfully.")
      reset()
      setIsOpen(false)
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] })
    },
  })

  const onSubmit: SubmitHandler<{
    name: string
  }> = (data) => {
    // Use the first available team if no teamId is provided
    const defaultTeamId = teamId || (teams.length > 0 ? teams[0].id : "")
    
    const agentData: AgentCreate = {
      name: data.name,
      description: "",
      team_id: defaultTeamId,
      is_active: true,
      initial_config: {
        task_prompt: "You are a helpful browser automation agent. Please help the user with their tasks.",
        llm_model: "gpt-4o",
        llm_config: {},
        browser_settings: {},
        agent_settings: {},
        change_description: "Initial configuration",
      },
    }
    mutation.mutate(agentData)
  }

  const teams = teamsData?.data || []

  return (
    <DialogRoot
      size={{ base: "xs", md: "xl" }}
      placement="center"
      open={isOpen}
      onOpenChange={({ open }) => setIsOpen(open)}
    >
      <DialogTrigger asChild>
        <Button value="add-agent" my={4}>
          <FiPlus fontSize="16px" />
          Add Agent
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Add Agent</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Field
              required
              invalid={!!errors.name}
              errorText={errors.name?.message}
              label="Agent Name"
            >
              <Input
                id="name"
                {...register("name", {
                  required: "Name is required.",
                })}
                placeholder="Enter agent name"
                type="text"
              />
            </Field>
            <Text fontSize="sm" color="gray.500" mt={2}>
              The agent will be created with default settings. You can configure it further after creation.
            </Text>
          </DialogBody>

          <DialogFooter gap={2}>
            <DialogActionTrigger asChild>
              <Button
                variant="subtle"
                colorPalette="gray"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </DialogActionTrigger>
            <Button
              variant="solid"
              type="submit"
              disabled={!isValid}
              loading={isSubmitting}
            >
              Create Agent
            </Button>
          </DialogFooter>
        </form>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  )
}

export default AddAgent
