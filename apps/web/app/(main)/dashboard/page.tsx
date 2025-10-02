import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { getAllUsers } from "@workspace/database";
import { Button } from "@workspace/ui/components/button";

export default async function Page() {
  const users = await getAllUsers();
  return (
    <div className="flex items-center justify-center min-h-svh">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Hello apps/web</h1>
        <Button size="sm" className="cursor-pointer">
          Hello
        </Button>
        <UserButton />
        <div>
          <p>users : </p>
          <ul>
            {users.map((user) => (
              <li key={user.id}>{user.name}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
