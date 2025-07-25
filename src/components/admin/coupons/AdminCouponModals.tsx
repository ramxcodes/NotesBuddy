"use client";

import React from "react";
import { AdminCreateCouponModal } from "./AdminCreateCouponModal";
import { AdminEditCouponModal } from "./AdminEditCouponModal";
import { AdminCouponUsageView } from "./AdminCouponUsageView";

interface AdminCouponModalsProps {
  showCreateModal: boolean;
  showEditModal: boolean;
  showUsageView: boolean;
  selectedCouponId: string;
  onModalClose: () => void;
}

export default function AdminCouponModals({
  showCreateModal,
  showEditModal,
  showUsageView,
  selectedCouponId,
  onModalClose,
}: AdminCouponModalsProps) {
  return (
    <>
      {showCreateModal && (
        <AdminCreateCouponModal
          isOpen={showCreateModal}
          onClose={onModalClose}
        />
      )}

      {showEditModal && selectedCouponId && (
        <AdminEditCouponModal
          isOpen={showEditModal}
          couponId={selectedCouponId}
          onClose={onModalClose}
        />
      )}

      {showUsageView && selectedCouponId && (
        <AdminCouponUsageView
          couponId={selectedCouponId}
          onClose={() => onModalClose()}
        />
      )}
    </>
  );
}
