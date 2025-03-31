"use client"

import { useState } from "react"
import { SignedIn, SignedOut, SignInButton, SignOutButton } from "@clerk/nextjs"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"

export default function Header() {
    const [isOpen, setIsOpen] = useState(false)

    const loginNavItems = [
        { href: "/works", label: "Works" },
        { href: "/articles", label: "Articles" },
        { href: "/dashboard", label: "Dashboard" },
        { href: "/user/profile", label: "Profile" },
    ]

    const logoutNavItems = [
        { href: "/works", label: "Works" },
        { href: "/articles", label: "Articles" },
    ]

    return (
        <div className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
            <header className="container mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-x-2 md:gap-x-3">
                    <Image
                        src="/images/PiedPiperlogo.png"
                        alt="PiPi Room Logo"
                        width={40}
                        height={40}
                        className="w-8 h-8 md:w-10 md:h-10"
                    />
                    <h1 className="font-bold text-xl md:text-2xl">
                        <Link href="/" className="hover:opacity-80 transition-opacity">
                            PiPi Room
                        </Link>
                    </h1>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center space-x-6">
                    <SignedIn>
                        <ul className="flex space-x-6 items-center mr-4">
                            {loginNavItems.map((item) => (
                                <li key={item.href}>
                                    <Link href={item.href} className="text-sm font-medium hover:text-primary transition-colors">
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <SignOutButton>
                            <Button variant="default" size="sm">
                                Sign Out
                            </Button>
                        </SignOutButton>
                    </SignedIn>
                    <SignedOut>
                        <ul className="flex space-x-6 items-center mr-4">
                            {logoutNavItems.map((item) => (
                                <li key={item.href}>
                                    <Link href={item.href} className="text-sm font-medium hover:text-primary transition-colors">
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <SignInButton fallbackRedirectUrl={"/dashboard"} mode="modal">
                            <Button variant="default" size="sm">
                                Sign In
                            </Button>
                        </SignInButton>
                    </SignedOut>
                </nav>

                {/* Mobile Navigation */}
                <div className="md:hidden flex items-center">
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[250px] sm:w-[300px]">
                            <div className="flex flex-col h-full">
                                <div className="flex items-center justify-between border-b pb-4">
                                    <div className="flex items-center gap-x-2">
                                        <Image src="/images/PiedPiperlogo.png" alt="PiPi Room Logo" width={32} height={32} />
                                        <span className="font-bold">PiPi Room</span>
                                    </div>
                                </div>

                                <SignedIn>
                                    <nav className="flex flex-col mt-6 space-y-4">
                                        {loginNavItems.map((item) => (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className="px-2 py-1 text-sm font-medium hover:text-primary transition-colors"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                {item.label}
                                            </Link>
                                        ))}
                                    </nav>
                                    <div className="mt-auto pt-6 border-t">
                                        <SignOutButton>
                                            <Button variant="default" size="sm" className="w-full">
                                                Sign Out
                                            </Button>
                                        </SignOutButton>
                                    </div>
                                </SignedIn>

                                <SignedOut>
                                    <nav className="flex flex-col mt-6 space-y-4">
                                        {logoutNavItems.map((item) => (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className="px-2 py-1 text-sm font-medium hover:text-primary transition-colors"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                {item.label}
                                            </Link>
                                        ))}
                                    </nav>
                                    <div className="mt-auto pt-6 border-t">
                                        <SignInButton fallbackRedirectUrl={"/works"} mode="modal">
                                            <Button variant="default" size="sm" className="w-full">
                                                Sign In
                                            </Button>
                                        </SignInButton>
                                    </div>
                                </SignedOut>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </header>
        </div>
    )
}

