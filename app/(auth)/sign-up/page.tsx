import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import SignUpForm from "../components/sign-up-form";

export default function SignUpPage() {
  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col">
          <h1 className="text-3xl md:text-4xl">Sign Up for Takoni</h1>
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <span className="group">
              <Link
                href={"/sign-in"}
                className="underline group-hover:text-primary"
              >
                Sign in here
              </Link>
            </span>
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <Button
            variant={"outline"}
            disabled
            className="hover:cursor-not-allowed"
          >
            <FcGoogle /> Continue with Google
          </Button>
          <Button
            variant={"outline"}
            disabled
            className="hover:cursor-not-allowed"
          >
            <FaGithub /> Continue with Github
          </Button>
        </div>
        <Separator />
        <SignUpForm />
      </div>
    </>
  );
}
