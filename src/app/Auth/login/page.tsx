import { ArrowLeft } from "lucide-react";

import { LoginFormV3 } from "@/components/login-Form-v3";
import Link from "next/link";
import Image from "next/image";
import { ThemeTogglerDemo } from "@/components/theme-toggler";

export default function Login() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-between gap-2 md:justify-between">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <ArrowLeft className="w-4 h-4" />
            </div>
            Volver
          </Link>
          <ThemeTogglerDemo direction="ltr" />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginFormV3 />
          </div>
        </div>
      </div>
      <div className=" relative hidden lg:block">
        <Image
          src="/buses.jpg"
          alt="Image"
          fill
          className="absolute inset-0 h-full w-full object-cover "
        />
      </div>
    </div>
  );
}
