import { NextRequest } from "next/server";
import { z } from "zod";
import { handleApi, requireCapability, ApiAuthError } from "@/modules/auth/rbac";
import { listUsers, inviteUser } from "@/modules/users/user.service";

export const GET = () =>
  handleApi(async () => {
    await requireCapability("users.manage");
    return listUsers();
  });

const inviteSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  role: z.enum(["SUPERADMIN", "ADMIN", "MODERATOR", "EDITOR"]),
});

export const POST = (req: NextRequest) =>
  handleApi(async () => {
    const user = await requireCapability("users.manage");
    const body = inviteSchema.parse(await req.json());
    try {
      return await inviteUser(user.id, body);
    } catch (err) {
      if (err instanceof Error && err.message.includes("already exists")) {
        throw new ApiAuthError(409, "DUPLICATE", err.message);
      }
      throw err;
    }
  });
