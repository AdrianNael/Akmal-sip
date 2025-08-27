import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { UserAuthForm } from "./user-auth-form";

export default function LoginForm() {
  return (
    <Card className="mx-auto  dark:bg-neutral-900 max-w-3xl grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
      <div className="bg-neutral-900 dark:bg-white text-white dark:text-black flex flex-col p-10 justify-between">
        <div className="flex items-center text-lg font-medium">
          Universitas Pertamina
        </div>
        <blockquote className="leading-normal text-balance mt-8">
          &ldquo;Innovation comes from saying "no" to 1000 things. &rdquo; -
          Steve Jobs
        </blockquote>
      </div>

      <CardContent className=" flex flex-col justify-center p-8">
        <div className="mt-6">
          <UserAuthForm />
        </div>

        <p className="text-muted-foreground px-4 text-center text-sm mt-6">
          By clicking continue, you agree to our{" "}
          <Link
            href="/terms"
            className="hover:text-primary underline underline-offset-4"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="hover:text-primary underline underline-offset-4"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </CardContent>
    </Card>
  );
}
