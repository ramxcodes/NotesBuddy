import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ReceiptIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from "@phosphor-icons/react";
import { getTierConfig } from "@/dal/premium/types";

interface PremiumPurchase {
  id: string;
  tier: "TIER_1" | "TIER_2" | "TIER_3";
  originalAmount: number;
  finalAmount: number;
  discountAmount: number;
  currency: string;
  paymentStatus: string;
  isActive: boolean;
  createdAt: Date | string;
  expiryDate: Date | string;
  razorpayOrderId: string;
  razorpayPaymentId?: string | null;
  paymentMethod?: string | null;
  failureReason?: string | null;
  discountCode?: string | null;
  referralCode?: string | null;
}

interface PremiumHistoryProps {
  purchases: PremiumPurchase[];
}

export function PremiumHistory({ purchases }: PremiumHistoryProps) {
  const getStatusBadge = (status: string, isActive: boolean) => {
    if (status === "CAPTURED" && isActive) {
      return (
        <Badge
          variant="secondary"
          className="border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] dark:border-white dark:bg-black dark:text-white dark:shadow-[2px_2px_0px_0px_#fff]"
        >
          <CheckCircleIcon type="duotone" className="h-3 w-3" />
          Active
        </Badge>
      );
    } else if (status === "CAPTURED" && !isActive) {
      return (
        <Badge
          variant="secondary"
          className="border-2 border-black bg-zinc-200 font-bold text-black shadow-[2px_2px_0px_0px_#000] dark:border-white dark:bg-zinc-700 dark:text-white dark:shadow-[2px_2px_0px_0px_#fff]"
        >
          <CheckCircleIcon type="duotone" className="h-3 w-3" />
          Expired
        </Badge>
      );
    } else if (status === "FAILED") {
      return (
        <Badge
          variant="destructive"
          className="border-2 border-black bg-black font-bold text-white shadow-[2px_2px_0px_0px_#000] dark:border-white dark:bg-white dark:text-black dark:shadow-[2px_2px_0px_0px_#fff]"
        >
          <XCircleIcon type="duotone" className="h-3 w-3" />
          Failed
        </Badge>
      );
    } else {
      return (
        <Badge
          variant="outline"
          className="border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] dark:border-white dark:bg-zinc-900 dark:text-white dark:shadow-[2px_2px_0px_0px_#fff]"
        >
          <ClockIcon type="duotone" className="h-3 w-3" />
          Pending
        </Badge>
      );
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  if (purchases.length === 0) {
    return (
      <Card className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_#fff]">
        <CardHeader>
          <CardTitle className="font-excon flex items-center gap-2 text-2xl font-black text-black dark:text-white">
            <ReceiptIcon
              type="duotone"
              className="h-6 w-6 text-black dark:text-white"
            />
            Purchase History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border-2 border-black bg-white p-8 shadow-[2px_2px_0px_0px_#000] dark:border-white dark:bg-zinc-800 dark:shadow-[2px_2px_0px_0px_#fff]">
            <ReceiptIcon
              type="duotone"
              className="mx-auto mb-4 h-12 w-12 text-black dark:text-white"
            />
            <h3 className="font-excon mb-2 text-lg font-black text-black dark:text-white">
              No Purchase History
            </h3>
            <p className="font-satoshi font-bold text-black dark:text-white">
              You haven&apos;t made any premium purchases yet.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_#fff]">
      <CardHeader>
        <CardTitle className="font-excon flex items-center gap-2 text-2xl font-black text-black dark:text-white">
          <ReceiptIcon
            type="duotone"
            className="h-6 w-6 text-black dark:text-white"
          />
          Purchase History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border-2 border-black bg-white shadow-[2px_2px_0px_0px_#000] dark:border-white dark:bg-zinc-800 dark:shadow-[2px_2px_0px_0px_#fff]">
          <Table>
            <TableHeader>
              <TableRow className="border-b-2 border-black dark:border-white">
                <TableHead className="font-excon font-black text-black dark:text-white">
                  Plan
                </TableHead>
                <TableHead className="font-excon font-black text-black dark:text-white">
                  Amount
                </TableHead>
                <TableHead className="font-excon font-black text-black dark:text-white">
                  Status
                </TableHead>
                <TableHead className="font-excon font-black text-black dark:text-white">
                  Purchase Date
                </TableHead>
                <TableHead className="font-excon font-black text-black dark:text-white">
                  Expiry Date
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.map((purchase) => {
                const tierConfig = getTierConfig(purchase.tier);
                return (
                  <TableRow
                    key={purchase.id}
                    className="border-b border-black dark:border-white"
                  >
                    <TableCell>
                      <div>
                        <p className="font-satoshi font-black text-black dark:text-white">
                          {tierConfig.title}
                        </p>
                        <p className="font-satoshi font-bold text-black dark:text-white">
                          {tierConfig.description}
                        </p>
                        {purchase.discountCode && (
                          <Badge
                            variant="outline"
                            className="mt-1 border-2 border-black bg-white font-bold text-black shadow-[1px_1px_0px_0px_#000] dark:border-white dark:bg-zinc-900 dark:text-white dark:shadow-[1px_1px_0px_0px_#fff]"
                          >
                            Code: {purchase.discountCode}
                          </Badge>
                        )}
                        {purchase.referralCode && (
                          <Badge
                            variant="outline"
                            className="mt-1 border-2 border-green-500 bg-green-50 font-bold text-green-800 shadow-[1px_1px_0px_0px_#22c55e] dark:border-green-400 dark:bg-green-900/20 dark:text-green-300 dark:shadow-[1px_1px_0px_0px_#4ade80]"
                          >
                            Referral: {purchase.referralCode}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-satoshi">
                        <p className="flex items-center gap-1 font-black text-black dark:text-white">
                          {formatAmount(
                            purchase.finalAmount,
                            purchase.currency,
                          )}
                        </p>
                        {purchase.discountAmount > 0 && (
                          <p className="font-bold text-black line-through dark:text-white">
                            {formatAmount(
                              purchase.originalAmount,
                              purchase.currency,
                            )}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(
                        purchase.paymentStatus,
                        purchase.isActive,
                      )}
                      {purchase.failureReason && (
                        <p className="mt-1 font-bold text-black dark:text-white">
                          {purchase.failureReason}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="font-satoshi font-bold text-black dark:text-white">
                      {new Date(purchase.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        },
                      )}
                    </TableCell>
                    <TableCell className="font-satoshi font-bold text-black dark:text-white">
                      {purchase.paymentStatus === "CAPTURED" ? (
                        new Date(purchase.expiryDate).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          },
                        )
                      ) : (
                        <span className="text-black dark:text-white">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        <div className="mt-6 rounded-md border-2 border-black bg-white p-4 shadow-[2px_2px_0px_0px_#000] dark:border-white dark:bg-zinc-800 dark:shadow-[2px_2px_0px_0px_#fff]">
          <h4 className="font-excon mb-2 font-black text-black dark:text-white">
            Summary
          </h4>
          <div className="font-satoshi grid grid-cols-2 gap-4 text-sm md:grid-cols-3">
            <div>
              <p className="font-bold text-black dark:text-white">
                Total Purchases
              </p>
              <p className="font-black text-black dark:text-white">
                {purchases.length}
              </p>
            </div>
            <div>
              <p className="font-bold text-black dark:text-white">
                Successful Payments
              </p>
              <p className="font-black text-black dark:text-white">
                {purchases.filter((p) => p.paymentStatus === "CAPTURED").length}
              </p>
            </div>
            <div>
              <p className="font-bold text-black dark:text-white">
                Total Spent
              </p>
              <p className="font-black text-black dark:text-white">
                {formatAmount(
                  purchases
                    .filter((p) => p.paymentStatus === "CAPTURED")
                    .reduce((sum, p) => sum + p.finalAmount, 0),
                  "INR",
                )}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
