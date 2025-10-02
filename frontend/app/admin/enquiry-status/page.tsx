"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/app/store/hook";
import { checkUserEnquiryStatus } from "@/app/features/shop_admin/enquiry/enquirySlice";
import { RootState } from "@/app/store/Store";
import { Button } from "@/components/ui/button";
import { Mail, Clock, CheckCircle } from "lucide-react";

export default function EnquiryStatusPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { userEnquiryStatus, checkingStatus } = useAppSelector(
    (state: RootState) => state.enquiry
  );

  useEffect(() => {
    // Check the current user's enquiry status
    dispatch(checkUserEnquiryStatus());
  }, [dispatch]);

  useEffect(() => {
    // Redirect based on enquiry status
    if (checkingStatus === "succeeded") {
      if (!userEnquiryStatus.hasEnquiry) {
        // No enquiry submitted, redirect to enquiry form
        router.push("/auth/enquiry");
      } else if (userEnquiryStatus.status === "approved") {
        // Enquiry approved, redirect to dashboard
        router.push("/admin/home");
      } else if (userEnquiryStatus.status === "rejected") {
        // Enquiry rejected, redirect to enquiry form to resubmit
        router.push("/auth/enquiry");
      }
      // If status is "pending", stay on this page
    }
  }, [checkingStatus, userEnquiryStatus, router]);

  if (checkingStatus === "loading") {
    return (
      <div className="container mx-auto py-12 md:py-16">
        <div className="mx-auto max-w-2xl rounded-2xl border bg-card p-6 shadow-sm">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Checking your enquiry status...</p>
          </div>
        </div>
      </div>
    );
  }

  if (checkingStatus === "failed") {
    return (
      <div className="container mx-auto py-12 md:py-16">
        <div className="mx-auto max-w-2xl rounded-2xl border bg-card p-6 shadow-sm">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <CheckCircle className="h-12 w-12 mx-auto mb-2" />
              <h1 className="text-xl font-bold">Something went wrong</h1>
              <p className="text-muted-foreground mt-2">
                Unable to check your enquiry status. Please try again.
              </p>
            </div>
            <Button onClick={() => dispatch(checkUserEnquiryStatus())}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show pending status message
  return (
    <div className="container mx-auto py-12 md:py-16">
      <div className="mx-auto max-w-2xl rounded-2xl border bg-card p-6 shadow-sm">
        <div className="text-center space-y-6">
          <div className="text-blue-500">
            <Clock className="h-16 w-16 mx-auto mb-4" />
          </div>
          
          <div>
            <h1 className="text-2xl font-extrabold mb-2">
              Welcome Back!
            </h1>
            <h2 className="text-xl font-semibold mb-4 text-blue-600">
              Your Request is Being Reviewed
            </h2>
            
            <div className="space-y-4 text-muted-foreground">
              <div className="flex items-center justify-center space-x-2">
                <Mail className="h-5 w-5" />
                <p className="text-lg">
                  We will send you an email once the admin accepts your request after reviewing
                </p>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800 mb-4">
                <p className="text-sm text-green-700 dark:text-green-300">
                  <strong>Thanks for checking back!</strong><br />
                  Your enquiry is still under review. We appreciate your patience.
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>What's next?</strong><br />
                  Our admin team is currently reviewing your shop registration request. 
                  You'll receive an email notification once a decision is made. This usually takes 1-2 business days.
                </p>
              </div>
            </div>
          </div>

          {userEnquiryStatus.enquiry && (
            <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="font-semibold mb-2">Your Submitted Details:</h3>
              <div className="text-sm text-left space-y-1">
                <p><strong>Shop Name:</strong> {userEnquiryStatus.enquiry.shopname}</p>
                <p><strong>Owner Name:</strong> {userEnquiryStatus.enquiry.ownername}</p>
                <p><strong>Email:</strong> {userEnquiryStatus.enquiry.email}</p>
                <p><strong>City:</strong> {userEnquiryStatus.enquiry.city}</p>
              </div>
            </div>
          )}
          
          <div className="pt-4">
            <Button 
              variant="outline" 
              onClick={() => router.push("/auth/signin")}
            >
              Back to Login
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}