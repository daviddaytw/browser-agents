import { useMutation, useQueryClient } from "@tanstack/react-query"
import { type SubmitHandler, useForm } from "react-hook-form"

import {
  Button,
  DialogActionTrigger,
  DialogTitle,
  Input,
  Text,
  VStack,
  HStack,
  Box,
  Code,
} from "@chakra-ui/react"
import { useState } from "react"
import { FiPlus, FiCopy } from "react-icons/fi"

import { type APIKeyCreate, ApiKeysService, type APIKeyWithSecret } from "@/client"
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

const AddApiKey = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [createdKey, setCreatedKey] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const { showSuccessToast } = useCustomToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<APIKeyCreate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      name: "",
      is_active: true,
    },
  })

  const mutation = useMutation({
    mutationFn: (data: APIKeyCreate) =>
      ApiKeysService.createApiKey({ requestBody: data }),
    onSuccess: (data: APIKeyWithSecret) => {
      showSuccessToast("API key created successfully.")
      setCreatedKey(data.key)
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] })
    },
  })

  const onSubmit: SubmitHandler<APIKeyCreate> = (data) => {
    mutation.mutate(data)
  }

  const handleClose = () => {
    setIsOpen(false)
    setCreatedKey(null)
    reset()
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      showSuccessToast("API key copied to clipboard!")
    } catch (err) {
      console.error("Failed to copy: ", err)
    }
  }

  return (
    <DialogRoot
      size={{ base: "xs", md: "lg" }}
      placement="center"
      open={isOpen}
      onOpenChange={({ open }) => {
        if (!open) handleClose()
        else setIsOpen(open)
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <FiPlus fontSize="16px" />
          Add API Key
        </Button>
      </DialogTrigger>
      <DialogContent>
        {!createdKey ? (
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Add API Key</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <Text mb={4}>Create a new API key for external access.</Text>
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
                    placeholder="API key name (e.g., 'Production API', 'Development')"
                    type="text"
                  />
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
                    <Text fontSize="sm">API key is active and can be used</Text>
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
                Create API Key
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>API Key Created</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <VStack gap={4} align="stretch">
                <Text>
                  Your API key has been created successfully. Please copy it now as it won't be shown again.
                </Text>
                <Box>
                  <Text fontSize="sm" fontWeight="bold" mb={2}>
                    API Key:
                  </Text>
                  <HStack>
                    <Code
                      p={2}
                      borderRadius="md"
                      fontSize="sm"
                      fontFamily="mono"
                      flex={1}
                      wordBreak="break-all"
                    >
                      {createdKey}
                    </Code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(createdKey)}
                    >
                      <FiCopy />
                    </Button>
                  </HStack>
                </Box>
                <Text fontSize="sm" color="orange.500">
                  ⚠️ Store this key securely. You won't be able to see it again.
                </Text>
              </VStack>
            </DialogBody>
            <DialogFooter>
              <Button onClick={handleClose}>
                Done
              </Button>
            </DialogFooter>
          </>
        )}
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  )
}

export default AddApiKey
