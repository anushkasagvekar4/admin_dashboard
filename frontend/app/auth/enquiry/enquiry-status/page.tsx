"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { checkUserEnquiryStatusAPI } from "@/app/features/shop_admin/enquiry/enquiryApi";

type EnquiryStatus = "pending" | "approved" | "rejected" | "none";

export default function EnquiryStatusPage() {
  const [status, setStatus] = useState<EnquiryStatus>("none");
  const [reason, setReason] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  /**
   * 🟢 Fetch enquiry status on load
   */
  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await checkUserEnquiryStatusAPI();
      const data = res.data;

      if (!data?.hasEnquiry) {
        router.push("/auth/enquiry");
      } else {
        setStatus(data.status);
        setReason(data.enquiry?.reason);
      }
    } catch (err) {
      console.error("❌ Failed to fetch enquiry status:", err);
      router.push("/auth/enquiry");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();

    // 🔄 Auto-refresh every 60 seconds (optional)
    const interval = setInterval(fetchStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  /**
   * ✅ Auto-redirect on approval
   */
  useEffect(() => {
    if (status === "approved") {
      setTimeout(() => router.push("/admin/home"), 2000);
    }
  }, [status, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Checking your enquiry status...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center">
      {status === "pending" && (
        <>
          <Clock className="h-16 w-16 text-yellow-500 mb-4" />
          <h1 className="text-3xl font-bold mb-3">
            Your enquiry is under review
          </h1>
          <p className="text-muted-foreground max-w-md mb-6">
            We’re reviewing your request to open a shop on CakeHaven. You’ll
            receive an email once it’s approved or rejected.
          </p>
          <Button onClick={fetchStatus} variant="outline">
            Refresh Status
          </Button>
        </>
      )}

      {status === "approved" && (
        <>
          <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
          <h1 className="text-3xl font-bold mb-3">
            🎉 Your Shop Has Been Approved!
          </h1>
          <p className="text-muted-foreground max-w-md mb-6">
            Redirecting you to your dashboard...
          </p>
        </>
      )}

      {status === "rejected" && (
        <>
          <XCircle className="h-16 w-16 text-red-500 mb-4" />
          <h1 className="text-3xl font-bold mb-3">Your enquiry was rejected</h1>
          {reason && (
            <p className="text-sm text-red-600 mb-3">
              <strong>Reason:</strong> {reason}
            </p>
          )}
          <p className="text-muted-foreground max-w-md mb-6">
            You can review your details and resubmit your enquiry for
            consideration.
          </p>
          <Button onClick={() => router.push("/auth/enquiry")}>
            Resubmit Enquiry
          </Button>
        </>
      )}
    </div>
  );
}
