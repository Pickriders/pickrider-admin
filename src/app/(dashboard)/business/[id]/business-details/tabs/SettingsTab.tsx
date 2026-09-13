"use client";

import { Bell, Info } from "lucide-react";
import { useEffect, useState } from "react";

import { businesses, type BusinessDetail } from "@/lib/admin/api";
import { useAction } from "@/lib/admin/hooks";
import { Button, KeyValue, Panel, PanelHeader, Skeleton, Switch } from "@/components/kit";

import { BUSINESS_TYPE_LABEL, SERVICE_TYPE_LABEL } from "../BusinessDetail";

/**
 * What an admin can change on a business today: its notification channels,
 * through PATCH businesses/:id/preferences. The old edit page drafted name,
 * registration number and address fields but never submitted them; the core
 * has no admin route for those, so they are shown read-only here instead.
 */
type Channels = { email: boolean; push: boolean; sms: boolean };

const DEFAULT_CHANNELS: Channels = { email: true, push: true, sms: true };

export function SettingsTab({ businessId, business, loading }: { businessId: string; business: BusinessDetail | undefined; loading: boolean }) {
  const saved: Channels = {
    email: business?.preferences?.notification?.email ?? DEFAULT_CHANNELS.email,
    push: business?.preferences?.notification?.push ?? DEFAULT_CHANNELS.push,
    sms: business?.preferences?.notification?.sms ?? DEFAULT_CHANNELS.sms,
  };
  const [channels, setChannels] = useState<Channels>(saved);

  useEffect(() => {
    setChannels({
      email: business?.preferences?.notification?.email ?? DEFAULT_CHANNELS.email,
      push: business?.preferences?.notification?.push ?? DEFAULT_CHANNELS.push,
      sms: business?.preferences?.notification?.sms ?? DEFAULT_CHANNELS.sms,
    });
  }, [business?.preferences?.notification?.email, business?.preferences?.notification?.push, business?.preferences?.notification?.sms]);

  const dirty = channels.email !== saved.email || channels.push !== saved.push || channels.sms !== saved.sms;

  const save = useAction((next: Channels) => businesses.updatePreferences(businessId, { notification: next }), {
    success: "Notification preferences saved.",
    invalidate: [["business", businessId]],
  });

  const bidding = business?.preferences?.bidding;
  const alerts = business?.preferences?.orderRequestNotification;

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <Panel>
        <PanelHeader title="Notifications" subtitle="Channels the business is reached on for order and account updates" />
        <div className="space-y-4 p-5 pt-3">
          {loading ? (
            <>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-6 w-40" />
            </>
          ) : (
            <>
              <Switch checked={channels.email} onChange={(email) => setChannels((c) => ({ ...c, email }))} label="Email" />
              <Switch checked={channels.push} onChange={(push) => setChannels((c) => ({ ...c, push }))} label="Push notifications" />
              <Switch checked={channels.sms} onChange={(sms) => setChannels((c) => ({ ...c, sms }))} label="SMS" />
              <div className="flex items-center gap-2 pt-2">
                <Button icon={Bell} onClick={() => save.mutate(channels)} disabled={!dirty} loading={save.isPending}>
                  Save preferences
                </Button>
                {dirty ? (
                  <Button variant="ghost" onClick={() => setChannels(saved)} disabled={save.isPending}>
                    Reset
                  </Button>
                ) : null}
              </div>
            </>
          )}
        </div>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelHeader title="Set from the business app" subtitle="Read-only here" />
          <div className="p-5 pt-3">
            {loading ? (
              <Skeleton className="h-24 w-full" />
            ) : (
              <KeyValue
                columns={2}
                items={[
                  { label: "Business name", value: business?.name },
                  { label: "Handle", value: business?.businessHandle ? `@${business.businessHandle}` : undefined },
                  { label: "Business type", value: business?.type ? BUSINESS_TYPE_LABEL[business.type] ?? business.type : undefined },
                  { label: "Service model", value: business?.businessType ? SERVICE_TYPE_LABEL[business.businessType] ?? business.businessType : undefined },
                  { label: "Address", value: business?.address?.name },
                  { label: "Branch", value: business?.branchName ?? business?.address?.branchName },
                  { label: "Price suggestions", value: bidding ? (bidding.priceSuggestion ? `On, ${bidding.minus ?? 0} below to ${bidding.plus ?? 0} above` : "Off") : undefined },
                  { label: "Order alerts", value: alerts ? [alerts.sound ? "Sound" : null, alerts.vibration ? "Vibration" : null].filter(Boolean).join(" + ") || "Silent" : undefined },
                ]}
              />
            )}
          </div>
        </Panel>
        <div className="flex gap-3 rounded-xl border border-info/30 bg-info-soft px-4 py-3 text-sm text-info">
          <Info size={16} className="mt-0.5 shrink-0" />
          <p>
            Name, address, logo and registration details are edited by the business owner in the business app. The core API has no admin route to change
            them yet, and business KYB review is not part of this admin.
          </p>
        </div>
      </div>
    </div>
  );
}
