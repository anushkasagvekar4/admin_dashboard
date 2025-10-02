"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle, Mail, Clock, ArrowRight } from "lucide-react";

export default function ThankYouPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto py-12 md:py-16">
      <div className="mx-auto max-w-2xl rounded-2xl border bg-card p-8 shadow-sm text-center">
        <div className="text-green-500 mb-6">
          <CheckCircle className="h-20 w-20 mx-auto mb-4" />
        </div>
        
        <h1 className="text-3xl font-extrabold mb-4 text-green-600">
          Thank You!
        </h1>
        
        <h2 className="text-xl font-semibold mb-6 text-muted-foreground">
          Your shop enquiry has been submitted successfully
        </h2>
        
        <div className="space-y-6 text-left">
          <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-start space-x-3">
              <Mail className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-green-700 dark:text-green-300 mb-2">
                  What happens next?
                </h3>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Our admin team will review your shop registration request within 1-2 business days. 
                  You'll receive an email notification once a decision is made.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start space-x-3">
              <Clock className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
                  Check Your Status
                </h3>
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">
                  You can check the status of your enquiry anytime by logging into your account.
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push("/admin/enquiry-status")}
                  className="text-blue-600 border-blue-300 hover:bg-blue-50"
                >
                  Check Status <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
            <h3 className="font-semibold mb-3">Important Notes:</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Keep your email accessible for important updates</li>
              <li>• Make sure your shop information is accurate</li>
              <li>• If approved, you'll receive login credentials via email</li>
              <li>• For any questions, contact our support team</li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 space-x-4">
          <Button 
            variant="default"
            onClick={() => router.push("/admin/enquiry-status")}
          >
            Check Status
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => router.push("/")}
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}