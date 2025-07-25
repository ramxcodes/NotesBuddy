import AdminCouponController from "@/components/admin/coupons/AdminCouponController";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Discount Coupons",
  description: "Admin panel for managing discount coupons and promotions",
};

export default function CouponsPage() {
  return (
    <div className="space-y-8">
      <AdminCouponController />
    </div>
  );
}
