"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Copy, CheckCircle, XCircle, Clock, User } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type UserDetails = {
  id: string;
  name: string;
  email: string;
  alias: string;
};

type KeyDetails = {
  key: string;
  exists: boolean;
  isUsed: boolean;
  createdAt: string;
  expiresAt: string;
  durationDays: number;
  usedBy: string | null;
  usedAt: string | null;
  userDetails: UserDetails | null;
};

type UserSubscriptionDetails = {
  subscriptionDays: number;
  expiresAt: string;
  key: string;
  usedAt: string;
  exists: boolean;
  userDetails: UserDetails;
};

type LookupResult = {
  success: boolean;
  message: string;
  keyDetails?: KeyDetails;
};

type UserLookupResult = {
  success: boolean;
  message: string;
  userSubscription?: UserSubscriptionDetails;
};

export default function KeyLookup() {
  const [keyInput, setKeyInput] = useState("");
  const [result, setResult] = useState<LookupResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // User lookup states
  const [userInput, setUserInput] = useState("");
  const [userResult, setUserResult] = useState<UserLookupResult | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(false);

  async function handleLookup() {
    if (!keyInput.trim()) {
      setResult({
        success: false,
        message: "Please enter a subscription key",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/key-details?key=${encodeURIComponent(keyInput)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      setResult({
        success: true,
        message: "Key details retrieved successfully",
        keyDetails: data.keyDetails,
      });
    } catch (error) {
      console.error("Error looking up key:", error);
      setResult({
        success: false,
        message: `Failed to lookup key: ${error instanceof Error ? error.message : String(error)}`,
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  async function handleUserLookup() {
    if (!userInput.trim()) {
      setUserResult({
        success: false,
        message: "Please enter a username or email",
      });
      return;
    }

    setIsUserLoading(true);
    try {
      const response = await fetch(`/api/admin/user-details?identifier=${encodeURIComponent(userInput)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      setUserResult({
        success: true,
        message: "User subscription details retrieved successfully",
        userSubscription: data.userSubscription,
      });
    } catch (error) {
      console.error("Error looking up user:", error);
      setUserResult({
        success: false,
        message: `Failed to lookup user: ${error instanceof Error ? error.message : String(error)}`,
      });
    } finally {
      setIsUserLoading(false);
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="container mx-auto py-8 px-4 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Lookup Tools</h1>
          <Button variant="outline" asChild>
            <Link href="/dashboard/admin">
              <ArrowLeft className="w-6 h-6 mr-2" />
              Go to Admin Dashboard
            </Link>
          </Button>
        </div>

        <Tabs defaultValue="key" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="key">Key Lookup</TabsTrigger>
            <TabsTrigger value="user">User Lookup</TabsTrigger>
          </TabsList>
          
          <TabsContent value="key">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Subscription Key Lookup</CardTitle>
                <CardDescription>
                  Enter a subscription key to view its details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
                  <Input
                    placeholder="Enter subscription key (e.g., A236-459A-A6D7-0783)"
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleLookup} 
                    disabled={isLoading || !keyInput.trim()}
                  >
                    {isLoading ? (
                      "Searching..."
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Lookup Key
                      </>
                    )}
                  </Button>
                </div>

                {result && !result.success && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{result.message}</AlertDescription>
                  </Alert>
                )}

                {result?.success && result.keyDetails && (
                  <div className="mt-6">
                    <Alert variant={result.keyDetails.exists ? "default" : "destructive"} className="mb-4">
                      <AlertTitle className="flex items-center">
                        {result.keyDetails.exists ? (
                          <>
                            <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                            Key Found
                          </>
                        ) : (
                          <>
                            <XCircle className="w-5 h-5 mr-2 text-red-500" />
                            Key Not Found
                          </>
                        )}
                      </AlertTitle>
                      <AlertDescription>
                        <div className="flex items-center mt-2">
                          <code className="font-mono bg-muted p-1 rounded">{result.keyDetails.key}</code>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => result.keyDetails && copyToClipboard(result.keyDetails.key)}
                            className="ml-2"
                          >
                            <Copy className={`h-4 w-4 ${copied ? "text-green-500" : ""}`} />
                          </Button>
                        </div>
                      </AlertDescription>
                    </Alert>

                    <div className="rounded-md border mt-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-1/3">Property</TableHead>
                            <TableHead>Value</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">Status</TableCell>
                            <TableCell>
                              {result.keyDetails.isUsed ? (
                                <span className="inline-flex items-center text-amber-600">
                                  <Clock className="w-4 h-4 mr-1" />
                                  Used
                                </span>
                              ) : (
                                <span className="inline-flex items-center text-green-600">
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Available
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Created At</TableCell>
                            <TableCell>{formatDate(result.keyDetails.createdAt)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Duration</TableCell>
                            <TableCell>{result.keyDetails.durationDays} days</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Expires At</TableCell>
                            <TableCell>{formatDate(result.keyDetails.expiresAt)}</TableCell>
                          </TableRow>
                          {result.keyDetails.isUsed && (
                            <>
                              <TableRow>
                                <TableCell className="font-medium">Used By (Hash)</TableCell>
                                <TableCell>{result.keyDetails.usedBy || "N/A"}</TableCell>
                              </TableRow>
                              {result.keyDetails.userDetails && (
                                <>
                                  <TableRow>
                                    <TableCell className="font-medium">Used By (Username)</TableCell>
                                    <TableCell>{result.keyDetails.userDetails.name || "N/A"}</TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell className="font-medium">User Alias</TableCell>
                                    <TableCell>{result.keyDetails.userDetails.alias || "N/A"}</TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell className="font-medium">User Email</TableCell>
                                    <TableCell>{result.keyDetails.userDetails.email || "N/A"}</TableCell>
                                  </TableRow>
                                </>
                              )}
                              <TableRow>
                                <TableCell className="font-medium">Used At</TableCell>
                                <TableCell>{formatDate(result.keyDetails.usedAt)}</TableCell>
                              </TableRow>
                            </>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="user">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>User Subscription Lookup</CardTitle>
                <CardDescription>
                  Enter a username or email to view subscription details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
                  <Input
                    placeholder="Enter username or email (e.g., zkjnvoj6 or zkjnvoj6@t7.wtf)"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleUserLookup} 
                    disabled={isUserLoading || !userInput.trim()}
                  >
                    {isUserLoading ? (
                      "Searching..."
                    ) : (
                      <>
                        <User className="w-4 h-4 mr-2" />
                        Lookup User
                      </>
                    )}
                  </Button>
                </div>

                {userResult && !userResult.success && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{userResult.message}</AlertDescription>
                  </Alert>
                )}

                {userResult?.success && userResult.userSubscription && (
                  <div className="mt-6">
                    <Alert variant={userResult.userSubscription.exists ? "default" : "destructive"} className="mb-4">
                      <AlertTitle className="flex items-center">
                        {userResult.userSubscription.exists ? (
                          <>
                            <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                            User Found
                          </>
                        ) : (
                          <>
                            <XCircle className="w-5 h-5 mr-2 text-red-500" />
                            User Not Found
                          </>
                        )}
                      </AlertTitle>
                      <AlertDescription>
                        <div className="flex items-center mt-2">
                          <code className="font-mono bg-muted p-1 rounded">
                            {userResult.userSubscription.userDetails.alias || userResult.userSubscription.userDetails.name}
                          </code>
                        </div>
                      </AlertDescription>
                    </Alert>

                    <div className="rounded-md border mt-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-1/3">Property</TableHead>
                            <TableHead>Value</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">Username</TableCell>
                            <TableCell>{userResult.userSubscription.userDetails.name}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">User Alias</TableCell>
                            <TableCell>{userResult.userSubscription.userDetails.alias || "N/A"}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Email</TableCell>
                            <TableCell>{userResult.userSubscription.userDetails.email}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Subscription Duration</TableCell>
                            <TableCell>{userResult.userSubscription.subscriptionDays} days</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Expires At</TableCell>
                            <TableCell>{formatDate(userResult.userSubscription.expiresAt)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">License Key</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <code className="font-mono bg-muted p-1 rounded">{userResult.userSubscription.key}</code>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => userResult.userSubscription && copyToClipboard(userResult.userSubscription.key)}
                                  className="ml-2"
                                >
                                  <Copy className={`h-4 w-4 ${copied ? "text-green-500" : ""}`} />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Redeemed At</TableCell>
                            <TableCell>{formatDate(userResult.userSubscription.usedAt)}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
} 
