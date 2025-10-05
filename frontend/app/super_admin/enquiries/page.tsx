"use client";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { RootState, AppDispatch } from "@/app/store/Store";
import {
  fetchEnquiries,
  approveEnquiry,
  rejectEnquiry,
} from "@/app/features/super_admin/super_admin_enquiry/enquiryUpdateSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function AdminEnquiries() {
  const dispatch = useDispatch<AppDispatch>();
  const { enquiries, status, error } = useSelector(
    (state: RootState) => state.superAdmin
  );

  const [q, setQ] = useState("");

  useEffect(() => {
    dispatch(fetchEnquiries());
  }, [dispatch]);

  const filtered = useMemo(() => {
    return enquiries.filter(
      (e) =>
        e.shopname.toLowerCase().includes(q.toLowerCase()) ||
        e.ownername.toLowerCase().includes(q.toLowerCase())
    );
  }, [enquiries, q]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          Shop Enquiries
        </h1>
        <p className="text-muted-foreground mt-1">
          Review and approve new shop registration requests
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="flex-1">
          <Input
            placeholder="Search enquiries..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-11 rounded-xl"
          />
        </div>
      </div>

      {status === "loading" && (
        <p className="mt-4 text-muted-foreground">Loading enquiries…</p>
      )}
      {status === "failed" && <p className="mt-4 text-red-500">{error}</p>}

      {status === "succeeded" && (
        <div className="mt-4 overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60">
              <tr>
                <th className="text-left p-3">Shop</th>
                <th className="text-left p-3">Owner</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id} className="border-t">
                  <td className="p-3 font-medium">{e.shopname}</td>
                  <td className="p-3">{e.ownername}</td>
                  <td className="p-3">
                    {e.status === "pending" && (
                      <Badge variant="outline">Pending</Badge>
                    )}
                    {e.status === "approved" && (
                      <Badge className="bg-green-500">Approved</Badge>
                    )}
                    {e.status === "rejected" && (
                      <Badge variant="destructive">Rejected</Badge>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          dispatch(approveEnquiry(e.id))
                            .unwrap()
                            .then(() => {
                              toast.success("Enquiry approved successfully!", {
                                description: `${e.ownername} can now enjoy selling cakes and start their business on CakeHaven!`,
                              });
                            })
                            .catch((err) => {
                              toast.error("Failed to approve enquiry", {
                                description: err || "Something went wrong",
                              });
                            });
                        }}
                        disabled={e.status !== "pending"}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => dispatch(rejectEnquiry({ id: e.id }))}
                        disabled={e.status !== "pending"}
                      >
                        Reject
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    className="p-6 text-center text-muted-foreground"
                    colSpan={4}
                  >
                    No enquiries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
