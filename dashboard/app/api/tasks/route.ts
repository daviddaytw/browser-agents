import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../auth';
import { db } from '../../../lib/db';
import { tasks } from '../../../lib/db/schema';
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

    const userTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, session.user.email))
      .orderBy(desc(tasks.createdAt))
      .limit(limit)
      .offset(offset);

    const totalCount = await db
      .select({ count: tasks.id })
      .from(tasks)
      .where(eq(tasks.userId, session.user.email));

    return NextResponse.json({
      tasks: userTasks,
      total: totalCount.length,
      page,
      limit,
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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
      useAdblock = true,
      useProxy = true,
      proxyCountryCode = 'US',
      highlightElements = true,
      browserViewportWidth = 1280,
      browserViewportHeight = 960,
      maxAgentSteps = 75,
      enablePublicShare = false,
    } = body;

    if (!name || !description) {
      return NextResponse.json({ error: 'Name and description are required' }, { status: 400 });
    }

    const newTask = await db
      .insert(tasks)
      .values({
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
        userId: session.user.email,
      })
      .returning();

    return NextResponse.json(newTask[0], { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
