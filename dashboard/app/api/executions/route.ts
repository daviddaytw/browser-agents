import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../auth';
import { db } from '../../../lib/db';
import { taskExecutions, tasks } from '../../../lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    const executions = await db
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
      .where(eq(taskExecutions.userId, session.user.email))
      .orderBy(desc(taskExecutions.createdAt))
      .limit(limit)
      .offset(offset);

    const totalCount = await db
      .select({ count: taskExecutions.id })
      .from(taskExecutions)
      .where(eq(taskExecutions.userId, session.user.email));

    return NextResponse.json({
      executions,
      total: totalCount.length,
      page,
      limit,
    });
  } catch (error) {
    console.error('Error fetching executions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
