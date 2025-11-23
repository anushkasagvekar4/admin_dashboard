"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { verifyEmailAPI } from "@/app/api/authApi";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link. No token provided.");
      return;
    }

    const verifyEmail = async () => {
      try {
        await verifyEmailAPI(token);
        setStatus("success");
        setMessage("Your email has been successfully verified! You can now log in to your account.");
      } catch (error: any) {
        setStatus("error");
        setMessage(error.message || "Failed to verify email. The link may have expired or is invalid.");
      }
    };

    verifyEmail();
  }, [searchParams]);

  const handleGoToLogin = () => {
    router.push("/auth/signin");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Mail className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Email Verification
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {status === "loading" && "Verifying your email address..."}
            {status === "success" && "Email verified successfully!"}
            {status === "error" && "Verification failed"}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              {status === "loading" && <Loader2 className="w-5 h-5 animate-spin" />}
              {status === "success" && <CheckCircle className="w-5 h-5 text-green-600" />}
              {status === "error" && <XCircle className="w-5 h-5 text-red-600" />}
              Verification Status
            </CardTitle>
            <CardDescription>
              {status === "loading" && "Please wait while we verify your email address."}
              {status === "success" && "Your email has been verified. You can now access your account."}
              {status === "error" && "We couldn't verify your email. Please try again or contact support."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={`p-4 rounded-lg text-sm ${
              status === "success" 
                ? "bg-green-50 text-green-800 border border-green-200" 
                : status === "error"
                ? "bg-red-50 text-red-800 border border-red-200"
                : "bg-blue-50 text-blue-800 border border-blue-200"
            }`}>
              {status === "loading" && (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing verification...</span>
                </div>
              )}
              {status === "success" && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>{message}</span>
                </div>
              )}
              {status === "error" && (
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  <span>{message}</span>
                </div>
              )}
            </div>

            {status !== "loading" && (
              <div className="flex flex-col gap-3">
                {status === "success" && (
                  <Button 
                    onClick={handleGoToLogin}
                    className="w-full"
                  >
                    Go to Login
                  </Button>
                )}
                
                {status === "error" && (
                  <div className="space-y-3">
                    <Button 
                      onClick={() => window.location.reload()}
                      variant="outline"
                      className="w-full"
                    >
                      Try Again
                    </Button>
                    <Button 
                      onClick={handleGoToLogin}
                      variant="secondary"
                      className="w-full"
                    >
                      Back to Login
                    </Button>
                  </div>
                )}
              </div>
            )}

            {status === "error" && (
              <div className="text-center text-xs text-gray-500">
                <p>If the problem persists, please:</p>
                <ul className="mt-2 space-y-1">
                  <li>• Check if the verification link has expired (24 hours)</li>
                  <li>• Request a new verification email from your profile</li>
                  <li>• Contact support if you continue to have issues</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
