import { NextResponse } from 'next/server';
import { z } from 'zod';

import { postStatusSchema } from '@/entities/post/types';
import {
  PostNotFoundError,
  updatePost,
} from '@/features/linkedin-posts/services/update-post.service';
import { deletePost } from '@/features/linkedin-posts/services/delete-post.service';

const patchBodySchema = z
  .object({
    content: z.string().min(1).optional(),
    status: postStatusSchema.optional(),
  })
  .refine(
    (value) => value.content !== undefined || value.status !== undefined,
    {
      message: 'Provide content and/or status to update.',
    },
  );

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const body = await request.json().catch(() => null);
  const parsedInput = patchBodySchema.safeParse(body);

  if (!parsedInput.success) {
    return NextResponse.json(
      { message: 'Provide content and/or status to update.' },
      { status: 400 },
    );
  }

  const { id } = await params;

  try {
    const post = await updatePost(id, parsedInput.data);
    return NextResponse.json({ post });
  } catch (error) {
    if (error instanceof PostNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }

    console.error('Failed to update the post', error);
    return NextResponse.json(
      { message: 'Failed to update the post.' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    await deletePost(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof PostNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }

    console.error('Failed to delete the post', error);
    return NextResponse.json(
      { message: 'Failed to delete the post.' },
      { status: 500 },
    );
  }
}
