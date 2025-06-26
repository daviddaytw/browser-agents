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
  HStack,
} from "@chakra-ui/react"
import { useState } from "react"
import { FiPlus } from "react-icons/fi"

import { type AgentCreate, AgentsService } from "@/client"
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

const AddAgent = () => {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast } = useCustomToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<AgentCreate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      name: "",
      description: "",
      task_prompt: "",
      llm_model: "gpt-4o",
      llm_config: {},
      browser_settings: {},
      agent_settings: {},
      is_active: true,
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

  const onSubmit: SubmitHandler<AgentCreate> = (data) => {
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
            <Text mb={4}>Fill in the details to create a new browser agent.</Text>
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

              <Field
                required
                invalid={!!errors.llm_model}
                errorText={errors.llm_model?.message}
                label="LLM Model"
              >
                <select
                  {...register("llm_model", {
                    required: "Model is required.",
                  })}
                  defaultValue="gpt-4o"
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
                  <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
                  <option value="claude-3-5-haiku-20241022">Claude 3.5 Haiku</option>
                </select>
              </Field>

              <Field label="Active">
                <HStack>
                  <input
                    type="checkbox"
                    {...register("is_active")}
                    defaultChecked={true}
                    style={{
                      width: "16px",
                      height: "16px",
                      accentColor: "#3182ce",
                    }}
                  />
                  <Text fontSize="sm">Agent is active and can be executed</Text>
                </HStack>
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
