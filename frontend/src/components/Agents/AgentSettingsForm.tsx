import React, { useState } from "react"
import {
  VStack,
  HStack,
  Text,
  Input,
  Textarea,
  Button,
  Box,
} from "@chakra-ui/react"
import { Field } from "../ui/field"
import { Checkbox } from "../ui/checkbox"

interface AgentSettingsFormProps {
  llmConfig: Record<string, any>
  setLlmConfig: (config: Record<string, any>) => void
  browserSettings: Record<string, any>
  setBrowserSettings: (settings: Record<string, any>) => void
  agentSettings: Record<string, any>
  setAgentSettings: (settings: Record<string, any>) => void
  llmModel: string
}

const AgentSettingsForm: React.FC<AgentSettingsFormProps> = ({
  llmConfig,
  setLlmConfig,
  browserSettings,
  setBrowserSettings,
  agentSettings,
  setAgentSettings,
  llmModel,
}) => {
  const [activeSection, setActiveSection] = useState<string | null>(null)

  const updateLlmConfig = (key: string, value: any) => {
    setLlmConfig({ ...llmConfig, [key]: value })
  }

  const updateBrowserSettings = (key: string, value: any) => {
    setBrowserSettings({ ...browserSettings, [key]: value })
  }

  const updateAgentSettings = (key: string, value: any) => {
    setAgentSettings({ ...agentSettings, [key]: value })
  }

  const updateMemoryConfig = (key: string, value: any) => {
    const memoryConfig = agentSettings.memory_config || {}
    setAgentSettings({
      ...agentSettings,
      memory_config: { ...memoryConfig, [key]: value }
    })
  }

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section)
  }

  const SectionHeader = ({ title, section }: { title: string; section: string }) => (
    <Button
      variant="ghost"
      onClick={() => toggleSection(section)}
      width="100%"
      justifyContent="space-between"
      fontWeight="semibold"
      py={3}
    >
      <Text>{title}</Text>
      <Text>{activeSection === section ? "−" : "+"}</Text>
    </Button>
  )

  return (
    <VStack gap={4} align="stretch">
      {/* LLM Configuration */}
      <Box border="1px" borderColor="gray.200" borderRadius="md">
        <SectionHeader title="LLM Configuration" section="llm" />
        {activeSection === "llm" && (
          <Box p={4} borderTop="1px" borderColor="gray.200">
            <VStack gap={4} align="stretch">

              <Field label="Temperature">
                <Input
                  type="number"
                  min={0}
                  max={2}
                  step={0.1}
                  value={llmConfig.temperature || 0.7}
                  onChange={(e) => updateLlmConfig("temperature", parseFloat(e.target.value))}
                />
              </Field>

              <Field label="Max Tokens">
                <Input
                  type="number"
                  min={1}
                  max={32000}
                  placeholder="Leave empty for default"
                  value={llmConfig.max_tokens || ""}
                  onChange={(e) => updateLlmConfig("max_tokens", e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </Field>
            </VStack>
          </Box>
        )}
      </Box>

      {/* Browser Settings */}
      <Box border="1px" borderColor="gray.200" borderRadius="md">
        <SectionHeader title="Browser Settings" section="browser" />
        {activeSection === "browser" && (
          <Box p={4} borderTop="1px" borderColor="gray.200">
            <VStack gap={4} align="stretch">

              {/* Viewport Settings */}
              <Text fontWeight="semibold" fontSize="sm">Viewport Settings</Text>

              <HStack gap={2}>
                <Field label="Width">
                  <Input
                    type="number"
                    placeholder="1280"
                    value={browserSettings.viewport?.width || ""}
                    onChange={(e) => updateBrowserSettings("viewport", {
                      ...browserSettings.viewport,
                      width: e.target.value ? parseInt(e.target.value) : undefined
                    })}
                  />
                </Field>
                <Field label="Height">
                  <Input
                    type="number"
                    placeholder="720"
                    value={browserSettings.viewport?.height || ""}
                    onChange={(e) => updateBrowserSettings("viewport", {
                      ...browserSettings.viewport,
                      height: e.target.value ? parseInt(e.target.value) : undefined
                    })}
                  />
                </Field>
              </HStack>

              <Field label="User Agent">
                <Input
                  placeholder="Custom user agent string"
                  value={browserSettings.user_agent || ""}
                  onChange={(e) => updateBrowserSettings("user_agent", e.target.value)}
                />
              </Field>

              <Field label="Locale">
                <Input
                  placeholder="en-US"
                  value={browserSettings.locale || ""}
                  onChange={(e) => updateBrowserSettings("locale", e.target.value)}
                />
              </Field>

              <Field label="Timezone">
                <Input
                  placeholder="America/New_York"
                  value={browserSettings.timezone_id || ""}
                  onChange={(e) => updateBrowserSettings("timezone_id", e.target.value)}
                />
              </Field>

              {/* Performance Settings */}
              <Text fontWeight="semibold" fontSize="sm">Performance & Timing</Text>

              <Field label="Wait for Network Idle (seconds)">
                <Input
                  type="number"
                  step="0.1"
                  placeholder="0.5"
                  value={browserSettings.wait_for_network_idle_page_load_time || ""}
                  onChange={(e) => updateBrowserSettings("wait_for_network_idle_page_load_time", e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </Field>

              <Field label="Wait Between Actions (seconds)">
                <Input
                  type="number"
                  step="0.1"
                  placeholder="0.5"
                  value={browserSettings.wait_between_actions || ""}
                  onChange={(e) => updateBrowserSettings("wait_between_actions", e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </Field>

              <Field label="Viewport Expansion (pixels)">
                <Input
                  type="number"
                  placeholder="500"
                  value={browserSettings.viewport_expansion || ""}
                  onChange={(e) => updateBrowserSettings("viewport_expansion", e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </Field>

              {/* Security Settings */}
              <Text fontWeight="semibold" fontSize="sm">Security Settings</Text>

              <HStack justify="space-between">
                <Text>Ignore HTTPS Errors</Text>
                <Checkbox
                  checked={browserSettings.ignore_https_errors || false}
                  onCheckedChange={(checked) => updateBrowserSettings("ignore_https_errors", checked)}
                />
              </HStack>

              <HStack justify="space-between">
                <Text>Bypass CSP</Text>
                <Checkbox
                  checked={browserSettings.bypass_csp || false}
                  onCheckedChange={(checked) => updateBrowserSettings("bypass_csp", checked)}
                />
              </HStack>

              <Field label="Proxy Server">
                <Input
                  placeholder="http://proxy.com:8080"
                  value={browserSettings.proxy?.server || ""}
                  onChange={(e) => updateBrowserSettings("proxy", {
                    ...browserSettings.proxy,
                    server: e.target.value
                  })}
                />
              </Field>
            </VStack>
          </Box>
        )}
      </Box>

      {/* Agent Behavior */}
      <Box border="1px" borderColor="gray.200" borderRadius="md">
        <SectionHeader title="Agent Behavior" section="behavior" />
        {activeSection === "behavior" && (
          <Box p={4} borderTop="1px" borderColor="gray.200">
            <VStack gap={4} align="stretch">
              <HStack justify="space-between">
                <Text>Use Vision</Text>
                <Checkbox
                  checked={agentSettings.use_vision !== false}
                  onCheckedChange={(checked) => updateAgentSettings("use_vision", checked)}
                />
              </HStack>
              <Text fontSize="xs" color="gray.500">
                Enable vision capabilities for processing visual information from web pages
              </Text>

              <Field label="Override System Message">
                <Textarea
                  placeholder="Completely replace the default system prompt"
                  value={agentSettings.override_system_message || ""}
                  onChange={(e) => updateAgentSettings("override_system_message", e.target.value)}
                  rows={3}
                />
              </Field>

              <Field label="Extend System Message">
                <Textarea
                  placeholder="Add additional instructions to the default system prompt"
                  value={agentSettings.extend_system_message || ""}
                  onChange={(e) => updateAgentSettings("extend_system_message", e.target.value)}
                  rows={3}
                />
              </Field>

              <Field label="Extend Planner System Message">
                <Textarea
                  placeholder="Additional instructions for the planner model"
                  value={agentSettings.extend_planner_system_message || ""}
                  onChange={(e) => updateAgentSettings("extend_planner_system_message", e.target.value)}
                  rows={2}
                />
              </Field>

              <Field label="Message Context">
                <Textarea
                  placeholder="Additional context to help the LLM understand the task"
                  value={agentSettings.message_context || ""}
                  onChange={(e) => updateAgentSettings("message_context", e.target.value)}
                  rows={2}
                />
              </Field>

            </VStack>
          </Box>
        )}
      </Box>

      {/* Execution Settings */}
      <Box border="1px" borderColor="gray.200" borderRadius="md">
        <SectionHeader title="Execution Settings" section="execution" />
        {activeSection === "execution" && (
          <Box p={4} borderTop="1px" borderColor="gray.200">
            <VStack gap={4} align="stretch">
              <Field label="Max Steps">
                <Input
                  type="number"
                  min={1}
                  max={1000}
                  value={agentSettings.max_steps || 100}
                  onChange={(e) => updateAgentSettings("max_steps", parseInt(e.target.value))}
                />
              </Field>

              <Field label="Max Actions Per Step">
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={agentSettings.max_actions_per_step || 10}
                  onChange={(e) => updateAgentSettings("max_actions_per_step", parseInt(e.target.value))}
                />
              </Field>

              <Field label="Max Failures">
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={agentSettings.max_failures || 3}
                  onChange={(e) => updateAgentSettings("max_failures", parseInt(e.target.value))}
                />
              </Field>

              <Field label="Retry Delay (seconds)">
                <Input
                  type="number"
                  min={1}
                  max={60}
                  value={agentSettings.retry_delay || 10}
                  onChange={(e) => updateAgentSettings("retry_delay", parseInt(e.target.value))}
                />
              </Field>

              <HStack justify="space-between">
                <Text>Generate GIF</Text>
                <Checkbox
                  checked={agentSettings.generate_gif || false}
                  onCheckedChange={(checked) => updateAgentSettings("generate_gif", checked)}
                />
              </HStack>
            </VStack>
          </Box>
        )}
      </Box>

      {/* Planner Settings */}
      <Box border="1px" borderColor="gray.200" borderRadius="md">
        <SectionHeader title="Planner Settings" section="planner" />
        {activeSection === "planner" && (
          <Box p={4} borderTop="1px" borderColor="gray.200">
            <VStack gap={4} align="stretch">
              <Text fontSize="sm" color="gray.600">
                Use a separate model for high-level task planning
              </Text>

              <Field label="Planner Model">
                <select
                  value={agentSettings.planner_llm || ""}
                  onChange={(e) => updateAgentSettings("planner_llm", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    fontSize: "14px",
                    backgroundColor: "white",
                  }}
                >
                  <option value="">No planner model</option>
                  <option value="gpt-4o-mini">GPT-4o Mini</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="claude-3-5-haiku-20241022">Claude 3.5 Haiku</option>
                  <option value="o3-mini">O3 Mini</option>
                </select>
              </Field>

              {agentSettings.planner_llm && (
                <>
                  <Field label="Planner Interval">
                    <Input
                      type="number"
                      min={1}
                      max={20}
                      value={agentSettings.planner_interval || 1}
                      onChange={(e) => updateAgentSettings("planner_interval", parseInt(e.target.value))}
                    />
                  </Field>

                  <HStack justify="space-between">
                    <Text>Use Vision for Planner</Text>
                    <Checkbox
                      checked={agentSettings.use_vision_for_planner !== false}
                      onCheckedChange={(checked) => updateAgentSettings("use_vision_for_planner", checked)}
                    />
                  </HStack>
                </>
              )}
            </VStack>
          </Box>
        )}
      </Box>

      {/* Memory Settings */}
      <Box border="1px" borderColor="gray.200" borderRadius="md">
        <SectionHeader title="Memory Settings" section="memory" />
        {activeSection === "memory" && (
          <Box p={4} borderTop="1px" borderColor="gray.200">
            <VStack gap={4} align="stretch">
              <HStack justify="space-between">
                <Text>Enable Memory</Text>
                <Checkbox
                  checked={agentSettings.enable_memory !== false}
                  onCheckedChange={(checked) => updateAgentSettings("enable_memory", checked)}
                />
              </HStack>
              <Text fontSize="xs" color="gray.500">
                Procedural memory system to optimize context window usage during long tasks
              </Text>

              {agentSettings.enable_memory !== false && (
                <>
                  <Field label="Agent ID">
                    <Input
                      placeholder="Unique identifier for memory sessions"
                      value={agentSettings.memory_config?.agent_id || ""}
                      onChange={(e) => updateMemoryConfig("agent_id", e.target.value)}
                    />
                  </Field>

                  <Field label="Memory Interval">
                    <Input
                      type="number"
                      min={1}
                      max={50}
                      value={agentSettings.memory_config?.memory_interval || 10}
                      onChange={(e) => updateMemoryConfig("memory_interval", parseInt(e.target.value))}
                    />
                  </Field>

                  <Field label="Embedder Provider">
                    <select
                      value={agentSettings.memory_config?.embedder_provider || "openai"}
                      onChange={(e) => updateMemoryConfig("embedder_provider", e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        border: "1px solid #e2e8f0",
                        borderRadius: "6px",
                        fontSize: "14px",
                        backgroundColor: "white",
                      }}
                    >
                      <option value="openai">OpenAI</option>
                      <option value="gemini">Gemini</option>
                      <option value="ollama">Ollama</option>
                      <option value="huggingface">Hugging Face</option>
                    </select>
                  </Field>

                  <Field label="Vector Store Provider">
                    <select
                      value={agentSettings.memory_config?.vector_store_provider || "faiss"}
                      onChange={(e) => updateMemoryConfig("vector_store_provider", e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        border: "1px solid #e2e8f0",
                        borderRadius: "6px",
                        fontSize: "14px",
                        backgroundColor: "white",
                      }}
                    >
                      <option value="faiss">FAISS (Local)</option>
                      <option value="qdrant">Qdrant</option>
                      <option value="pinecone">Pinecone</option>
                      <option value="chroma">Chroma</option>
                      <option value="weaviate">Weaviate</option>
                      <option value="memory">In-Memory</option>
                    </select>
                  </Field>

                  <Field label="Vector Store Base Path">
                    <Input
                      placeholder="/tmp/mem0"
                      value={agentSettings.memory_config?.vector_store_base_path || ""}
                      onChange={(e) => updateMemoryConfig("vector_store_base_path", e.target.value)}
                    />
                  </Field>
                </>
              )}
            </VStack>
          </Box>
        )}
      </Box>
    </VStack>
  )
}

export default AgentSettingsForm
