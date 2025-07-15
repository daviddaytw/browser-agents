import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../auth';
import { db } from '../../../../../lib/db';
import { taskExecutions } from '../../../../../lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { browserPodClient } from '../../../../../lib/browser-pod-client';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (!['stop', 'pause', 'resume'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Check if execution exists and belongs to user
    const execution = await db
      .select()
      .from(taskExecutions)
      .where(and(eq(taskExecutions.id, params.id), eq(taskExecutions.userId, session.user.email)))
      .limit(1);

    if (execution.length === 0) {
      return NextResponse.json({ error: 'Execution not found' }, { status: 404 });
    }

    // Call browser-pod API based on action
    try {
      switch (action) {
        case 'stop':
          await browserPodClient.stopTask(params.id);
          await db
            .update(taskExecutions)
            .set({ status: 'stopped' })
            .where(eq(taskExecutions.id, params.id));
          break;
        case 'pause':
          await browserPodClient.pauseTask(params.id);
          await db
            .update(taskExecutions)
            .set({ status: 'paused' })
            .where(eq(taskExecutions.id, params.id));
          break;
        case 'resume':
          await browserPodClient.resumeTask(params.id);
          await db
            .update(taskExecutions)
            .set({ status: 'running' })
            .where(eq(taskExecutions.id, params.id));
          break;
      }

      return NextResponse.json({ message: `Task ${action}ped successfully` });
    } catch (browserError) {
      console.error(`Error ${action}ping task:`, browserError);
      return NextResponse.json({ 
        error: `Failed to ${action} task`, 
        details: browserError instanceof Error ? browserError.message : 'Unknown error' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error controlling execution:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
