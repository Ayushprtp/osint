"use client"
import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, PlusCircle, KeyRound, Copy, CheckCircle2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import HCaptcha from "@hcaptcha/react-hcaptcha"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { authClient } from "@/client"

interface SignUpState {
	hash: string
	isLoading: boolean
	error: Error | null
	isCreated: boolean
	captchaToken: string | null
}

export default function SignUpPage() {
	const { state, handleSignUp, handleCaptchaVerify, onCaptchaError } = useSignUp()
	const { hash, isLoading, error, isCreated, captchaToken } = state
	const [mounted, setMounted] = useState(false)
	const [copied, setCopied] = useState(false)
	const [hashSaved, setHashSaved] = useState(false)
	const router = useRouter()

	useEffect(() => {
		setMounted(true)
	}, [])

	const copyHashToClipboard = () => {
		navigator.clipboard.writeText(hash)
		setCopied(true)
		toast.success("Hash copied to clipboard!")
		setTimeout(() => setCopied(false), 2000)
	}

	const handleConfirmAndRedirect = () => {
		setHashSaved(true)
		toast.success("Redirecting to dashboard...")
		setTimeout(() => router.push("/dashboard"), 1000)
	}

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
						<CardTitle className="text-2xl font-bold tracking-tight">Sign Up</CardTitle>
						<CardDescription className="text-muted-foreground">Create an account to get started</CardDescription>
					</CardHeader>

					<CardContent className="pt-0">
						<motion.div
							initial={{ opacity: 0, y: 5 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4, delay: 0.2 }}
						>
							<Alert className="mb-5 border-primary/20 bg-primary/5">
								<AlertDescription className="text-sm">
									{isCreated ? (
										<div className="space-y-2">
											<p className="font-medium">Account created successfully!</p>
											<div className="flex items-center justify-between mt-1 p-2 bg-background/50 rounded-md border border-border/50">
												<code className="font-mono text-xs sm:text-sm">{hash}</code>
												<Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={copyHashToClipboard}>
													{copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
												</Button>
											</div>
											<p className="text-xs mt-1">
												<span className="text-amber-500">Important:</span> Please save this hash, you'll need it to
												access your account.
											</p>

											{isCreated && !hashSaved && (
												<motion.div
													initial={{ opacity: 0, y: 10 }}
													animate={{ opacity: 1, y: 0 }}
													transition={{ duration: 0.4, delay: 0.5 }}
													className="mt-3"
												>
													<Button
														onClick={handleConfirmAndRedirect}
														className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white shadow-md shadow-rose-500/20"
													>
														<CheckCircle2 className="mr-2 h-4 w-4" />
														I've saved my hash, continue to dashboard
													</Button>
												</motion.div>
											)}
										</div>
									) : (
										<div className="flex items-center space-x-2">
											<div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
											<span>
												A unique account hash will be generated for you. Make sure to save it when it appears.
											</span>
										</div>
									)}
								</AlertDescription>
							</Alert>
						</motion.div>

						<form onSubmit={handleSignUp} className="grid gap-5">
							<motion.div
								className="flex justify-center my-2"
								initial={{ opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ duration: 0.4, delay: 0.3 }}
							>
								<HCaptcha
									sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || "1b30c310-bd9c-43b8-9f0a-e92c276adda2"}
									onVerify={handleCaptchaVerify}
									onError={onCaptchaError}
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

							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.4, delay: 0.4 }}
							>
								<Button
									type="submit"
									className="w-full bg-primary hover:bg-primary/90 transition-all duration-300"
									disabled={isLoading || isCreated || !captchaToken}
								>
									{isLoading ? (
										<>
											<Loader2 className="mr-3 -ml-1 animate-spin" size={16} />
											<span>Creating Account</span>
										</>
									) : isCreated ? (
										<>
											<CheckCircle2 className="mr-2 -ml-1" size={16} />
											<span>Account Created</span>
										</>
									) : (
										<>
											<PlusCircle className="mr-2 -ml-1" size={16} />
											<span>Sign Up</span>
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
									<a href="/sign-in">Sign In Instead</a>
								</Button>
							</motion.div>
						</div>
					</CardContent>
				</Card>
			</motion.div>
		</div>
	)
}

function useSignUp() {
	const [state, setState] = useState<SignUpState>({
		hash: Math.random().toString(36).substring(2, 10),
		isLoading: false,
		error: null,
		isCreated: false,
		captchaToken: null,
	})

	const handleCaptchaVerify = (token: string) => {
		setState((prev) => ({
			...prev,
			captchaToken: token,
			error: null,
		}))
	}

	const onCaptchaError = (err: any) => {
		setState((prev) => ({
			...prev,
			error: new Error("CAPTCHA verification failed. Please try again."),
			captchaToken: null,
		}))
	}

	const handleSignUp = async (e: React.FormEvent) => {
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
			await authClient.signUp.email({
				email: `${state.hash}@t7.wtf`,
				name: state.hash,
				password: state.hash,
				fetchOptions: {
					headers: {
						"x-captcha-response": state.captchaToken,
					},
				},
			})

			setState((prev) => ({ ...prev, isCreated: true }))
		} catch (err) {
			setState((prev) => ({
				...prev,
				error: err instanceof Error ? err : new Error("An unexpected error occurred"),
			}))
		} finally {
			setState((prev) => ({ ...prev, isLoading: false }))
		}
	}

	return {
		state,
		handleSignUp,
		handleCaptchaVerify,
		onCaptchaError,
	}
}
