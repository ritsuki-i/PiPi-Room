"use client";
import { SignedIn, SignedOut, SignInButton, SignOutButton } from "@clerk/nextjs"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image";


export default function Header() {

    return (
        <div className="border-b">
            <header className="container mx-auto px-3 py-4 flex items-center justify-between">
                <div className="flex items-center justify-between gap-x-4">
                    <Image className="" src="/images/PiedPiperlogo.png" alt="Logo" width={50} height={50} />
                    <h1 className="font-bold text-[30px]">
                        <Link href="/">PiPi Room</Link>
                    </h1>
                </div>
                <nav className="flex items-center space-x-6">
                    <SignedIn>
                        <ul className="flex space-x-4 items-center">
                            <li>
                                <Link href="/works" className="text-sm hover:text-gray-600 transition-colors">
                                    Works
                                </Link>
                            </li>
                            <li>
                                <Link href="/articles" className="text-sm hover:text-gray-600 transition-colors">
                                    Articles
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard" className="text-sm hover:text-gray-600 transition-colors">
                                    Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link href="/user/profile" className="text-sm hover:text-gray-600 transition-colors">
                                    Profile
                                </Link>
                            </li>
                        </ul>
                        <SignOutButton>
                            <Button variant="default" size="sm">
                                Sign Out
                            </Button>
                        </SignOutButton>
                    </SignedIn>
                    <SignedOut>
                        <SignInButton fallbackRedirectUrl={'/dashboard'} mode="modal">
                            <Button variant="default" size="sm">
                                Sign In
                            </Button>
                        </SignInButton>
                    </SignedOut>
                </nav>
            </header>
        </div>
    )
}

