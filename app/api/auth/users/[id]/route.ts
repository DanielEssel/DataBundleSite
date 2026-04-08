import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }

    // TODO: Replace with DB logic
    const deletedUser = { _id: userId };

    return NextResponse.json({
      message: 'User deleted successfully',
      data: deletedUser,
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Failed to delete user', error: String(error) },
      { status: 500 }
    );
  }
}