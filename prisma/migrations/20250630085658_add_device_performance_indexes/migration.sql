-- CreateIndex
CREATE INDEX "device_user_active_idx" ON "device_fingerprint"("userId", "isActive");

-- CreateIndex
CREATE INDEX "device_user_lastused_idx" ON "device_fingerprint"("userId", "lastUsedAt");

-- CreateIndex
CREATE INDEX "device_hash_idx" ON "device_fingerprint"("hash");

-- CreateIndex
CREATE INDEX "device_lastused_idx" ON "device_fingerprint"("lastUsedAt");
