import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bundleId } = await params;

    if (!bundleId) {
      return NextResponse.json(
        { message: 'Bundle ID is required' },
        { status: 400 }
      );
    }

    const body = await req.json();

    // TODO: Replace with DB logic
    const updatedBundle = { _id: bundleId, ...body };

    return NextResponse.json({
      message: 'Bundle updated successfully',
      data: updatedBundle,
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Failed to update bundle', error: String(error) },
      { status: 500 }
    );
  }
}