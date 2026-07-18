import { requireWorkspaceSession } from "@/lib/github/auth";
import { assertTrustedOrigin } from "@/lib/github/config";
import { toGithubErrorResponse } from "@/lib/github/errors";
import { removeGithubConnection } from "@/lib/github/store";

export const dynamic = "force-dynamic";

export async function DELETE(request: Request) {
  try {
    assertTrustedOrigin(request);
    const { user } = await requireWorkspaceSession();
    await removeGithubConnection(user.id);
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return toGithubErrorResponse(error);
  }
}
