"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTicket } from "@/lib/api/ticket";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

/* ===== Static Data ===== */

const accommodationLocations = [
  "GCFO Quarters – Irewolede Estate",
  "New House – Irewolede Estate",
  "GRA Quarters – Trove Street, Flower Garden, GRA",
  "Honourable Qtrs 1 – Legislative Qtrs Estate",
  "Honourable Qtrs 2 – Legislative Qtrs Estate",
  "Yellow House – Mandate III Estate",
  "Ghosh House – Mandate III Estate",
  "Jaspal House – Mandate III Estate",
  "Ofa Garage",
];

const accommodationIssues = [
  "Generator",
  "Water/Plumbing",
  "Electrical",
  "Furniture",
  "Environment",
  "Others",
];

const categories: Record<string, string[]> = {
  "Office Issue": [
    "Water/Plumbing",
    "Electrical",
    "Furniture",
    "Cleaning",
    "Others",
  ],
  "Vehicle Issue": [
    "Maintenance",
    "Battery",
    "Mechanical",
    "Accident",
    "Tyre",
    "Registration",
    "Others",
  ],
};

const departments = [
  "HR",
  "Audit",
  "Supply Chain",
  "Admin",
  "Production",
  "Finance",
  "Maintenance",
  "IT",
];

const staffLocations = [
  "KAM HQ",
  "KSICL – Jimba",
  "KSICL – Sagamu",
  "KAM Haulage",
  "Dimkit Ganmo",
  "Dimkit Kaduna",
  "Lagos Office",
];

export default function CreateTicketPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    staffLocation: "",
    department: "",
    category: "",
    accLocation: "",
    accIssue: "",
    subcategory: "",
    title: "",
    details: "",
    date: "",
    image: null as File | null,
  });

  /* ===== Submit ===== */

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const payload = new FormData();

    payload.append("fullName", form.fullName);
    payload.append("email", form.email);
    payload.append("phone", form.phone);

    payload.append(
      "location",
      form.category === "Accommodation/Housing Issues"
        ? form.accLocation
        : form.staffLocation
    );

    payload.append("department", form.department);
    payload.append("category", form.category);

    payload.append(
      "subCategory",
      form.category === "Accommodation/Housing Issues"
        ? form.accIssue
        : form.subcategory
    );

    payload.append("title", form.title);
    payload.append("description", form.details);

    if (form.image) {
      payload.append("image", form.image);
    }

    await createTicket(payload);
    router.push("/dashboard");
  } catch (err: unknown) { 
        if (err instanceof Error) {
      setError(err.message);
    }   
    else{
        setError("An unexpected error occurred");
    }
    //error : Unexpected any. Specify a different type.
    // setError(err.message);
  } finally {
    setLoading(false);
  }
};

  /* ===== UI ===== */

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Raise Support Ticket</CardTitle>
          <CardDescription>
            Fill in the details below to submit a complaint
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Full Name */}
            <div>
              <Label>Full Name</Label>
              <Input
                value={form.fullName}
                onChange={(e) =>
                  setForm({ ...form, fullName: e.target.value })
                }
                required
              />
            </div>

            {/* Email */}
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                required
              />
            </div>

            {/* Phone */}
            <div>
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value })
                }
                required
              />
            </div>

            {/* Staff Location */}
            <div>
              <Label>Staff Location</Label>
              <Select
                value={form.staffLocation}
                onValueChange={(v) =>
                  setForm({ ...form, staffLocation: v })
                }
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {staffLocations.map((l) => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Department */}
            <div>
              <Label>Department</Label>
              <Select
                value={form.department}
                onValueChange={(v) =>
                  setForm({ ...form, department: v })
                }
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            <div>
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) =>
                  setForm({
                    ...form,
                    category: v,
                    subcategory: "",
                    accIssue: "",
                    accLocation: "",
                  })
                }
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Accommodation/Housing Issues">
                    Accommodation / Housing Issues
                  </SelectItem>
                  {Object.keys(categories).map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Accommodation */}
            {form.category === "Accommodation/Housing Issues" && (
              <>
                <div>
                  <Label>Accommodation Location</Label>
                  <Select
                    value={form.accLocation}
                    onValueChange={(v) =>
                      setForm({ ...form, accLocation: v })
                    }
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {accommodationLocations.map((l) => (
                        <SelectItem key={l} value={l}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Accommodation Issue</Label>
                  <Select
                    value={form.accIssue}
                    onValueChange={(v) =>
                      setForm({ ...form, accIssue: v })
                    }
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {accommodationIssues.map((i) => (
                        <SelectItem key={i} value={i}>{i}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Subcategory */}
            {form.category &&
              form.category !== "Accommodation/Housing Issues" && (
                <div>
                  <Label>Subcategory</Label>
                  <Select
                    value={form.subcategory}
                    onValueChange={(v) =>
                      setForm({ ...form, subcategory: v })
                    }
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {categories[form.category]?.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

            {/* Title */}
            <div>
              <Label>Complaint Title</Label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
                required
              />
            </div>

            {/* Details */}
            <div>
              <Label>Description</Label>
              <Textarea
                value={form.details}
                onChange={(e) =>
                  setForm({ ...form, details: e.target.value })
                }
                rows={4}
                required
              />
            </div>

            {/* Date */}
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm({ ...form, date: e.target.value })
                }
                required
              />
            </div>

            {/* Image */}
            <div>
              <Label>Attach Image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setForm({
                    ...form,
                    image: e.target.files?.[0] || null,
                  })
                }
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Submitting..." : "Submit Ticket"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
