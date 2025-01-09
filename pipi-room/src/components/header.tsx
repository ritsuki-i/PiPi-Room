import { SignedIn, SignedOut, SignInButton, SignOutButton } from "@clerk/nextjs";
import Link from "next/link"

export default function Header() {
    return (
        <div className="border-b">
            <header className="container mx-auto px-3 py-7 flex justify-between">
                <h1 className="font-bold text-[30px]">
                    <Link href="/">PiPi Room</Link>
                </h1>
                <SignedOut>
                    <SignInButton />
                </SignedOut>
                <SignedIn>
                    <SignOutButton/>
                </SignedIn>
            </header>
        </div>
    )
}