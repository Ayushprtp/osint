"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  ArrowLeft,
  Twitter,
  Clock,
  Calendar,
  Loader2,
  AlertTriangle,
  FileJson,
} from "lucide-react";

type Account = {
  id: number;
  id_str: string;
  screen_names: Record<string, string[]>;
};

type SearchResponse = {
  success: boolean;
  result: {
    accounts: Account[];
  };
  error?: string;
};

export default function MemoryLol() {
  const [isSearching, setIsSearching] = useState(false);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) {
      setError("Please enter a Twitter handle to search");
      return;
    }

    setIsSearching(true);
    setError(null);
    setSearchResults(null);

    try {
      const response = await fetch("/api/memorylol", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, type: "tw" }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error || "An error occurred during the search");
      }

      const data: SearchResponse = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred while fetching data. Please try again."
      );
    } finally {
      setIsSearching(false);
    }
  }, [query]);

  const downloadResults = useCallback(() => {
    if (!searchResults?.result) return;

    const content = JSON.stringify(searchResults.result, null, 2);
    const filename = `memorylol-search-${query}.json`;
    const mimeType = "application/json";

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
  }, [searchResults, query]);

  const formatScreenNames = useMemo(() => {
    if (!searchResults?.result?.accounts || searchResults.result.accounts.length === 0) {
      return [];
    }

    const formattedNames: {
      handle: string;
      firstSeen: string | null;
      lastSeen: string | null;
    }[] = [];

    searchResults.result.accounts.forEach((account) => {
      Object.entries(account.screen_names).forEach(([handle, dates]) => {
        formattedNames.push({
          handle,
          firstSeen: dates ? dates[0] || null : null,
          lastSeen: dates && dates.length > 1 ? dates[1] : dates ? dates[0] : null,
        });
      });
    });

    // Sort by first seen date (earliest first)
    return formattedNames.sort((a, b) => {
      const dateA = a.firstSeen ? new Date(a.firstSeen).getTime() : Infinity;
      const dateB = b.firstSeen ? new Date(b.firstSeen).getTime() : Infinity;
      return dateA - dateB;
    });
  }, [searchResults]);

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Twitter className="h-7 w-7 text-rose-500" />
          Memory.lol
        </h1>
        <Button variant="outline" asChild>
          <Link href="/dashboard" className="flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span>Back to Dashboard</span>
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Twitter Username History
          </CardTitle>
          <CardDescription>
            Search for historical Twitter handles associated with an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex w-full items-center space-x-2">
            <div className="relative flex-1">
              <Input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter Twitter handle..."
                className="pr-10"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
              />
              <Button
                className="absolute right-0 top-0 h-full rounded-l-none bg-rose-600 hover:bg-rose-700"
                onClick={handleSearch}
                disabled={isSearching}
              >
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isSearching && !searchResults && (
        <div className="flex justify-center items-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="animate-in fade-in duration-300">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <AlertTitle className="text-base font-semibold">Error Occurred</AlertTitle>
              <AlertDescription className="text-sm text-muted-foreground mt-1">
                {error}
              </AlertDescription>
            </div>
          </div>
        </Alert>
      )}

      {searchResults && (
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader className="pb-0">
            <div className="flex flex-row justify-between items-center">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-neutral-300" />
                <CardTitle className="text-white">Twitter Identity Timeline</CardTitle>
                {formatScreenNames.length > 0 && (
                  <Badge variant="outline" className="ml-1 bg-rose-500/20 text-rose-300 border-rose-500/30 hover:bg-rose-500/30">
                    {formatScreenNames.length} {formatScreenNames.length === 1 ? "identity" : "identities"}
                  </Badge>
                )}
              </div>
              {formatScreenNames.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadResults}
                  className="border-rose-500/40 text-rose-300 hover:bg-rose-500/20 hover:text-rose-200"
                >
                  <FileJson className="h-4 w-4 mr-2" />
                  Download JSON
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {formatScreenNames.length > 0 ? (
              <div className="relative">
                {/* Timeline track */}
                <div className="absolute left-3 top-0 bottom-8 w-px bg-neutral-700"></div>
                
                {/* Username timeline items */}
                <div className="space-y-8">
                  {formatScreenNames.map((item, index) => (
                    <div key={index} className="relative pl-10">
                      {/* Timeline node */}
                      <div className="absolute left-[11px] top-1.5 w-2 h-2 rounded-full bg-rose-500 -translate-x-1/2"></div>
                      
                      {/* Handle */}
                      <div className="mb-2">
                        <div className="flex items-center">
                          <Twitter className="h-4 w-4 text-rose-500 mr-2" />
                          <span className="text-white text-lg font-medium">@{item.handle}</span>
                        </div>
                      </div>
                      
                      {/* First seen */}
                      <div className="text-sm text-neutral-300 flex items-center gap-2 ml-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500/70"></div>
                        <span>First observed:</span>
                        {item.firstSeen ? (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                            <span>{item.firstSeen}</span>
                            {item.firstSeen === item.lastSeen && (
                              <Badge className="ml-1 bg-rose-500/20 text-rose-300 border-rose-500/30 h-5 text-[10px]">
                                Single observation
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-neutral-500">Unknown</span>
                        )}
                      </div>
                      
                      {/* Last seen (if different from first) */}
                      {item.lastSeen && item.lastSeen !== item.firstSeen && (
                        <div className="text-sm text-neutral-300 flex items-center gap-2 ml-0.5 mt-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-rose-500/70"></div>
                          <span>Last observed:</span>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                            <span>{item.lastSeen}</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Account ID (only for first item) */}
                      {index === 0 && searchResults.result.accounts[0] && (
                        <div className="text-xs text-neutral-500 mt-2 ml-0.5">
                          Account ID: {searchResults.result.accounts[0].id_str}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <Alert variant="default" className="bg-neutral-800 border-neutral-700">
                <AlertTitle className="text-white">No results found</AlertTitle>
                <AlertDescription className="text-neutral-300">
                  No username history available for <span className="text-white font-medium">@{query}</span>. Try a different username.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 
