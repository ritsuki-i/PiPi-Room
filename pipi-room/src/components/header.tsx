import { SignedIn, SignedOut, SignInButton, SignOutButton, SignUpButton } from "@clerk/nextjs"
import Link from "next/link"
import { Button } from "@/components/ui/button"


export default function Header() {


    return (
        <div className="border-b">
            <header className="container mx-auto px-3 py-4 flex items-center justify-between">
                <h1 className="font-bold text-[30px]">
                    <Link href="/">PiPi Room</Link>
                </h1>
                <nav className="flex items-center space-x-6">
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
                    <SignedOut>
                        <SignInButton fallbackRedirectUrl={'/dashboard'} mode="modal">
                            <Button variant="default" size="sm">
                                Sign In
                            </Button>
                        </SignInButton>
                        <SignUpButton fallbackRedirectUrl={'/user/createAccount'} mode="modal">
                            <Button variant="default" size="sm">
                                Sign Up
                            </Button>
                        </SignUpButton>
                    </SignedOut>
                    <SignedIn>
                        <SignOutButton>
                            <Button variant="default" size="sm">
                                Sign Out
                            </Button>
                        </SignOutButton>
                    </SignedIn>
                </nav>
            </header>
        </div>
    )
}

