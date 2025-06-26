import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import {
  Button,
  DialogActionTrigger,
  DialogTitle,
  Text,
  IconButton,
} from "@chakra-ui/react"
import { FiTrash2 } from "react-icons/fi"

import { ApiKeysService } from "@/client"
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

interface DeleteApiKeyProps {
  id: string
  name: string
}

const DeleteApiKey = ({ id, name }: DeleteApiKeyProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast } = useCustomToast()

  const mutation = useMutation({
    mutationFn: () => ApiKeysService.deleteApiKey({ id }),
    onSuccess: () => {
      showSuccessToast("API key deleted successfully.")
      setIsOpen(false)
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] })
    },
  })

  return (
    <DialogRoot
      size="sm"
      placement="center"
      open={isOpen}
      onOpenChange={({ open }) => setIsOpen(open)}
    >
      <DialogTrigger asChild>
        <IconButton
          size="sm"
          variant="outline"
          colorPalette="red"
          aria-label="Delete API key"
        >
          <FiTrash2 />
        </IconButton>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete API Key</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Text>
            Are you sure you want to delete the API key "{name}"? This action cannot be undone.
          </Text>
        </DialogBody>
        <DialogFooter gap={2}>
          <DialogActionTrigger asChild>
            <Button variant="subtle" colorPalette="gray">
              Cancel
            </Button>
          </DialogActionTrigger>
          <Button
            variant="solid"
            colorPalette="red"
            onClick={() => mutation.mutate()}
            loading={mutation.isPending}
          >
            Delete
          </Button>
        </DialogFooter>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  )
}

export default DeleteApiKey
