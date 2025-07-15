import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import { db } from '../../../../lib/db';
import { taskExecutions, tasks } from '../../../../lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { browserPodClient } from '../../../../lib/browser-pod-client';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const execution = await db
      .select({
        execution: taskExecutions,
        task: {
          id: tasks.id,
          name: tasks.name,
          description: tasks.description,
        },
      })
      .from(taskExecutions)
      .leftJoin(tasks, eq(taskExecutions.taskId, tasks.id))
      .where(and(eq(taskExecutions.id, params.id), eq(taskExecutions.userId, session.user.email)))
      .limit(1);

    if (execution.length === 0) {
      return NextResponse.json({ error: 'Execution not found' }, { status: 404 });
    }

    return NextResponse.json(execution[0]);
  } catch (error) {
    console.error('Error fetching execution:', error);
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

    const deletedExecution = await db
      .delete(taskExecutions)
      .where(and(eq(taskExecutions.id, params.id), eq(taskExecutions.userId, session.user.email)))
      .returning();

    if (deletedExecution.length === 0) {
      return NextResponse.json({ error: 'Execution not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Execution deleted successfully' });
  } catch (error) {
    console.error('Error deleting execution:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
