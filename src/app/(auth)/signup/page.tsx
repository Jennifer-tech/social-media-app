import { Metadata } from "next";
import Image from "next/image";
import signUpImage from "@/assets/signup-image.jpg";
import Link from "next/link";
import SignUpForm from "./SignUpForm";

export const metadata: Metadata = {
  title: "Sign Up",
};

export default function Page() {
  return (
    <main className="flex h-screen items-center justify-center p-5">
      <div className="flex h-full max-h-[40rem] w-full max-w-[64rem] overflow-hidden rounded-2xl bg-card shadow-2xl">
        <div className="w-full space-y-10 overflow-y-auto p-10 md:w-1/2">
          <div className="space-y-1 text-center">
            <h1 className="tetx-3xl font-bold">Sign up to bugbook</h1>
            <p className="text-muted-foreground">A place where even <span className="italic">you</span> can find friend</p>
          </div>
          <div className="space-y-5">
            <SignUpForm />
            <Link href="/login" className="block text-center hover:underline">
                Already have an account? Log in
            </Link>
          </div>
        </div>
        <Image
          src={signUpImage}
          alt=""
          className="w-1/2 hidden md:block object-cover"
        />
      </div>
    </main>
  );
}
