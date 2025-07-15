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

    // Check if execution exists and belongs to user
    const execution = await db
      .select()
      .from(taskExecutions)
      .where(and(eq(taskExecutions.id, params.id), eq(taskExecutions.userId, session.user.email)))
      .limit(1);

    if (execution.length === 0) {
      return NextResponse.json({ error: 'Execution not found' }, { status: 404 });
    }

    try {
      // Get latest task data from browser-pod
      const taskData = await browserPodClient.getTask(params.id);
      
      // Get screenshots and media
      const [screenshots, media] = await Promise.all([
        browserPodClient.getTaskScreenshots(params.id).catch(() => ({ screenshots: [] })),
        browserPodClient.getTaskMedia(params.id).catch(() => ({ recordings: [] })),
      ]);

      // Update execution in database
      const updatedExecution = await db
        .update(taskExecutions)
        .set({
          status: taskData.status,
          output: taskData.output,
          liveUrl: taskData.live_url,
          publicShareUrl: taskData.public_share_url,
          outputFiles: taskData.output_files ? JSON.stringify(taskData.output_files) : null,
          screenshots: screenshots.screenshots ? JSON.stringify(screenshots.screenshots) : null,
          recordings: media.recordings ? JSON.stringify(media.recordings) : null,
          steps: taskData.steps ? JSON.stringify(taskData.steps) : null,
          browserData: taskData.browser_data ? JSON.stringify(taskData.browser_data) : null,
          finishedAt: taskData.finished_at ? new Date(taskData.finished_at) : null,
        })
        .where(eq(taskExecutions.id, params.id))
        .returning();

      return NextResponse.json(updatedExecution[0]);
    } catch (browserError) {
      console.error('Error syncing with browser-pod:', browserError);
      return NextResponse.json({ 
        error: 'Failed to sync with browser-pod', 
        details: browserError instanceof Error ? browserError.message : 'Unknown error' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error syncing execution:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
