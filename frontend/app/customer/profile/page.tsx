"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/store/Store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  createCustomer,
  getMyCustomer,
  updateMyCustomer,
  CustomerUpdateData,
} from "@/app/features/users/userApi";
import { sendEmailVerificationAPI } from "@/app/api/authApi";
import { Mail, CheckCircle, AlertCircle, Clock } from "lucide-react";

export default function CustomerProfile() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token, role, loading } = useSelector(
    (state: RootState) => state.auth
  );

  const [customerId, setCustomerId] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [profileExists, setProfileExists] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token || role !== "customer") return;

      try {
        setIsLoading(true);
        const res = await dispatch(getMyCustomer()).unwrap();

        if (res) {
          const c = res;
          console.log("Customer:", c);

          setCustomerId(c.id);
          setFullName(c.full_name || "");
          setPhone(c.phone || "");
          setAddress(c.address || "");
          setEmailVerified(c.email_verified || false);
          setProfileExists(true);
          setIsEditMode(false);
        }
      } catch (err) {
        console.log("Error fetching profile:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [dispatch, token, role]);

  // ✅ Handle Save (create or update)
  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !phone || !address) {
      toast.error("Please fill in all required fields");
      return;
    }

    // ✅ Email comes from auth, never from form
    const payload: CustomerUpdateData = {
      full_name: fullName,
      phone,
      address,
    };

    console.log("👉 Sending payload:", payload);

    try {
      setIsLoading(true);
      if (customerId) {
        await dispatch(updateMyCustomer(payload)).unwrap();
        toast.success("Profile updated successfully");
        setIsEditMode(false);
      } else {
        // For creation, we need to include email from auth
        const createPayload = {
          ...payload,
          email: user,
        };
        await dispatch(createCustomer(createPayload)).unwrap();
        toast.success("Profile created successfully");
        setProfileExists(true);
        setIsEditMode(false);
      }
    } catch (err: any) {
      console.error("Error saving profile:", err);
      toast.error(err?.message || "Failed to save profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleCancel = () => {
    setIsEditMode(false);
    // Reset form to current values
    if (profileExists) {
      // Values are already set from the API call
    }
  };

  const handleSendVerification = async () => {
    try {
      setIsSendingVerification(true);
      await sendEmailVerificationAPI(user);
      toast.success("Verification email sent! Please check your inbox.");
    } catch (error: any) {
      toast.error(error.message || "Failed to send verification email");
    } finally {
      setIsSendingVerification(false);
    }
  };

  if (loading || isLoading) return <p>Loading profile...</p>;
  if (!user) return <p>Please log in to view your profile.</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Email Verification Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Information
          </CardTitle>
          <CardDescription>
            Your account email and verification status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
            <div>
              <div className="font-medium text-sm text-muted-foreground">Email Address</div>
              <div className="font-semibold">{user}</div>
            </div>
            <Badge variant={emailVerified ? "default" : "secondary"} className="flex items-center gap-1">
              {emailVerified ? (
                <>
                  <CheckCircle className="w-3 h-3" />
                  Verified
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3" />
                  Not Verified
                </>
              )}
            </Badge>
          </div>
          
          {!emailVerified && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
              <Clock className="w-4 h-4 text-amber-600" />
              <div className="flex-1">
                <p className="text-sm text-amber-800">
                  Verify your email to secure your account and receive important notifications.
                </p>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleSendVerification}
                disabled={isSendingVerification}
              >
                {isSendingVerification ? "Sending..." : "Send Verification"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Manage your personal information and delivery address.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!profileExists || isEditMode ? (
            <form onSubmit={onSave} className="grid gap-5">
              <div className="grid gap-1">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-12 rounded-lg border-gray-300"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="grid gap-1">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-12 rounded-lg border-gray-300"
                  placeholder="Enter your phone number"
                  required
                />
              </div>

              <div className="grid gap-1">
                <Label htmlFor="address">Address</Label>
                <textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="min-h-[100px] rounded-lg border bg-gray-50 px-3 py-2 text-sm"
                  placeholder="Enter your delivery address"
                  required
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  className="h-12 px-6 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : (customerId ? "Update Profile" : "Create Profile")}
                </Button>
                {profileExists && (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 px-6 rounded-lg"
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Display Mode */}
              <div className="grid gap-4">
                <div className="p-4 rounded-lg border bg-gray-50">
                  <div className="font-medium text-sm text-gray-600 mb-1">Full Name</div>
                  <div className="font-semibold text-lg">{fullName || "Not provided"}</div>
                </div>
                
                <div className="p-4 rounded-lg border bg-gray-50">
                  <div className="font-medium text-sm text-gray-600 mb-1">Phone Number</div>
                  <div className="font-semibold text-lg">{phone || "Not provided"}</div>
                </div>
                
                <div className="p-4 rounded-lg border bg-gray-50">
                  <div className="font-medium text-sm text-gray-600 mb-1">Delivery Address</div>
                  <div className="font-semibold text-lg whitespace-pre-wrap">{address || "Not provided"}</div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button
                  onClick={handleEdit}
                  className="h-12 px-6 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  Update Profile
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
