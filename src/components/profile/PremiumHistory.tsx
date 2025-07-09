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
          className="gap-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
        >
          <CheckCircleIcon type="duotone" className="h-3 w-3" />
          Active
        </Badge>
      );
    } else if (status === "CAPTURED" && !isActive) {
      return (
        <Badge variant="secondary" className="gap-1">
          <CheckCircleIcon type="duotone" className="h-3 w-3" />
          Expired
        </Badge>
      );
    } else if (status === "FAILED") {
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircleIcon type="duotone" className="h-3 w-3" />
          Failed
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="gap-1">
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
      <Card>
        <CardHeader>
          <CardTitle className="font-excon flex items-center gap-2 text-2xl font-bold">
            <ReceiptIcon type="duotone" className="h-6 w-6" />
            Purchase History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <ReceiptIcon
              type="duotone"
              className="text-muted-foreground mx-auto mb-4 h-12 w-12"
            />
            <h3 className="font-excon mb-2 text-lg font-semibold">
              No Purchase History
            </h3>
            <p className="text-muted-foreground font-satoshi">
              You haven&apos;t made any premium purchases yet.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-excon flex items-center gap-2 text-2xl font-bold">
          <ReceiptIcon type="duotone" className="h-6 w-6" />
          Purchase History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-excon">Plan</TableHead>
                <TableHead className="font-excon">Amount</TableHead>
                <TableHead className="font-excon">Status</TableHead>
                <TableHead className="font-excon">Purchase Date</TableHead>
                <TableHead className="font-excon">Expiry Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.map((purchase) => {
                const tierConfig = getTierConfig(purchase.tier);
                return (
                  <TableRow key={purchase.id}>
                    <TableCell>
                      <div>
                        <p className="font-satoshi font-medium">
                          {tierConfig.title}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {tierConfig.description}
                        </p>
                        {purchase.discountCode && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            Code: {purchase.discountCode}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-satoshi">
                        <p className="flex items-center gap-1 font-medium">
                          {formatAmount(
                            purchase.finalAmount,
                            purchase.currency,
                          )}
                        </p>
                        {purchase.discountAmount > 0 && (
                          <p className="text-muted-foreground text-sm line-through">
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
                        <p className="text-destructive mt-1 text-xs">
                          {purchase.failureReason}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="font-satoshi">
                      {new Date(purchase.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        },
                      )}
                    </TableCell>
                    <TableCell className="font-satoshi">
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
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        <div className="bg-muted/50 mt-6 rounded-lg p-4">
          <h4 className="font-excon mb-2 font-semibold">Summary</h4>
          <div className="font-satoshi grid grid-cols-2 gap-4 text-sm md:grid-cols-3">
            <div>
              <p className="text-muted-foreground">Total Purchases</p>
              <p className="font-medium">{purchases.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Successful Payments</p>
              <p className="font-medium">
                {purchases.filter((p) => p.paymentStatus === "CAPTURED").length}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Spent</p>
              <p className="font-medium">
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
