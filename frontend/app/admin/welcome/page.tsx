"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle, Cake, ArrowRight } from "lucide-react";
import { useEffect } from "react";

export default function WelcomePage() {
  const router = useRouter();

  useEffect(() => {
    // Auto redirect to dashboard after 5 seconds
    const timer = setTimeout(() => {
      router.push("/admin/home");
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="container mx-auto py-12 md:py-16">
      <div className="mx-auto max-w-2xl rounded-2xl border bg-card p-6 shadow-sm">
        <div className="text-center space-y-6">
          <div className="text-green-500">
            <CheckCircle className="h-16 w-16 mx-auto mb-4" />
          </div>
          
          <div>
            <h1 className="text-3xl font-extrabold mb-4 text-green-600">
              🎉 Congratulations!
            </h1>
            
            <div className="space-y-4">
              <p className="text-xl font-semibold">
                Your shop registration has been approved!
              </p>
              
              <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <Cake className="h-8 w-8 text-green-600" />
                  <p className="text-lg font-semibold text-green-700 dark:text-green-300">
                    You can enjoy selling cakes now! Login and start your business
                  </p>
                </div>
                
                <div className="text-sm text-green-700 dark:text-green-300 space-y-2">
                  <p>✅ Your shop is now active on CakeHaven</p>
                  <p>✅ You can start adding your cake products</p>
                  <p>✅ Customers can now discover and order from your shop</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={() => router.push("/admin/home")}
              className="w-full h-12 text-lg"
              size="lg"
            >
              <ArrowRight className="h-5 w-5 mr-2" />
              Go to Dashboard
            </Button>
            
            <p className="text-sm text-muted-foreground">
              You'll be automatically redirected in a few seconds...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}