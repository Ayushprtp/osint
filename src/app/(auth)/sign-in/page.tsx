"use client"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, ShieldCheck, KeyRound, LogIn, Check, AlertCircle } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import HCaptcha from "@hcaptcha/react-hcaptcha"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { authClient } from "@/client"

interface SignInState {
	accountHash: string
	isLoading: boolean
	error: Error | null
	isSignedIn: boolean
	captchaToken: string | null
	attempts: number
}

const ATTEMPT_TIMEOUT = 30000

export default function SignInPage() {
	const { state, handleSignIn, handleAccountHashChange, onCaptchaVerify, onCaptchaError, resetCaptcha } = useSignIn()
	const { accountHash, isLoading, error, isSignedIn, captchaToken, attempts } = state
	const [mounted, setMounted] = useState(false)
	const searchParams = useSearchParams()
	const [errorMessage, setErrorMessage] = useState<string | null>(null)
	const [cooldown, setCooldown] = useState(false)

	useEffect(() => {
		const errorParam = searchParams.get("error")
		if (errorParam === "security_ip_mismatch") {
			setErrorMessage(
				"Your session was terminated for security reasons. Your account was accessed from a different location.",
			)
		} else if (errorParam === "session_error") {
			setErrorMessage("There was a problem with your session. Please sign in again.")
		}
	}, [searchParams])

	useEffect(() => {
		setMounted(true)
	}, [])

	useEffect(() => {
		if (attempts >= 3) {
			setCooldown(true)
			const timer = setTimeout(() => {
				setCooldown(false)
			}, ATTEMPT_TIMEOUT)
			return () => clearTimeout(timer)
		}
	}, [attempts])

	if (!mounted) return null

	return (
		<div className="relative w-full max-w-md mx-auto">
			{/* Background animated elements */}
			<div className="absolute inset-0 -z-10 overflow-hidden">
				<div className="absolute inset-0 bg-background/50 backdrop-blur-xl" />
				{Array.from({ length: 5 }).map((_, i) => (
					<motion.div
						key={i}
						className="absolute rounded-full bg-primary/20"
						initial={{
							width: `${Math.random() * 100 + 50}px`,
							height: `${Math.random() * 100 + 50}px`,
							x: `${Math.random() * 100}%`,
							y: `${Math.random() * 100}%`,
							opacity: 0.2,
						}}
						animate={{
							y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
							opacity: [0.2, 0.3, 0.2],
						}}
						transition={{
							duration: Math.random() * 5 + 5,
							repeat: Number.POSITIVE_INFINITY,
							repeatType: "reverse",
						}}
					/>
				))}
			</div>

			<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
				<Card className="w-full overflow-hidden border border-border/30 bg-card/70 backdrop-blur-md shadow-2xl">
					<motion.div
						className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/80 via-primary to-primary/80"
						initial={{ scaleX: 0, opacity: 0 }}
						animate={{ scaleX: 1, opacity: 1 }}
						transition={{ duration: 1.2, delay: 0.3 }}
					/>

					<CardHeader className="space-y-2 text-center pb-2">
						<motion.div
							initial={{ scale: 0.8, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							transition={{ duration: 0.5 }}
							className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary"
						>
							<KeyRound className="h-6 w-6" />
						</motion.div>
						<CardTitle className="text-2xl font-bold tracking-tight">Sign In</CardTitle>
						<CardDescription className="text-muted-foreground">
							Welcome back! Please enter your account hash
						</CardDescription>
					</CardHeader>

					<CardContent className="pt-0">
						{errorMessage && (
							<motion.div
								className="mb-4"
								initial={{ opacity: 0, y: -10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.3 }}
							>
								<Alert variant="destructive" className="border-destructive/30 bg-destructive/10">
									<AlertDescription>{errorMessage}</AlertDescription>
								</Alert>
							</motion.div>
						)}
						<form onSubmit={handleSignIn} className="grid gap-5">
							<motion.div
								className="grid gap-2"
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.4, delay: 0.2 }}
							>
								<Label htmlFor="accountHash" className="text-sm font-medium">
									Account Hash
								</Label>
								<div className="relative">
									<Input
										id="accountHash"
										type="text"
										placeholder="Enter your account hash"
										required
										value={accountHash}
										onChange={handleAccountHashChange}
										disabled={isLoading || isSignedIn || cooldown}
										className="pr-10 bg-background/50 border-muted focus:border-primary transition-all duration-300"
									/>
									<ShieldCheck className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
								</div>
							</motion.div>

							<motion.div
								className="flex justify-center my-2"
								initial={{ opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ duration: 0.4, delay: 0.3 }}
							>
								<HCaptcha
									sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || "1b30c310-bd9c-43b8-9f0a-e92c276adda2"}
									onVerify={onCaptchaVerify}
									onError={onCaptchaError}
									onExpire={resetCaptcha}
								/>
							</motion.div>

							<AnimatePresence>
								{error && (
									<motion.div
										initial={{ opacity: 0, height: 0 }}
										animate={{ opacity: 1, height: "auto" }}
										exit={{ opacity: 0, height: 0 }}
										transition={{ duration: 0.3 }}
									>
										<Alert variant="destructive" className="border-destructive/30 bg-destructive/10">
											<AlertDescription>{error.message}</AlertDescription>
										</Alert>
									</motion.div>
								)}
							</AnimatePresence>

							{cooldown && (
								<Alert variant="destructive" className="border-warning/30 bg-warning/10">
									<AlertCircle className="h-4 w-4" />
									<AlertDescription>
										Too many attempts. Please wait {ATTEMPT_TIMEOUT / 1000} seconds before trying again.
									</AlertDescription>
								</Alert>
							)}

							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.4, delay: 0.4 }}
							>
								<Button
									type="submit"
									className="w-full bg-primary hover:bg-primary/90 transition-all duration-300"
									disabled={isLoading || isSignedIn || !accountHash.trim() || !captchaToken || cooldown}
								>
									{isLoading ? (
										<>
											<Loader2 className="mr-3 -ml-1 animate-spin" size={16} />
											<span>Signing In</span>
										</>
									) : isSignedIn ? (
										<>
											<Check className="mr-2 -ml-1" size={16} />
											<span>Signed In</span>
										</>
									) : (
										<>
											<LogIn className="mr-2 -ml-1" size={16} />
											<span>Sign In</span>
										</>
									)}
								</Button>
							</motion.div>
						</form>

						<div className="mt-6 space-y-4">
							<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.5 }}>
								<div className="relative flex items-center py-2">
									<div className="flex-grow border-t border-border/50" />
									<span className="mx-3 flex-shrink text-xs text-muted-foreground">OR</span>
									<div className="flex-grow border-t border-border/50" />
								</div>
							</motion.div>

							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.4, delay: 0.6 }}
							>
								<Button
									variant="outline"
									className="w-full bg-card/50 hover:bg-card/80 transition-all duration-300 border-border/50 hover:border-border"
									asChild
								>
									<Link href="/sign-up">Create New Account</Link>
								</Button>
							</motion.div>
						</div>
					</CardContent>
				</Card>
			</motion.div>
		</div>
	)
}

function useSignIn() {
	const [state, setState] = useState<SignInState>({
		accountHash: "",
		isLoading: false,
		error: null,
		isSignedIn: false,
		captchaToken: null,
		attempts: 0,
	})

	const handleAccountHashChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		setState((prev) => ({
			...prev,
			accountHash: e.target.value,
			error: null,
		}))
	}, [])

	const onCaptchaVerify = useCallback((token: string) => {
		setState((prev) => ({
			...prev,
			captchaToken: token,
			error: null,
		}))
	}, [])

	const onCaptchaError = useCallback((err: any) => {
		setState((prev) => ({
			...prev,
			error: new Error("CAPTCHA verification failed. Please try again."),
			captchaToken: null,
		}))
	}, [])

	const resetCaptcha = useCallback(() => {
		setState((prev) => ({
			...prev,
			captchaToken: null,
		}))
	}, [])

	const handleSignIn = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault()

			if (!state.captchaToken) {
				setState((prev) => ({
					...prev,
					error: new Error("Please complete the CAPTCHA verification"),
				}))
				return
			}

			setState((prev) => ({ ...prev, isLoading: true, error: null }))

			try {
				await authClient.signIn.email({
					email: `${state.accountHash}@t7.wtf`,
					password: state.accountHash,
					fetchOptions: {
						headers: {
							"x-captcha-response": state.captchaToken,
						},
					},
				})

				setState((prev) => ({ ...prev, isSignedIn: true }))
				window.location.href = "/dashboard"
			} catch (err) {
				setState((prev) => ({
					...prev,
					error: err instanceof Error ? err : new Error("An unexpected error occurred"),
					attempts: prev.attempts + 1,
				}))
			} finally {
				setState((prev) => ({ ...prev, isLoading: false }))
			}
		},
		[state.accountHash, state.captchaToken],
	)

	return {
		state,
		handleSignIn,
		handleAccountHashChange,
		onCaptchaVerify,
		onCaptchaError,
		resetCaptcha,
	}
}
