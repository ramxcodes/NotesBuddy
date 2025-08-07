"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AdminUser } from "@/dal/user/admin/user-table-types";

interface DeleteUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: AdminUser | null;
  onConfirm: (userId: string) => Promise<void>;
  isDeleting: boolean;
}

export default function DeleteUserDialog({
  isOpen,
  onClose,
  user,
  onConfirm,
  isDeleting,
}: DeleteUserDialogProps) {
  const handleConfirm = async () => {
    if (user) {
      await onConfirm(user.id);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-md border-2 border-black bg-zinc-100 shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_#757373]">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-red-600 dark:text-red-400">
            Delete User Account
          </DialogTitle>
          <DialogDescription className="text-sm text-zinc-600 dark:text-zinc-400">
            This action cannot be undone. This will permanently delete the user
            account and all associated data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-md border-2 border-yellow-500 bg-yellow-50 p-4 dark:bg-yellow-900/20">
            <h4 className="font-bold text-yellow-800 dark:text-yellow-200">
              Warning: Complete Data Deletion
            </h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              This will permanently delete:
            </p>
            <ul className="mt-2 list-inside list-disc text-xs text-yellow-700 dark:text-yellow-300">
              <li>User profile and account information</li>
              <li>All premium purchase history</li>
              <li>All chat conversations and messages</li>
              <li>All quiz attempts and results</li>
              <li>All flashcard visit history</li>
              <li>All device fingerprints</li>
              <li>All reports submitted by this user</li>
              <li>All referral rewards and connections</li>
            </ul>
          </div>

          <div className="rounded-md border-2 border-black bg-white p-4 dark:border-white/20 dark:bg-zinc-800">
            <h4 className="font-bold text-black dark:text-white">
              User Details:
            </h4>
            <div className="mt-2 space-y-1 text-sm">
              <p>
                <span className="font-semibold">Name:</span> {user.name}
              </p>
              <p>
                <span className="font-semibold">Email:</span> {user.email}
              </p>
              {user.profile && (
                <>
                  <p>
                    <span className="font-semibold">Phone:</span>{" "}
                    {user.profile.phoneNumber}
                  </p>
                  <p>
                    <span className="font-semibold">Profile:</span>{" "}
                    {user.profile.firstName} {user.profile.lastName}
                  </p>
                </>
              )}
              <p>
                <span className="font-semibold">Premium Status:</span>{" "}
                <span
                  className={`rounded px-2 py-1 text-xs font-bold ${
                    user.isPremiumActive
                      ? "bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200"
                      : "bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                  }`}
                >
                  {user.isPremiumActive ? "Premium" : "Free"}
                </span>
              </p>
            </div>
          </div>

          <div className="rounded-md border-2 border-red-500 bg-red-50 p-4 dark:bg-red-900/20">
            <p className="text-sm font-semibold text-red-700 dark:text-red-300">
              To confirm deletion, please verify that you want to delete the
              account for <span className="font-bold">{user.email}</span>
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-md border-2 border-black bg-zinc-100 shadow-[2px_2px_0px_0px_#000] hover:shadow-[1px_1px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373] dark:hover:shadow-[1px_1px_0px_0px_#757373]"
            data-umami-event="admin-user-delete-cancel"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="rounded-md border-2 border-red-600 bg-red-500 text-white shadow-[2px_2px_0px_0px_#dc2626] hover:bg-red-600 hover:shadow-[1px_1px_0px_0px_#dc2626] dark:shadow-[2px_2px_0px_0px_#dc2626] dark:hover:shadow-[1px_1px_0px_0px_#dc2626]"
            data-umami-event="admin-user-delete-confirm"
          >
            {isDeleting ? "Deleting..." : "Delete User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
