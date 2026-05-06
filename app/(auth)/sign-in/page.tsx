import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import SignInForm from "../components/sign-in-form";

export default function SignInPage() {
  return (
    <>
      <div className="flex flex-col gap-6 ">
        <div className="flex flex-col">
          <h1 className="text-3xl md:text-4xl">Sign In to Web Chatbot</h1>
          <p className="text-sm text-muted-foreground">
            New to Web Chatbot?{" "}
            <span className="group">
              <Link
                href={"/sign-up"}
                className="underline group-hover:text-primary"
              >
                Create an account
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
        <SignInForm />
      </div>
    </>
  );
}
