import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import { db } from '../../../../lib/db';
import { tasks, taskExecutions } from '../../../../lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const task = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, params.id), eq(tasks.userId, session.user.email)))
      .limit(1);

    if (task.length === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Get executions for this task
    const executions = await db
      .select()
      .from(taskExecutions)
      .where(eq(taskExecutions.taskId, params.id))
      .orderBy(desc(taskExecutions.createdAt));

    return NextResponse.json({
      ...task[0],
      executions,
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      allowedDomains,
      structuredOutputJson,
      llmModel,
      useAdblock,
      useProxy,
      proxyCountryCode,
      highlightElements,
      browserViewportWidth,
      browserViewportHeight,
      maxAgentSteps,
      enablePublicShare,
    } = body;

    const updatedTask = await db
      .update(tasks)
      .set({
        name,
        description,
        allowedDomains: allowedDomains ? JSON.stringify(allowedDomains) : null,
        structuredOutputJson,
        llmModel,
        useAdblock,
        useProxy,
        proxyCountryCode,
        highlightElements,
        browserViewportWidth,
        browserViewportHeight,
        maxAgentSteps,
        enablePublicShare,
        updatedAt: new Date(),
      })
      .where(and(eq(tasks.id, params.id), eq(tasks.userId, session.user.email)))
      .returning();

    if (updatedTask.length === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json(updatedTask[0]);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const deletedTask = await db
      .delete(tasks)
      .where(and(eq(tasks.id, params.id), eq(tasks.userId, session.user.email)))
      .returning();

    if (deletedTask.length === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
