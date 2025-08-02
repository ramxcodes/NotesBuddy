import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PremiumTier,
  University,
  Degree,
  Year,
  Semester,
  PaymentStatus,
  PaymentMethod,
} from "@prisma/client";
import { MagnifyingGlass, UserPlus, User, Eye } from "@phosphor-icons/react";
import {
  searchUsersAction,
  getUserDetailsAction,
  createFullPremiumPurchaseAction,
  updatePremiumPurchaseAction,
  deletePremiumPurchaseAction,
  type CreatePremiumPurchaseParams,
  type UpdatePremiumPurchaseParams,
} from "@/components/admin/actions/admin-premium";
import { toast } from "sonner";
import Image from "next/image";
import UserDetailsView from "./UserDetailsView";

export interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
  isPremiumActive: boolean;
  currentPremiumTier: PremiumTier | null;
  premiumExpiryDate: Date | null;
  profile: {
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string | null;
    university: University | null;
    degree: Degree | null;
    year: Year | null;
    semester: Semester | null;
  } | null;
  premiumPurchases: Array<{
    id: string;
    tier: PremiumTier;
    finalAmount: string;
    expiryDate: Date;
    createdAt: Date;
    university: University;
    degree: Degree;
    year: Year;
    semester: Semester;
    paymentMethod: string | null;
    razorpayOrderId: string | null;
  }>;
}

export interface DetailedUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  isPremiumActive: boolean;
  currentPremiumTier: PremiumTier | null;
  premiumExpiryDate: Date | null;
  createdAt: Date;
  profile: {
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string | null;
    university: University | null;
    degree: Degree | null;
    year: Year | null;
    semester: Semester | null;
    createdAt: Date | null;
  } | null;
  premiumPurchases: Array<{
    id: string;
    tier: PremiumTier;
    duration: number;
    originalAmount: string;
    discountAmount: string;
    finalAmount: string;
    currency: string;
    paymentStatus: string;
    paymentMethod: string | null;
    razorpayOrderId: string | null;
    razorpayPaymentId: string | null;
    discountCode: string | null;
    referralCode: string | null;
    university: University;
    degree: Degree;
    year: Year;
    semester: Semester;
    purchaseDate: Date;
    expiryDate: Date;
    isActive: boolean;
    webhookProcessed: boolean;
    failureReason: string | null;
    createdAt: Date;
    discounts: Array<{
      discountType: string;
      discountCode: string | null;
      discountValue: string;
      discountAmount: string;
      description: string | null;
    }>;
  }>;
  referrerRewards: Array<{
    rewardAmount: string;
    rewardType: string;
    isProcessed: boolean;
    createdAt: Date;
    purchase: {
      tier: PremiumTier;
      finalAmount: string;
    };
  }>;
}

interface AdminPremiumGrantFormProps {
  onSuccess: () => void;
}

export function AdminPremiumGrantForm({
  onSuccess,
}: AdminPremiumGrantFormProps) {
  const [activeTab, setActiveTab] = useState("grant");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<DetailedUser | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGranting, setIsGranting] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<
    DetailedUser["premiumPurchases"][0] | null
  >(null);
  const [editFormData, setEditFormData] =
    useState<UpdatePremiumPurchaseParams | null>(null);

  // Comprehensive form fields for premium purchase
  const [formData, setFormData] = useState<CreatePremiumPurchaseParams>({
    userId: "",
    // Razorpay fields
    razorpayOrderId: "",
    razorpayPaymentId: "",
    razorpaySignature: "",

    // Purchase details
    tier: "TIER_1" as PremiumTier,
    duration: 180, // 6 months default
    originalAmount: "0",
    discountAmount: "0",
    finalAmount: "0",
    currency: "INR",

    // Payment details
    paymentStatus: "CAPTURED" as PaymentStatus,
    paymentMethod: undefined,
    razorpayFee: "",
    razorpayTax: "",

    // Discount & Referral
    discountCode: "",
    referralCode: "",
    referredByUserId: "",

    // Academic details
    university: "MEDICAPS" as University,
    degree: "BTECH_CSE" as Degree,
    year: "FIRST_YEAR" as Year,
    semester: "FIRST_SEMESTER" as Semester,

    // Timestamps
    purchaseDate: new Date(),
    expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months from now
    isActive: true,

    // Processing
    webhookProcessed: true,
    failureReason: "",

    // Admin notes
    adminNotes: "",
  });

  // Update form data when selected user changes
  React.useEffect(() => {
    if (selectedUser) {
      setFormData((prev) => ({
        ...prev,
        userId: selectedUser.id,
        university: selectedUser.profile?.university || "MEDICAPS",
        degree: selectedUser.profile?.degree || "BTECH_CSE",
        year: selectedUser.profile?.year || "FIRST_YEAR",
        semester: selectedUser.profile?.semester || "FIRST_SEMESTER",
      }));
    }
  }, [selectedUser]);

  const updateFormField = (
    field: keyof CreatePremiumPurchaseParams,
    value:
      | string
      | number
      | boolean
      | Date
      | PremiumTier
      | PaymentStatus
      | PaymentMethod
      | University
      | Degree
      | Year
      | Semester,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDeletePurchase = async (purchaseId: string) => {
    if (!confirm("Are you sure you want to delete this premium purchase?")) {
      return;
    }

    try {
      const result = await deletePremiumPurchaseAction(purchaseId);
      if (result.success) {
        toast.success("Premium purchase deleted successfully");
        if (selectedUser) {
          await loadUserDetails(selectedUser.id);
        }
      } else {
        toast.error(result.error || "Failed to delete premium purchase");
      }
    } catch (error) {
      console.error("Error deleting premium purchase:", error);
      toast.error("Failed to delete premium purchase");
    }
  };

  const handleEditPurchase = async (
    updatedData: UpdatePremiumPurchaseParams,
  ) => {
    try {
      const result = await updatePremiumPurchaseAction(updatedData);
      if (result.success) {
        toast.success("Premium purchase updated successfully");
        setEditingPurchase(null);
        setEditFormData(null);
        if (selectedUser) {
          await loadUserDetails(selectedUser.id);
        }
      } else {
        toast.error(result.error || "Failed to update premium purchase");
      }
    } catch (error) {
      console.error("Error updating premium purchase:", error);
      toast.error("Failed to update premium purchase");
    }
  };

  const openEditModal = (purchase: DetailedUser["premiumPurchases"][0]) => {
    setEditingPurchase(purchase);
    setEditFormData({
      purchaseId: purchase.id,
      userId: selectedUser?.id || "",
      razorpayOrderId: purchase.razorpayOrderId || "",
      razorpayPaymentId: purchase.razorpayPaymentId || "",
      razorpaySignature: "",
      tier: purchase.tier,
      duration: purchase.duration,
      originalAmount: purchase.originalAmount,
      discountAmount: purchase.discountAmount,
      finalAmount: purchase.finalAmount,
      currency: purchase.currency,
      paymentStatus: purchase.paymentStatus as PaymentStatus,
      paymentMethod: purchase.paymentMethod as PaymentMethod,
      razorpayFee: "",
      razorpayTax: "",
      discountCode: purchase.discountCode || "",
      referralCode: purchase.referralCode || "",
      referredByUserId: "",
      university: purchase.university,
      degree: purchase.degree,
      year: purchase.year,
      semester: purchase.semester,
      purchaseDate: new Date(purchase.purchaseDate),
      expiryDate: new Date(purchase.expiryDate),
      isActive: purchase.isActive,
      webhookProcessed: purchase.webhookProcessed,
      failureReason: purchase.failureReason || "",
      adminNotes: "",
    });
  };

  const updateEditFormField = (
    field: keyof UpdatePremiumPurchaseParams,
    value:
      | string
      | number
      | boolean
      | Date
      | PremiumTier
      | PaymentStatus
      | PaymentMethod
      | University
      | Degree
      | Year
      | Semester,
  ) => {
    if (editFormData) {
      setEditFormData((prev) => (prev ? { ...prev, [field]: value } : null));
    }
  };

  const handleSaveEdit = async () => {
    if (!editFormData) return;

    await handleEditPurchase(editFormData);
  };

  const searchUsers = async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const result = await searchUsersAction(query);
      if (Array.isArray(result)) {
        // Data is already transformed on the server side
        setSearchResults(result as User[]);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error searching users:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleUserSelect = async (user: User) => {
    setSelectedUser(user);
    setUserSearch(user.email);
    setSearchResults([]);

    // Load detailed user information
    if (activeTab === "details") {
      await loadUserDetails(user.id);
    }
  };

  const loadUserDetails = async (userId: string) => {
    setIsLoadingDetails(true);
    try {
      const details = await getUserDetailsAction(userId);
      if (details) {
        setUserDetails(details as DetailedUser);
      } else {
        setUserDetails(null);
      }
    } catch {
      toast.error("Failed to load user details");
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleTabChange = async (tab: string) => {
    setActiveTab(tab);
    if (tab === "details" && selectedUser && !userDetails) {
      await loadUserDetails(selectedUser.id);
    }
  };

  const handleGrantPremium = async () => {
    if (!selectedUser) {
      toast.error("Please select a user");
      return;
    }

    if (!formData.finalAmount || parseFloat(formData.finalAmount) <= 0) {
      toast.error("Please enter a valid final amount");
      return;
    }

    setIsGranting(true);
    try {
      const result = await createFullPremiumPurchaseAction({
        ...formData,
        userId: selectedUser.id,
      });

      if (result.success) {
        toast.success(
          `Premium ${formData.tier.replace("_", " ")} granted to ${selectedUser.name}`,
        );
        // Reset form
        setSelectedUser(null);
        setUserSearch("");
        setFormData((prev) => ({
          ...prev,
          userId: "",
          originalAmount: "0",
          discountAmount: "0",
          finalAmount: "0",
          adminNotes: "",
        }));
        onSuccess();
      } else {
        toast.error(result.error || "Failed to grant premium");
      }
    } catch (error) {
      console.error("Error granting premium:", error);
      toast.error("Failed to grant premium");
    } finally {
      setIsGranting(false);
    }
  };

  return (
    <>
      <Card className="neuro">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-black">
            <UserPlus className="h-5 w-5" />
            Premium Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="space-y-4"
          >
            <TabsList className="neuro flex items-center justify-between gap-4">
              <TabsTrigger value="grant">Grant Premium</TabsTrigger>
              <TabsTrigger value="details" disabled={!selectedUser}>
                User Details
              </TabsTrigger>
              <TabsTrigger
                value="edit"
                disabled={!userDetails?.premiumPurchases?.length}
              >
                Edit Premium
              </TabsTrigger>
            </TabsList>

            <TabsContent value="grant" className="space-y-6">
              {/* User Search */}
              <div className="space-y-2">
                <Label htmlFor="user-search" className="font-bold">
                  Search User
                </Label>
                <div className="relative">
                  <MagnifyingGlass className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input
                    id="user-search"
                    placeholder="Search by name, email, or phone..."
                    value={userSearch}
                    onChange={(e) => {
                      setUserSearch(e.target.value);
                      searchUsers(e.target.value);
                      if (!e.target.value) {
                        setSelectedUser(null);
                      }
                    }}
                    className="neuro-sm pl-10"
                  />
                  {isSearching && (
                    <div className="border-primary absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-r-transparent" />
                  )}
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="neuro-sm max-h-60 overflow-y-auto rounded-lg border">
                    {searchResults.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => handleUserSelect(user)}
                        className="hover:bg-muted/50 flex w-full items-center gap-3 p-3 text-left"
                      >
                        {user.image ? (
                          <Image
                            src={user.image}
                            alt={user.name}
                            width={32}
                            height={32}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-full">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="font-semibold">{user.name}</div>
                          <div className="text-muted-foreground text-sm">
                            {user.email}
                          </div>
                          {user.profile && (
                            <div className="text-muted-foreground text-xs">
                              {user.profile.phoneNumber} •{" "}
                              {user.profile.university}
                            </div>
                          )}
                          {user.isPremiumActive && (
                            <div className="text-xs text-amber-600">
                              Current:{" "}
                              {user.currentPremiumTier?.replace("_", " ")}
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected User */}
              {selectedUser && (
                <div className="neuro-sm rounded-lg p-4">
                  <h3 className="mb-2 text-sm font-bold">Selected User:</h3>
                  <div className="flex items-center gap-3">
                    {selectedUser.image ? (
                      <Image
                        src={selectedUser.image}
                        alt={selectedUser.name}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full">
                        {selectedUser.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="font-semibold">{selectedUser.name}</div>
                      <div className="text-muted-foreground text-sm">
                        {selectedUser.email}
                      </div>
                      {selectedUser.profile && (
                        <div className="text-muted-foreground text-xs">
                          {selectedUser.profile.phoneNumber} •{" "}
                          {selectedUser.profile.university}
                        </div>
                      )}
                      {selectedUser.isPremiumActive && (
                        <div className="text-xs text-amber-600">
                          Currently has:{" "}
                          {selectedUser.currentPremiumTier?.replace("_", " ")}
                          {selectedUser.premiumExpiryDate && (
                            <span className="ml-2">
                              (Expires:{" "}
                              {new Date(
                                selectedUser.premiumExpiryDate,
                              ).toLocaleDateString()}
                              )
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTabChange("details")}
                      className="neuro-sm"
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      View Details
                    </Button>
                  </div>
                </div>
              )}

              {/* Comprehensive Premium Purchase Form */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Basic Purchase Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold">Purchase Details</h3>

                  {/* Premium Tier */}
                  <div className="space-y-2">
                    <Label htmlFor="tier-select" className="font-bold">
                      Premium Tier
                    </Label>
                    <Select
                      value={formData.tier}
                      onValueChange={(value: PremiumTier) =>
                        updateFormField("tier", value)
                      }
                    >
                      <SelectTrigger id="tier-select" className="neuro-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TIER_1">Tier 1 - Basic</SelectItem>
                        <SelectItem value="TIER_2">Tier 2 - Premium</SelectItem>
                        <SelectItem value="TIER_3">Tier 3 - Pro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Duration */}
                  <div className="space-y-2">
                    <Label htmlFor="duration" className="font-bold">
                      Duration (days)
                    </Label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.duration}
                      onChange={(e) =>
                        updateFormField(
                          "duration",
                          parseInt(e.target.value) || 0,
                        )
                      }
                      min="1"
                      className="neuro-sm"
                    />
                  </div>

                  {/* Amounts */}
                  <div className="space-y-2">
                    <Label htmlFor="originalAmount" className="font-bold">
                      Original Amount
                    </Label>
                    <Input
                      id="originalAmount"
                      type="text"
                      value={formData.originalAmount}
                      onChange={(e) =>
                        updateFormField("originalAmount", e.target.value)
                      }
                      placeholder="0.00"
                      className="neuro-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discountAmount" className="font-bold">
                      Discount Amount
                    </Label>
                    <Input
                      id="discountAmount"
                      type="text"
                      value={formData.discountAmount}
                      onChange={(e) =>
                        updateFormField("discountAmount", e.target.value)
                      }
                      placeholder="0.00"
                      className="neuro-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="finalAmount" className="font-bold">
                      Final Amount *
                    </Label>
                    <Input
                      id="finalAmount"
                      type="text"
                      value={formData.finalAmount}
                      onChange={(e) =>
                        updateFormField("finalAmount", e.target.value)
                      }
                      placeholder="0.00"
                      className="neuro-sm"
                      required
                    />
                  </div>

                  {/* Currency */}
                  <div className="space-y-2">
                    <Label htmlFor="currency" className="font-bold">
                      Currency
                    </Label>
                    <Input
                      id="currency"
                      type="text"
                      value={formData.currency}
                      onChange={(e) =>
                        updateFormField("currency", e.target.value)
                      }
                      placeholder="INR"
                      className="neuro-sm"
                    />
                  </div>
                </div>

                {/* Payment & Processing Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold">Payment & Processing</h3>

                  {/* Payment Status */}
                  <div className="space-y-2">
                    <Label htmlFor="paymentStatus" className="font-bold">
                      Payment Status
                    </Label>
                    <Select
                      value={formData.paymentStatus}
                      onValueChange={(value: PaymentStatus) =>
                        updateFormField("paymentStatus", value)
                      }
                    >
                      <SelectTrigger id="paymentStatus" className="neuro-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="AUTHORIZED">Authorized</SelectItem>
                        <SelectItem value="CAPTURED">Captured</SelectItem>
                        <SelectItem value="FAILED">Failed</SelectItem>
                        <SelectItem value="REFUNDED">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod" className="font-bold">
                      Payment Method
                    </Label>
                    <Select
                      value={formData.paymentMethod || ""}
                      onValueChange={(value: PaymentMethod) =>
                        updateFormField("paymentMethod", value)
                      }
                    >
                      <SelectTrigger id="paymentMethod" className="neuro-sm">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CARD">Card</SelectItem>
                        <SelectItem value="UPI">UPI</SelectItem>
                        <SelectItem value="NETBANKING">Net Banking</SelectItem>
                        <SelectItem value="WALLET">Wallet</SelectItem>
                        <SelectItem value="EMI">EMI</SelectItem>
                        <SelectItem value="PAYLATER">Pay Later</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Razorpay Order ID */}
                  <div className="space-y-2">
                    <Label htmlFor="razorpayOrderId" className="font-bold">
                      Razorpay Order ID
                    </Label>
                    <Input
                      id="razorpayOrderId"
                      type="text"
                      value={formData.razorpayOrderId}
                      onChange={(e) =>
                        updateFormField("razorpayOrderId", e.target.value)
                      }
                      placeholder="order_xxx"
                      className="neuro-sm"
                    />
                  </div>

                  {/* Razorpay Payment ID */}
                  <div className="space-y-2">
                    <Label htmlFor="razorpayPaymentId" className="font-bold">
                      Razorpay Payment ID
                    </Label>
                    <Input
                      id="razorpayPaymentId"
                      type="text"
                      value={formData.razorpayPaymentId}
                      onChange={(e) =>
                        updateFormField("razorpayPaymentId", e.target.value)
                      }
                      placeholder="pay_xxx"
                      className="neuro-sm"
                    />
                  </div>

                  {/* Discount Code */}
                  <div className="space-y-2">
                    <Label htmlFor="discountCode" className="font-bold">
                      Discount Code
                    </Label>
                    <Input
                      id="discountCode"
                      type="text"
                      value={formData.discountCode}
                      onChange={(e) =>
                        updateFormField("discountCode", e.target.value)
                      }
                      placeholder="DISCOUNT10"
                      className="neuro-sm"
                    />
                  </div>

                  {/* Referral Code */}
                  <div className="space-y-2">
                    <Label htmlFor="referralCode" className="font-bold">
                      Referral Code
                    </Label>
                    <Input
                      id="referralCode"
                      type="text"
                      value={formData.referralCode}
                      onChange={(e) =>
                        updateFormField("referralCode", e.target.value)
                      }
                      placeholder="REF123"
                      className="neuro-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Academic Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold">Academic Details</h3>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {/* University */}
                  <div className="space-y-2">
                    <Label htmlFor="university" className="font-bold">
                      University
                    </Label>
                    <Select
                      value={formData.university}
                      onValueChange={(value: University) =>
                        updateFormField("university", value)
                      }
                    >
                      <SelectTrigger id="university" className="neuro-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MEDICAPS">Medicaps</SelectItem>
                        <SelectItem value="IPS">IPS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Degree */}
                  <div className="space-y-2">
                    <Label htmlFor="degree" className="font-bold">
                      Degree
                    </Label>
                    <Select
                      value={formData.degree}
                      onValueChange={(value: Degree) =>
                        updateFormField("degree", value)
                      }
                    >
                      <SelectTrigger id="degree" className="neuro-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BTECH_CSE">B.Tech CSE</SelectItem>
                        <SelectItem value="BTECH_IT">B.Tech IT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Year */}
                  <div className="space-y-2">
                    <Label htmlFor="year" className="font-bold">
                      Year
                    </Label>
                    <Select
                      value={formData.year}
                      onValueChange={(value: Year) =>
                        updateFormField("year", value)
                      }
                    >
                      <SelectTrigger id="year" className="neuro-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FIRST_YEAR">First Year</SelectItem>
                        <SelectItem value="SECOND_YEAR">Second Year</SelectItem>
                        <SelectItem value="THIRD_YEAR">Third Year</SelectItem>
                        <SelectItem value="FOURTH_YEAR">Fourth Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Semester */}
                  <div className="space-y-2">
                    <Label htmlFor="semester" className="font-bold">
                      Semester
                    </Label>
                    <Select
                      value={formData.semester}
                      onValueChange={(value: Semester) =>
                        updateFormField("semester", value)
                      }
                    >
                      <SelectTrigger id="semester" className="neuro-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FIRST_SEMESTER">
                          1st Semester
                        </SelectItem>
                        <SelectItem value="SECOND_SEMESTER">
                          2nd Semester
                        </SelectItem>
                        <SelectItem value="THIRD_SEMESTER">
                          3rd Semester
                        </SelectItem>
                        <SelectItem value="FOURTH_SEMESTER">
                          4th Semester
                        </SelectItem>
                        <SelectItem value="FIFTH_SEMESTER">
                          5th Semester
                        </SelectItem>
                        <SelectItem value="SIXTH_SEMESTER">
                          6th Semester
                        </SelectItem>
                        <SelectItem value="SEVENTH_SEMESTER">
                          7th Semester
                        </SelectItem>
                        <SelectItem value="EIGHTH_SEMESTER">
                          8th Semester
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Dates and Status */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold">Dates & Status</h3>

                  {/* Purchase Date */}
                  <div className="space-y-2">
                    <Label htmlFor="purchaseDate" className="font-bold">
                      Purchase Date
                    </Label>
                    <Input
                      id="purchaseDate"
                      type="datetime-local"
                      value={formData.purchaseDate?.toISOString().slice(0, 16)}
                      onChange={(e) =>
                        updateFormField(
                          "purchaseDate",
                          new Date(e.target.value),
                        )
                      }
                      className="neuro-sm"
                    />
                  </div>

                  {/* Expiry Date */}
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate" className="font-bold">
                      Expiry Date
                    </Label>
                    <Input
                      id="expiryDate"
                      type="datetime-local"
                      value={formData.expiryDate?.toISOString().slice(0, 16)}
                      onChange={(e) =>
                        updateFormField("expiryDate", new Date(e.target.value))
                      }
                      className="neuro-sm"
                    />
                  </div>

                  {/* Active Status */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 font-bold">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) =>
                          updateFormField("isActive", e.target.checked)
                        }
                        className="rounded"
                      />
                      Is Active
                    </Label>
                  </div>

                  {/* Webhook Processed */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 font-bold">
                      <input
                        type="checkbox"
                        checked={formData.webhookProcessed}
                        onChange={(e) =>
                          updateFormField("webhookProcessed", e.target.checked)
                        }
                        className="rounded"
                      />
                      Webhook Processed
                    </Label>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold">Additional Info</h3>

                  {/* Failure Reason */}
                  <div className="space-y-2">
                    <Label htmlFor="failureReason" className="font-bold">
                      Failure Reason
                    </Label>
                    <Input
                      id="failureReason"
                      type="text"
                      value={formData.failureReason}
                      onChange={(e) =>
                        updateFormField("failureReason", e.target.value)
                      }
                      placeholder="Optional failure reason"
                      className="neuro-sm"
                    />
                  </div>

                  {/* Admin Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="adminNotes" className="font-bold">
                      Admin Notes
                    </Label>
                    <Textarea
                      id="adminNotes"
                      value={formData.adminNotes}
                      onChange={(e) =>
                        updateFormField("adminNotes", e.target.value)
                      }
                      placeholder="Add any admin notes..."
                      className="neuro-sm"
                      rows={4}
                    />
                  </div>
                </div>
              </div>

              {/* Grant Button */}
              <Button
                onClick={handleGrantPremium}
                disabled={!selectedUser || isGranting}
                className="neuro-sm w-full font-bold"
                size="lg"
              >
                {isGranting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
                    Creating Premium Purchase...
                  </div>
                ) : (
                  `Create Premium Purchase - ${formData.tier.replace("_", " ")}`
                )}
              </Button>
            </TabsContent>

            <TabsContent value="details" className="space-y-6">
              {selectedUser && (
                <UserDetailsView
                  user={selectedUser}
                  details={userDetails}
                  isLoading={isLoadingDetails}
                  onRefresh={() => loadUserDetails(selectedUser.id)}
                />
              )}
            </TabsContent>

            <TabsContent value="edit" className="space-y-6">
              {userDetails?.premiumPurchases?.length ? (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold">Edit Premium Purchases</h3>
                  <div className="space-y-4">
                    {userDetails.premiumPurchases.map((purchase) => (
                      <Card key={purchase.id} className="neuro-sm">
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <span>
                              {purchase.tier.replace("_", " ")} -{" "}
                              {purchase.isActive ? "Active" : "Inactive"}
                            </span>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditModal(purchase)}
                                className="neuro-sm"
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  handleDeletePurchase(purchase.id)
                                }
                                className="neuro-sm"
                              >
                                Delete
                              </Button>
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                            <div>
                              <span className="font-semibold">Amount:</span>
                              <p>₹{purchase.finalAmount}</p>
                            </div>
                            <div>
                              <span className="font-semibold">Status:</span>
                              <p>{purchase.paymentStatus}</p>
                            </div>
                            <div>
                              <span className="font-semibold">Duration:</span>
                              <p>{purchase.duration} days</p>
                            </div>
                            <div>
                              <span className="font-semibold">Expires:</span>
                              <p>
                                {new Date(
                                  purchase.expiryDate,
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            {purchase.razorpayOrderId && (
                              <div>
                                <span className="font-semibold">Order ID:</span>
                                <p className="font-mono text-xs">
                                  {purchase.razorpayOrderId}
                                </p>
                              </div>
                            )}
                            {purchase.razorpayPaymentId && (
                              <div>
                                <span className="font-semibold">
                                  Payment ID:
                                </span>
                                <p className="font-mono text-xs">
                                  {purchase.razorpayPaymentId}
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground py-8 text-center">
                  No premium purchases found for this user.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Edit Purchase Modal */}
      <Dialog
        open={!!editingPurchase}
        onOpenChange={() => {
          setEditingPurchase(null);
          setEditFormData(null);
        }}
      >
        <DialogContent
          className="max-h-[90vh] max-w-4xl overflow-y-auto"
          data-lenis-prevent
        >
          <DialogHeader>
            <DialogTitle>Edit Premium Purchase</DialogTitle>
          </DialogHeader>

          {editFormData && (
            <div className="space-y-6">
              {/* Basic Purchase Details */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold">Purchase Details</h3>

                  {/* Premium Tier */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-tier" className="font-bold">
                      Premium Tier
                    </Label>
                    <Select
                      value={editFormData.tier}
                      onValueChange={(value: PremiumTier) =>
                        updateEditFormField("tier", value)
                      }
                    >
                      <SelectTrigger id="edit-tier" className="neuro-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TIER_1">Tier 1 - Basic</SelectItem>
                        <SelectItem value="TIER_2">Tier 2 - Premium</SelectItem>
                        <SelectItem value="TIER_3">Tier 3 - Pro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Duration */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-duration" className="font-bold">
                      Duration (days)
                    </Label>
                    <Input
                      id="edit-duration"
                      type="number"
                      value={editFormData.duration}
                      onChange={(e) =>
                        updateEditFormField(
                          "duration",
                          parseInt(e.target.value) || 0,
                        )
                      }
                      min="1"
                      className="neuro-sm"
                    />
                  </div>

                  {/* Amounts */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-originalAmount" className="font-bold">
                      Original Amount
                    </Label>
                    <Input
                      id="edit-originalAmount"
                      type="text"
                      value={editFormData.originalAmount}
                      onChange={(e) =>
                        updateEditFormField("originalAmount", e.target.value)
                      }
                      placeholder="0.00"
                      className="neuro-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-discountAmount" className="font-bold">
                      Discount Amount
                    </Label>
                    <Input
                      id="edit-discountAmount"
                      type="text"
                      value={editFormData.discountAmount}
                      onChange={(e) =>
                        updateEditFormField("discountAmount", e.target.value)
                      }
                      placeholder="0.00"
                      className="neuro-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-finalAmount" className="font-bold">
                      Final Amount *
                    </Label>
                    <Input
                      id="edit-finalAmount"
                      type="text"
                      value={editFormData.finalAmount}
                      onChange={(e) =>
                        updateEditFormField("finalAmount", e.target.value)
                      }
                      placeholder="0.00"
                      className="neuro-sm"
                      required
                    />
                  </div>

                  {/* Currency */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-currency" className="font-bold">
                      Currency
                    </Label>
                    <Input
                      id="edit-currency"
                      type="text"
                      value={editFormData.currency}
                      onChange={(e) =>
                        updateEditFormField("currency", e.target.value)
                      }
                      placeholder="INR"
                      className="neuro-sm"
                    />
                  </div>
                </div>

                {/* Payment & Processing Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold">Payment & Processing</h3>

                  {/* Payment Status */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-paymentStatus" className="font-bold">
                      Payment Status
                    </Label>
                    <Select
                      value={editFormData.paymentStatus}
                      onValueChange={(value: PaymentStatus) =>
                        updateEditFormField("paymentStatus", value)
                      }
                    >
                      <SelectTrigger
                        id="edit-paymentStatus"
                        className="neuro-sm"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="AUTHORIZED">Authorized</SelectItem>
                        <SelectItem value="CAPTURED">Captured</SelectItem>
                        <SelectItem value="FAILED">Failed</SelectItem>
                        <SelectItem value="REFUNDED">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-paymentMethod" className="font-bold">
                      Payment Method
                    </Label>
                    <Select
                      value={editFormData.paymentMethod || ""}
                      onValueChange={(value: PaymentMethod) =>
                        updateEditFormField("paymentMethod", value)
                      }
                    >
                      <SelectTrigger
                        id="edit-paymentMethod"
                        className="neuro-sm"
                      >
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CARD">Card</SelectItem>
                        <SelectItem value="UPI">UPI</SelectItem>
                        <SelectItem value="NETBANKING">Net Banking</SelectItem>
                        <SelectItem value="WALLET">Wallet</SelectItem>
                        <SelectItem value="EMI">EMI</SelectItem>
                        <SelectItem value="PAYLATER">Pay Later</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Razorpay Order ID */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-razorpayOrderId" className="font-bold">
                      Razorpay Order ID
                    </Label>
                    <Input
                      id="edit-razorpayOrderId"
                      type="text"
                      value={editFormData.razorpayOrderId}
                      onChange={(e) =>
                        updateEditFormField("razorpayOrderId", e.target.value)
                      }
                      placeholder="order_xxx"
                      className="neuro-sm"
                    />
                  </div>

                  {/* Razorpay Payment ID */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-razorpayPaymentId"
                      className="font-bold"
                    >
                      Razorpay Payment ID
                    </Label>
                    <Input
                      id="edit-razorpayPaymentId"
                      type="text"
                      value={editFormData.razorpayPaymentId}
                      onChange={(e) =>
                        updateEditFormField("razorpayPaymentId", e.target.value)
                      }
                      placeholder="pay_xxx"
                      className="neuro-sm"
                    />
                  </div>

                  {/* Discount Code */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-discountCode" className="font-bold">
                      Discount Code
                    </Label>
                    <Input
                      id="edit-discountCode"
                      type="text"
                      value={editFormData.discountCode}
                      onChange={(e) =>
                        updateEditFormField("discountCode", e.target.value)
                      }
                      placeholder="DISCOUNT10"
                      className="neuro-sm"
                    />
                  </div>

                  {/* Referral Code */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-referralCode" className="font-bold">
                      Referral Code
                    </Label>
                    <Input
                      id="edit-referralCode"
                      type="text"
                      value={editFormData.referralCode}
                      onChange={(e) =>
                        updateEditFormField("referralCode", e.target.value)
                      }
                      placeholder="REF123"
                      className="neuro-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Academic Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold">Academic Details</h3>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {/* University */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-university" className="font-bold">
                      University
                    </Label>
                    <Select
                      value={editFormData.university}
                      onValueChange={(value: University) =>
                        updateEditFormField("university", value)
                      }
                    >
                      <SelectTrigger id="edit-university" className="neuro-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MEDICAPS">Medicaps</SelectItem>
                        <SelectItem value="IPS">IPS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Degree */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-degree" className="font-bold">
                      Degree
                    </Label>
                    <Select
                      value={editFormData.degree}
                      onValueChange={(value: Degree) =>
                        updateEditFormField("degree", value)
                      }
                    >
                      <SelectTrigger id="edit-degree" className="neuro-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BTECH_CSE">B.Tech CSE</SelectItem>
                        <SelectItem value="BTECH_IT">B.Tech IT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Year */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-year" className="font-bold">
                      Year
                    </Label>
                    <Select
                      value={editFormData.year}
                      onValueChange={(value: Year) =>
                        updateEditFormField("year", value)
                      }
                    >
                      <SelectTrigger id="edit-year" className="neuro-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FIRST_YEAR">First Year</SelectItem>
                        <SelectItem value="SECOND_YEAR">Second Year</SelectItem>
                        <SelectItem value="THIRD_YEAR">Third Year</SelectItem>
                        <SelectItem value="FOURTH_YEAR">Fourth Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Semester */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-semester" className="font-bold">
                      Semester
                    </Label>
                    <Select
                      value={editFormData.semester}
                      onValueChange={(value: Semester) =>
                        updateEditFormField("semester", value)
                      }
                    >
                      <SelectTrigger id="edit-semester" className="neuro-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FIRST_SEMESTER">
                          1st Semester
                        </SelectItem>
                        <SelectItem value="SECOND_SEMESTER">
                          2nd Semester
                        </SelectItem>
                        <SelectItem value="THIRD_SEMESTER">
                          3rd Semester
                        </SelectItem>
                        <SelectItem value="FOURTH_SEMESTER">
                          4th Semester
                        </SelectItem>
                        <SelectItem value="FIFTH_SEMESTER">
                          5th Semester
                        </SelectItem>
                        <SelectItem value="SIXTH_SEMESTER">
                          6th Semester
                        </SelectItem>
                        <SelectItem value="SEVENTH_SEMESTER">
                          7th Semester
                        </SelectItem>
                        <SelectItem value="EIGHTH_SEMESTER">
                          8th Semester
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Dates and Status */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold">Dates & Status</h3>

                  {/* Purchase Date */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-purchaseDate" className="font-bold">
                      Purchase Date
                    </Label>
                    <Input
                      id="edit-purchaseDate"
                      type="datetime-local"
                      value={editFormData.purchaseDate
                        ?.toISOString()
                        .slice(0, 16)}
                      onChange={(e) =>
                        updateEditFormField(
                          "purchaseDate",
                          new Date(e.target.value),
                        )
                      }
                      className="neuro-sm"
                    />
                  </div>

                  {/* Expiry Date */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-expiryDate" className="font-bold">
                      Expiry Date
                    </Label>
                    <Input
                      id="edit-expiryDate"
                      type="datetime-local"
                      value={editFormData.expiryDate
                        ?.toISOString()
                        .slice(0, 16)}
                      onChange={(e) =>
                        updateEditFormField(
                          "expiryDate",
                          new Date(e.target.value),
                        )
                      }
                      className="neuro-sm"
                    />
                  </div>

                  {/* Active Status */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 font-bold">
                      <input
                        type="checkbox"
                        checked={editFormData.isActive}
                        onChange={(e) =>
                          updateEditFormField("isActive", e.target.checked)
                        }
                        className="rounded"
                      />
                      Is Active
                    </Label>
                  </div>

                  {/* Webhook Processed */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 font-bold">
                      <input
                        type="checkbox"
                        checked={editFormData.webhookProcessed}
                        onChange={(e) =>
                          updateEditFormField(
                            "webhookProcessed",
                            e.target.checked,
                          )
                        }
                        className="rounded"
                      />
                      Webhook Processed
                    </Label>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold">Additional Info</h3>

                  {/* Failure Reason */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-failureReason" className="font-bold">
                      Failure Reason
                    </Label>
                    <Input
                      id="edit-failureReason"
                      type="text"
                      value={editFormData.failureReason}
                      onChange={(e) =>
                        updateEditFormField("failureReason", e.target.value)
                      }
                      placeholder="Optional failure reason"
                      className="neuro-sm"
                    />
                  </div>

                  {/* Admin Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-adminNotes" className="font-bold">
                      Admin Notes
                    </Label>
                    <Textarea
                      id="edit-adminNotes"
                      value={editFormData.adminNotes}
                      onChange={(e) =>
                        updateEditFormField("adminNotes", e.target.value)
                      }
                      placeholder="Add any admin notes..."
                      className="neuro-sm"
                      rows={4}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingPurchase(null);
                    setEditFormData(null);
                  }}
                  className="neuro-sm"
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit} className="neuro-sm">
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
