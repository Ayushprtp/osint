import Image from "next/image"
import React from "react"

interface WebsiteIconProps {
	domain: string
	size?: number
	className?: string
}

const extractDomain = (url: string): string => {
	if (!url.trim()) return ""

	try {
		const cleanUrl = url.trim().toLowerCase()
		const urlObject = new URL(cleanUrl.startsWith("http") ? cleanUrl : `https://${cleanUrl}`)
		const domain = urlObject.hostname.replace(/^www\./, "")
		return domain.includes(".") ? domain : `${domain}.com`
	} catch {
		const domain = url.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0]
		return domain ? (domain.includes(".") ? domain : `${domain}.com`) : ""
	}
}

const getFaviconUrl = (domain: string): string => {
	const cleanDomain = extractDomain(domain)
	return cleanDomain ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(cleanDomain)}&sz=64` : ""
}

export const WebsiteIcon = React.memo(({ domain, size = 16, className = "rounded-sm" }: WebsiteIconProps) => {
	if (!domain) return null

	return (
		<Image
			src={getFaviconUrl(domain)}
			alt={`${domain} favicon`}
			width={size}
			height={size}
			className={className}
			loading="lazy"
			onError={(e) => {
				e.currentTarget.style.display = "none"
			}}
		/>
	)
})

WebsiteIcon.displayName = "WebsiteIcon"
