"use client"

import { useState, useEffect } from "react"
import { Bell, Check, AlertTriangle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { authClient } from "@/client"
import { toast } from "sonner"

interface Warning {
	id: number
	message: string
	createdAt: string
	isRead: boolean
}

export function UserWarnings() {
	// Authentication disabled - warnings not available without user session
	return null
}
