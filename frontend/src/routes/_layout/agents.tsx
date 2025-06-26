import { createFileRoute } from "@tanstack/react-router"

import AgentsList from "@/components/Agents/AgentsList"

export const Route = createFileRoute("/_layout/agents")({
  component: AgentsList,
})
