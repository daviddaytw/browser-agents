import { useMutation, useQueryClient } from "@tanstack/react-query"
import { type SubmitHandler, useForm } from "react-hook-form"

import {
  Button,
  DialogActionTrigger,
  DialogTitle,
  Input,
  Text,
  VStack,
  Textarea,
  IconButton,
} from "@chakra-ui/react"
import { useState } from "react"
import { FiEdit } from "react-icons/fi"

import { type AgentPublic, type AgentUpdate, AgentsService } from "@/client"
import type { ApiError } from "@/client/core/ApiError"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"
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

interface EditAgentProps {
  agent: AgentPublic
}

const EditAgent = ({ agent }: EditAgentProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast } = useCustomToast()
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<AgentUpdate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      name: agent.name,
      description: agent.description || "",
      task_prompt: agent.task_prompt,
      llm_model: agent.llm_model,
      is_active: agent.is_active,
    },
  })

  const mutation = useMutation({
    mutationFn: (data: AgentUpdate) =>
      AgentsService.updateAgent({ id: agent.id, requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Agent updated successfully.")
      setIsOpen(false)
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] })
    },
  })

  const onSubmit: SubmitHandler<AgentUpdate> = (data) => {
    mutation.mutate(data)
  }

  return (
    <DialogRoot
      size={{ base: "xs", md: "lg" }}
      placement="center"
      open={isOpen}
      onOpenChange={({ open }) => setIsOpen(open)}
    >
      <DialogTrigger asChild>
        <IconButton
          size="sm"
          variant="outline"
          aria-label="Edit agent"
        >
          <FiEdit />
        </IconButton>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Edit Agent</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text mb={4}>Update the agent details.</Text>
            <VStack gap={4}>
              <Field
                required
                invalid={!!errors.name}
                errorText={errors.name?.message}
                label="Name"
              >
                <Input
                  id="name"
                  {...register("name", {
                    required: "Name is required.",
                  })}
                  placeholder="Agent name"
                  type="text"
                />
              </Field>

              <Field
                invalid={!!errors.description}
                errorText={errors.description?.message}
                label="Description"
              >
                <Input
                  id="description"
                  {...register("description")}
                  placeholder="Brief description of what this agent does"
                  type="text"
                />
              </Field>

              <Field
                required
                invalid={!!errors.task_prompt}
                errorText={errors.task_prompt?.message}
                label="Task Prompt"
              >
                <Textarea
                  id="task_prompt"
                  {...register("task_prompt", {
                    required: "Task prompt is required.",
                  })}
                  placeholder="Describe what you want the agent to do..."
                  rows={4}
                />
              </Field>
            </VStack>
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
              Update Agent
            </Button>
          </DialogFooter>
        </form>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  )
}

export default EditAgent
