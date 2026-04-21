import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import SignOutButton from "../../components/sign-out-button";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/sign-in");

  await dbConnect();

  const user = await User.findById(session.user.id).lean();
  if (!user) redirect("/sign-in");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl md:text-2xl">Profile</h1>
        <p className="text-md text-muted-foreground">
          Review your account information and preferences.
        </p>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>Primary information linked to your account.</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <small className="text-muted-foreground">Username</small>
              <p>{user.username}</p>
            </div>
            <div className="flex flex-col gap-1">
              <small className="text-muted-foreground">Email</small>
              <p>{user.email}</p>
            </div>
            <div className="flex flex-col gap-1">
              <small className="text-muted-foreground">User ID</small>
              <p className="break-all">{String(user._id)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Current communication settings and session actions.</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <small className="text-muted-foreground">Email Preferences</small>
              <div>
                <Badge
                  className={
                    user.emailPreferences
                      ? "bg-emerald-500 capitalize"
                      : "bg-muted text-muted-foreground capitalize"
                  }
                >
                  {user.emailPreferences ? "enabled" : "disabled"}
                </Badge>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <small className="text-muted-foreground">Session</small>
              <Button asChild variant="destructive" className="w-fit">
                <SignOutButton />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
