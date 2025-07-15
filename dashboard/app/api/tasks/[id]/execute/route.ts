import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../auth';
import { db } from '../../../../../lib/db';
import { tasks, taskExecutions } from '../../../../../lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { browserPodClient, RunTaskRequest } from '../../../../../lib/browser-pod-client';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the task template
    const task = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, params.id), eq(tasks.userId, session.user.email)))
      .limit(1);

    if (task.length === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const taskTemplate = task[0];
    const body = await request.json();
    const {
      secrets,
      includedFileNames,
      saveBrowserData = false,
    } = body;

    // Prepare the request for browser-pod
    const runTaskRequest: RunTaskRequest = {
      task: taskTemplate.description,
      secrets,
      allowed_domains: taskTemplate.allowedDomains ? JSON.parse(taskTemplate.allowedDomains) : undefined,
      save_browser_data: saveBrowserData,
      structured_output_json: taskTemplate.structuredOutputJson || undefined,
      llm_model: taskTemplate.llmModel || undefined,
      use_adblock: taskTemplate.useAdblock ?? true,
      use_proxy: taskTemplate.useProxy ?? true,
      proxy_country_code: taskTemplate.proxyCountryCode || 'US',
      highlight_elements: taskTemplate.highlightElements ?? true,
      included_file_names: includedFileNames,
      browser_viewport_width: taskTemplate.browserViewportWidth || 1280,
      browser_viewport_height: taskTemplate.browserViewportHeight || 960,
      max_agent_steps: taskTemplate.maxAgentSteps || 75,
      enable_public_share: taskTemplate.enablePublicShare ?? false,
    };

    // Call browser-pod API
    const browserPodResponse = await browserPodClient.runTask(runTaskRequest);

    // Store execution in database
    const newExecution = await db
      .insert(taskExecutions)
      .values({
        id: browserPodResponse.id,
        taskId: params.id,
        secrets: secrets ? JSON.stringify(secrets) : null,
        includedFileNames: includedFileNames ? JSON.stringify(includedFileNames) : null,
        saveBrowserData,
        status: 'created',
        userId: session.user.email,
      })
      .returning();

    return NextResponse.json(newExecution[0], { status: 201 });
  } catch (error) {
    console.error('Error executing task:', error);
    return NextResponse.json({ 
      error: 'Failed to execute task', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
