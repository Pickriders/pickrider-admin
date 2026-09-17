"use client";

import { ChevronRight, Globe2, MapPin, Plus } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";

import { Badge, Button, Drawer, EmptyState, ErrorState, Field, Input, KeyValue, Panel, PanelHeader, Skeleton, Switch, cx } from "@/components/kit";
import { asArray, settings, settingsExtra, type Country, type CountryConfig, type CountryState, type StateConfig } from "@/lib/admin/api";
import { naira } from "@/lib/admin/format";
import { useAction, useCountries, useCountry, useDeliveryPricing, useStates } from "@/lib/admin/hooks";
import { errorMessage } from "@/lib/admin/http";
import { useTableState } from "@/lib/admin/url-state";

import { MoneyInput, NumberInput, SectionTitle } from "./fields";
import { useCan } from "@/lib/admin/use-can";

/**
 * App settings: countries and their states, each with the pricing, dispatch
 * and referral knobs the core reads. Selection lives in the URL
 * (`?country=<id>&state=<id>`), the add forms open with `?add=country|state`.
 */
export function SettingsTab() {
  const table = useTableState();
  const countryId = table.state.filters.country;
  const stateId = table.state.filters.state;
  const adding = table.state.filters.add;
  const countries = useCountries();
  const list = asArray(countries.data);

  // Land on the first country when nothing is picked, so the page is never blank.
  useEffect(() => {
    if (!countryId && list.length) table.update({ country: list[0]._id }, { resetPage: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryId, list.length]);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[18rem_1fr]">
      <div className="space-y-4">
        <Panel>
          <PanelHeader
            title="Countries"
            subtitle="Where the platform runs"
            action={
              <Button size="sm" variant="outline" icon={Plus} onClick={() => table.update({ add: "country" }, { resetPage: false })}>
                Add
              </Button>
            }
          />
          <div className="p-3">
            {countries.isError ? (
              <ErrorState message={errorMessage(countries.error)} onRetry={() => void countries.refetch()} />
            ) : countries.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            ) : !list.length ? (
              <EmptyState compact icon={Globe2} title="No countries yet" description="Add the first country to start configuring pricing." />
            ) : (
              <ul className="space-y-1">
                {list.map((country) => {
                  const active = country._id === countryId;
                  return (
                    <li key={country._id}>
                      <button
                        type="button"
                        onClick={() => table.update({ country: country._id, state: undefined }, { resetPage: false })}
                        className={cx(
                          "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                          active ? "bg-ink text-card" : "hover:bg-surface",
                        )}
                      >
                        <span className={cx("grid h-9 w-9 shrink-0 place-items-center rounded-xl", active ? "bg-card/15 text-card" : "bg-brand-soft text-brand-dark")}>
                          <Globe2 size={16} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-bold">{country.name}</span>
                          <span className={cx("block text-[11px]", active ? "text-card/70" : "text-ink-muted")}>
                            {country.code} · {String(country.currencyCode ?? country.currency ?? "")}
                          </span>
                        </span>
                        <ChevronRight size={14} className={active ? "text-card/70" : "text-ink-faint"} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </Panel>
        <LivePricingPanel />
      </div>

      <div className="min-w-0 space-y-4">
        {countryId ? (
          <>
            <CountryForm countryId={countryId} />
            <StatesPanel countryId={countryId} onOpen={(id) => table.update({ state: id }, { resetPage: false })} onAdd={() => table.update({ add: "state" }, { resetPage: false })} />
          </>
        ) : !countries.isLoading && !list.length ? (
          <Panel>
            <EmptyState icon={Globe2} title="Nothing to configure yet" description="Pricing, withdrawal limits and dispatch rules live under a country." />
          </Panel>
        ) : null}
      </div>

      <AddCountryDrawer open={adding === "country"} onClose={() => table.update({ add: undefined }, { resetPage: false })} onCreated={(id) => table.update({ add: undefined, country: id, state: undefined }, { resetPage: false })} />
      {countryId ? (
        <>
          <AddStateDrawer countryId={countryId} open={adding === "state"} onClose={() => table.update({ add: undefined }, { resetPage: false })} onCreated={(id) => table.update({ add: undefined, state: id }, { resetPage: false })} />
          <StateDrawer countryId={countryId} stateId={stateId} onClose={() => table.update({ state: undefined }, { resetPage: false })} />
        </>
      ) : null}
    </div>
  );
}

// ── Live pricing snapshot ─────────────────────────────────────────────────────

function LivePricingPanel() {
  const pricing = useDeliveryPricing();
  const p = (pricing.data ?? {}) as Record<string, number | undefined>;
  return (
    <Panel>
      <PanelHeader title="Live delivery pricing" subtitle="What the apps read for NG / EN right now" />
      <div className="p-5 pt-3">
        {pricing.isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <KeyValue
            columns={1}
            items={[
              { label: "Base rate per km", value: naira(p.basePricePerKm) },
              { label: "Base fuel price", value: naira(p.baseFuelPrice) },
              { label: "Current fuel price", value: naira(p.currentFuelPrice) },
              { label: "Minimum order price", value: naira(p.minimumOrderPrice) },
              { label: "Taper threshold", value: naira(p.distanceTaperThreshold) },
              { label: "Beyond-threshold rate per km", value: naira(p.distanceTaperBeyondRate) },
            ]}
          />
        )}
      </div>
    </Panel>
  );
}

// ── Country ───────────────────────────────────────────────────────────────────

type CountryDraft = { name: string; config: CountryConfig };

function draftFromCountry(country: Country | undefined): CountryDraft {
  const config = ((country?.config ?? {}) as CountryConfig) ?? {};
  return {
    name: country?.name ?? "",
    config: {
      exchangeRate: config.exchangeRate ?? 0,
      minimumOfferPercentage: config.minimumOfferPercentage ?? 0,
      maxRiderSurgePercentage: config.maxRiderSurgePercentage ?? 40,
      userWithdrawalLimits: { minimumAmount: config.userWithdrawalLimits?.minimumAmount ?? 0, maximumAmount: config.userWithdrawalLimits?.maximumAmount ?? 0 },
      businessWithdrawalLimits: { minimumAmount: config.businessWithdrawalLimits?.minimumAmount ?? 0, maximumAmount: config.businessWithdrawalLimits?.maximumAmount ?? 0 },
      referAndEarn: config.referAndEarn ?? false,
      referralEarnAmount: config.referralEarnAmount ?? 0,
      ordersRequiredBeforeEarn: config.ordersRequiredBeforeEarn ?? 1,
    },
  };
}

function CountryForm({ countryId }: { countryId: string }) {
  const canWrite = useCan().can("settings.write");
  const country = useCountry(countryId);
  const [draft, setDraft] = useState<CountryDraft>(() => draftFromCountry(undefined));
  const [dirty, setDirty] = useState(false);
  const stamp = `${country.data?._id ?? ""}:${String(country.data?.updatedAt ?? "")}`;

  useEffect(() => {
    setDraft(draftFromCountry(country.data));
    setDirty(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stamp]);

  const save = useAction((body: Record<string, unknown>) => settings.updateCountry(countryId, body), {
    success: "Country saved",
    invalidate: [["settings"]],
    onSuccess: () => setDirty(false),
  });

  const setConfig = <K extends keyof CountryConfig>(key: K, value: CountryConfig[K]) => {
    setDraft((d) => ({ ...d, config: { ...d.config, [key]: value } }));
    setDirty(true);
  };
  const setLimit = (group: "userWithdrawalLimits" | "businessWithdrawalLimits", key: "minimumAmount" | "maximumAmount", value: number) => {
    setDraft((d) => ({ ...d, config: { ...d.config, [group]: { ...d.config[group], [key]: value } } }));
    setDirty(true);
  };

  const errors = useMemo(() => {
    const out: string[] = [];
    const c = draft.config;
    if (!draft.name.trim()) out.push("Country name is required.");
    if ((c.minimumOfferPercentage ?? 0) < 0 || (c.minimumOfferPercentage ?? 0) > 100) out.push("Minimum offer must be between 0 and 100 percent.");
    if ((c.maxRiderSurgePercentage ?? 0) < 0 || (c.maxRiderSurgePercentage ?? 0) > 100) out.push("Rider surge cap must be between 0 and 100 percent.");
    for (const group of ["userWithdrawalLimits", "businessWithdrawalLimits"] as const) {
      const g = c[group];
      if ((g?.maximumAmount ?? 0) < (g?.minimumAmount ?? 0)) out.push(`${group === "userWithdrawalLimits" ? "Courier" : "Business"} maximum withdrawal is below the minimum.`);
    }
    return out;
  }, [draft]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (errors.length) return;
    save.mutate({ name: draft.name.trim(), config: draft.config });
  };

  if (country.isError) return <ErrorState message={errorMessage(country.error)} onRetry={() => void country.refetch()} />;

  const data = country.data;
  return (
    <Panel>
      <PanelHeader
        title={data?.name ?? "Country"}
        subtitle="Currency, bidding band, withdrawal limits and referral rewards"
        action={
          <Button type="submit" form="country-form" loading={save.isPending} disabled={!dirty || errors.length > 0 || !canWrite}>
            Save country
          </Button>
        }
      />
      <form id="country-form" onSubmit={submit} className="p-5 pt-4">
        {country.isLoading || !data ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-2/3" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Country name">
                <Input
                  value={draft.name}
                  onChange={(e) => {
                    setDraft((d) => ({ ...d, name: e.target.value }));
                    setDirty(true);
                  }}
                />
              </Field>
              <Field label="Code" hint="Fixed once created">
                <Input value={data.code ?? ""} disabled />
              </Field>
              <Field label="Currency" hint="Fixed once created">
                <Input value={`${String(data.currencyName ?? "")} (${String(data.currencyCode ?? data.currency ?? "")})`} disabled />
              </Field>
              <MoneyInput label="Exchange rate" hint="Local currency for one US dollar" kobo={draft.config.exchangeRate} onChange={(v) => setConfig("exchangeRate", v)} />
            </div>

            <SectionTitle title="Bidding" hint="How far a rider's counter offer may move from the quoted price" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <NumberInput label="Minimum offer" hint="Lowest bid as a share of the quote" unit="%" min={0} max={100} value={draft.config.minimumOfferPercentage} onChange={(v) => setConfig("minimumOfferPercentage", v)} />
              <NumberInput label="Rider surge cap" hint="Highest bid above the quote" unit="%" min={0} max={100} value={draft.config.maxRiderSurgePercentage} onChange={(v) => setConfig("maxRiderSurgePercentage", v)} />
            </div>

            <SectionTitle title="Courier withdrawal limits" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <MoneyInput label="Minimum withdrawal" kobo={draft.config.userWithdrawalLimits?.minimumAmount} onChange={(v) => setLimit("userWithdrawalLimits", "minimumAmount", v)} />
              <MoneyInput label="Maximum withdrawal" kobo={draft.config.userWithdrawalLimits?.maximumAmount} onChange={(v) => setLimit("userWithdrawalLimits", "maximumAmount", v)} />
            </div>

            <SectionTitle title="Business withdrawal limits" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <MoneyInput label="Minimum withdrawal" kobo={draft.config.businessWithdrawalLimits?.minimumAmount} onChange={(v) => setLimit("businessWithdrawalLimits", "minimumAmount", v)} />
              <MoneyInput label="Maximum withdrawal" kobo={draft.config.businessWithdrawalLimits?.maximumAmount} onChange={(v) => setLimit("businessWithdrawalLimits", "maximumAmount", v)} />
            </div>

            <SectionTitle title="Refer and earn" hint="Credit the referrer once the person they invited completes enough orders" />
            <div className="mb-3">
              <Switch checked={Boolean(draft.config.referAndEarn)} onChange={(v) => setConfig("referAndEarn", v)} label="Referral rewards on" />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <MoneyInput label="Reward amount" kobo={draft.config.referralEarnAmount} onChange={(v) => setConfig("referralEarnAmount", v)} />
              <NumberInput label="Orders required before earning" hint="0 pays out on sign up" min={0} step={1} value={draft.config.ordersRequiredBeforeEarn} onChange={(v) => setConfig("ordersRequiredBeforeEarn", Math.round(v))} />
            </div>

            {errors.length ? (
              <ul className="mt-4 space-y-1">
                {errors.map((error) => (
                  <li key={error} className="text-xs font-semibold text-danger">
                    {error}
                  </li>
                ))}
              </ul>
            ) : null}
          </>
        )}
      </form>
    </Panel>
  );
}

function AddCountryDrawer({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (id: string) => void }) {
  const canWrite = useCan().can("settings.write");
  const [form, setForm] = useState({ name: "", code: "", currencyName: "", currencyCode: "" });
  const create = useAction((body: Record<string, unknown>) => settings.createCountry(body), {
    success: "Country added",
    invalidate: [["settings"]],
    onSuccess: (country) => {
      setForm({ name: "", code: "", currencyName: "", currencyCode: "" });
      onCreated(country._id);
    },
  });
  const valid = form.name.trim() && form.code.trim() && form.currencyName.trim() && form.currencyCode.trim();
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!valid) return;
    create.mutate({ name: form.name.trim(), code: form.code.trim().toUpperCase(), currencyName: form.currencyName.trim(), currencyCode: form.currencyCode.trim().toUpperCase() });
  };
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Add country"
      subtitle="Code and currency cannot change afterwards"
      width="sm"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="add-country" loading={create.isPending} disabled={!valid || !canWrite}>
            Add country
          </Button>
        </div>
      }
    >
      <form id="add-country" onSubmit={submit} className="space-y-4">
        <Field label="Country name">
          <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Nigeria" />
        </Field>
        <Field label="Code" hint="ISO 3166 two letter code">
          <Input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} placeholder="NG" maxLength={3} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Currency name">
            <Input value={form.currencyName} onChange={(e) => setForm((f) => ({ ...f, currencyName: e.target.value }))} placeholder="Naira" />
          </Field>
          <Field label="Currency code">
            <Input value={form.currencyCode} onChange={(e) => setForm((f) => ({ ...f, currencyCode: e.target.value }))} placeholder="NGN" maxLength={3} />
          </Field>
        </div>
      </form>
    </Drawer>
  );
}

// ── States ────────────────────────────────────────────────────────────────────

function StatesPanel({ countryId, onOpen, onAdd }: { countryId: string; onOpen: (id: string) => void; onAdd: () => void }) {
  const states = useStates(countryId);
  const list = asArray(states.data);
  return (
    <Panel>
      <PanelHeader
        title="States"
        subtitle="Per-state pricing, dispatch, location updates and arrival rules"
        action={
          <Button size="sm" variant="outline" icon={Plus} onClick={onAdd}>
            Add state
          </Button>
        }
      />
      <div className="p-3">
        {states.isError ? (
          <ErrorState message={errorMessage(states.error)} onRetry={() => void states.refetch()} />
        ) : states.isLoading ? (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : !list.length ? (
          <EmptyState compact icon={MapPin} title="No states yet" description="Add a state, then set its pricing and dispatch rules." />
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {list.map((state) => {
              const config = (state.config ?? {}) as StateConfig;
              return (
                <button
                  key={state._id}
                  type="button"
                  onClick={() => onOpen(state._id)}
                  className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3 text-left transition-colors hover:border-line-strong hover:bg-card"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-dark">
                    <MapPin size={16} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-ink">{state.name}</span>
                    <span className="block truncate text-[11px] text-ink-muted">
                      {String(state.code ?? "")} · {naira(config.basePricePerKm)}/km · min {naira(config.minimumOrderPrice)}
                    </span>
                  </span>
                  <span className="flex flex-col items-end gap-1">
                    {config.queueOrderByDefault ? <Badge tone="info">Queue</Badge> : null}
                    <ChevronRight size={14} className="text-ink-faint" />
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </Panel>
  );
}

function AddStateDrawer({ countryId, open, onClose, onCreated }: { countryId: string; open: boolean; onClose: () => void; onCreated: (id: string) => void }) {
  const canWrite = useCan().can("settings.write");
  const [form, setForm] = useState({ name: "", code: "" });
  const [pendingCode, setPendingCode] = useState<string | null>(null);
  const states = useStates(countryId);
  const create = useAction((body: { name: string; code: string }[]) => settingsExtra.createStates(countryId, body), {
    success: "State added. Now set its pricing.",
    invalidate: [["settings", "states", countryId]],
    onSuccess: (_data, vars) => {
      setPendingCode(vars[0].code);
      setForm({ name: "", code: "" });
    },
  });

  // The create call answers with name and code only; once the list refetches we
  // open the new state so its config can be filled straight away.
  useEffect(() => {
    if (!pendingCode) return;
    const created = asArray(states.data).find((s) => String(s.code ?? "").toUpperCase() === pendingCode);
    if (created) {
      setPendingCode(null);
      onCreated(created._id);
    }
  }, [pendingCode, states.data, onCreated]);

  const valid = form.name.trim() && form.code.trim();
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!valid) return;
    create.mutate([{ name: form.name.trim(), code: form.code.trim().toUpperCase() }]);
  };
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Add state"
      subtitle="Pricing and dispatch rules are set right after"
      width="sm"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="add-state" loading={create.isPending || Boolean(pendingCode)} disabled={!valid || !canWrite}>
            Add state
          </Button>
        </div>
      }
    >
      <form id="add-state" onSubmit={submit} className="space-y-4">
        <Field label="State name">
          <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Enugu" />
        </Field>
        <Field label="Code" hint="Short code the apps send, for example EN">
          <Input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} placeholder="EN" maxLength={4} />
        </Field>
      </form>
    </Drawer>
  );
}

type StateDraft = { name: string; config: Required<StateConfig> };

function draftFromState(state: CountryState | undefined): StateDraft {
  const c = ((state?.config ?? {}) as StateConfig) ?? {};
  return {
    name: state?.name ?? "",
    config: {
      basePricePerKm: c.basePricePerKm ?? 0,
      baseFuelPrice: c.baseFuelPrice ?? 0,
      currentFuelPrice: c.currentFuelPrice ?? 0,
      percentageCharge: c.percentageCharge ?? 0,
      serviceCharge: c.serviceCharge ?? 0,
      minimumOrderPrice: c.minimumOrderPrice ?? 0,
      distanceTaperThreshold: c.distanceTaperThreshold ?? 300000,
      distanceTaperBeyondRate: c.distanceTaperBeyondRate ?? 18000,
      maxRidersPerQuery: c.maxRidersPerQuery ?? 5,
      maxActiveOrders: c.maxActiveOrders ?? 1,
      maxDistanceRadius: c.maxDistanceRadius ?? 20,
      queueOrderByDefault: c.queueOrderByDefault ?? false,
      locationUpdateEnabled: c.locationUpdateEnabled ?? false,
      locationUpdateFreeRadiusMeters: c.locationUpdateFreeRadiusMeters ?? 500,
      locationUpdateMaxPerLocation: c.locationUpdateMaxPerLocation ?? 1,
      locationUpdateMaxDeclinesPerLocation: c.locationUpdateMaxDeclinesPerLocation ?? 2,
      locationUpdateRiderAcceptTimeoutSec: c.locationUpdateRiderAcceptTimeoutSec ?? 240,
      arrivalGateEnabled: c.arrivalGateEnabled ?? false,
      arrivalRadiusMeters: c.arrivalRadiusMeters ?? 40,
      etaEnabled: c.etaEnabled ?? true,
      etaAverageSpeedKmh: c.etaAverageSpeedKmh ?? 25,
    },
  };
}

function StateDrawer({ countryId, stateId, onClose }: { countryId: string; stateId?: string; onClose: () => void }) {
  const canWrite = useCan().can("settings.write");
  const states = useStates(countryId);
  const state = useMemo(() => asArray(states.data).find((s) => s._id === stateId), [states.data, stateId]);
  const [draft, setDraft] = useState<StateDraft>(() => draftFromState(undefined));
  const [dirty, setDirty] = useState(false);
  const stamp = `${state?._id ?? ""}:${String(state?.updatedAt ?? "")}`;

  useEffect(() => {
    setDraft(draftFromState(state));
    setDirty(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stamp]);

  const save = useAction((body: Record<string, unknown>) => settings.updateState(countryId, stateId ?? "", body), {
    success: "State saved",
    invalidate: [["settings"], ["delivery-price"]],
    onSuccess: () => setDirty(false),
  });

  const set = <K extends keyof StateConfig>(key: K, value: NonNullable<StateConfig[K]>) => {
    setDraft((d) => ({ ...d, config: { ...d.config, [key]: value } }));
    setDirty(true);
  };
  const c = draft.config;

  const errors = useMemo(() => {
    const out: string[] = [];
    if (!draft.name.trim()) out.push("State name is required.");
    if (c.percentageCharge < 0 || c.percentageCharge > 100) out.push("Percentage charge must be between 0 and 100.");
    if (c.maxRidersPerQuery < 1) out.push("At least one rider must be searchable.");
    if (c.maxActiveOrders < 1) out.push("Riders need at least one active order slot.");
    if (c.maxDistanceRadius < 1) out.push("Search radius must be at least 1 km.");
    if (c.locationUpdateFreeRadiusMeters < 1) out.push("Free radius must be at least 1 metre.");
    if (c.locationUpdateMaxPerLocation < 1) out.push("Allow at least one location update per stop.");
    if (c.locationUpdateMaxDeclinesPerLocation < 1) out.push("Allow at least one decline per stop.");
    if (c.locationUpdateRiderAcceptTimeoutSec < 30) out.push("Rider accept timeout must be at least 30 seconds.");
    if (c.arrivalRadiusMeters < 1) out.push("Arrival radius must be at least 1 metre.");
    if (c.etaAverageSpeedKmh < 1) out.push("Average speed must be at least 1 km/h.");
    return out;
  }, [draft.name, c]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (errors.length || !stateId) return;
    save.mutate({ name: draft.name.trim(), config: draft.config });
  };

  return (
    <Drawer
      open={Boolean(stateId)}
      onClose={onClose}
      title={state?.name ?? "State"}
      subtitle={state ? `${String(state.code ?? "")} · pricing, dispatch, location updates and arrival` : undefined}
      width="lg"
      footer={
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-ink-faint">{errors.length ? errors[0] : dirty ? "Unsaved changes" : "Saved"}</span>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
            <Button type="submit" form="state-form" loading={save.isPending} disabled={!dirty || errors.length > 0 || !canWrite}>
              Save state
            </Button>
          </div>
        </div>
      }
    >
      {stateId && !state && states.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : stateId && !state && !states.isLoading ? (
        <ErrorState message="That state is not in this country." />
      ) : (
        <form id="state-form" onSubmit={submit}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="State name">
              <Input
                value={draft.name}
                onChange={(e) => {
                  setDraft((d) => ({ ...d, name: e.target.value }));
                  setDirty(true);
                }}
              />
            </Field>
            <Field label="Code" hint="Fixed once created">
              <Input value={String(state?.code ?? "")} disabled />
            </Field>
          </div>

          <SectionTitle title="Pricing" hint="Fuel moves the per-km rate: rate is scaled by current fuel over base fuel" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <MoneyInput label="Base rate per km" kobo={c.basePricePerKm} onChange={(v) => set("basePricePerKm", v)} />
            <MoneyInput label="Base fuel price" hint="Per litre when the rate was set" kobo={c.baseFuelPrice} onChange={(v) => set("baseFuelPrice", v)} />
            <MoneyInput label="Current fuel price" hint="Per litre today" kobo={c.currentFuelPrice} onChange={(v) => set("currentFuelPrice", v)} />
            <MoneyInput label="Minimum order price" hint="Floor for any delivery" kobo={c.minimumOrderPrice} onChange={(v) => set("minimumOrderPrice", v)} />
            <MoneyInput label="Service charge" hint="Flat platform fee per order" kobo={c.serviceCharge} onChange={(v) => set("serviceCharge", v)} />
            <NumberInput label="Percentage charge" hint="Platform share of the fare" unit="%" min={0} max={100} value={c.percentageCharge} onChange={(v) => set("percentageCharge", v)} />
          </div>

          <SectionTitle title="Distance fee taper" hint="Up to the threshold the full per-km rate applies; beyond it the flat rate per km takes over, with no jump at the threshold" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <MoneyInput label="Taper threshold" hint="Raw distance price where the taper starts" kobo={c.distanceTaperThreshold} onChange={(v) => set("distanceTaperThreshold", v)} />
            <MoneyInput label="Beyond-threshold rate per km" kobo={c.distanceTaperBeyondRate} onChange={(v) => set("distanceTaperBeyondRate", v)} />
          </div>

          <SectionTitle title="Dispatch" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <NumberInput label="Max searchable riders" hint="Riders rung per search" min={1} step={1} value={c.maxRidersPerQuery} onChange={(v) => set("maxRidersPerQuery", Math.round(v))} />
            <NumberInput label="Max active orders per rider" min={1} step={1} value={c.maxActiveOrders} onChange={(v) => set("maxActiveOrders", Math.round(v))} />
            <NumberInput label="Max search radius" unit="km" min={1} value={c.maxDistanceRadius} onChange={(v) => set("maxDistanceRadius", v)} />
          </div>
          <div className="mt-3">
            <Switch checked={c.queueOrderByDefault} onChange={(v) => set("queueOrderByDefault", v)} label="Queue orders by default when no rider is free" />
          </div>

          <SectionTitle title="Mid-order location update" hint="Lets a customer move a stop mid-order for a fee; the rider must accept" />
          <div className="mb-3">
            <Switch checked={c.locationUpdateEnabled} onChange={(v) => set("locationUpdateEnabled", v)} label="Location updates on" />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <NumberInput label="Free radius" hint="Route change within this is free" unit="m" min={1} step={1} value={c.locationUpdateFreeRadiusMeters} onChange={(v) => set("locationUpdateFreeRadiusMeters", Math.round(v))} />
            <NumberInput label="Max updates per stop" min={1} step={1} value={c.locationUpdateMaxPerLocation} onChange={(v) => set("locationUpdateMaxPerLocation", Math.round(v))} />
            <NumberInput label="Max rider declines per stop" min={1} step={1} value={c.locationUpdateMaxDeclinesPerLocation} onChange={(v) => set("locationUpdateMaxDeclinesPerLocation", Math.round(v))} />
            <NumberInput label="Rider accept timeout" hint="Auto declines and refunds after this" unit="sec" min={30} step={1} value={c.locationUpdateRiderAcceptTimeoutSec} onChange={(v) => set("locationUpdateRiderAcceptTimeoutSec", Math.round(v))} />
          </div>

          <SectionTitle title="Arrival gate and ETA" hint="The gate blocks the rider's ARRIVED action until they are within the radius; ETA uses the average speed" />
          <div className="mb-3 flex flex-wrap gap-6">
            <Switch checked={c.arrivalGateEnabled} onChange={(v) => set("arrivalGateEnabled", v)} label="Arrival gate on" />
            <Switch checked={c.etaEnabled} onChange={(v) => set("etaEnabled", v)} label="Show ETA to customers" />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <NumberInput label="Arrival radius" unit="m" min={1} step={1} value={c.arrivalRadiusMeters} onChange={(v) => set("arrivalRadiusMeters", Math.round(v))} />
            <NumberInput label="ETA average speed" unit="km/h" min={1} value={c.etaAverageSpeedKmh} onChange={(v) => set("etaAverageSpeedKmh", v)} />
          </div>

          {errors.length ? (
            <ul className="mt-4 space-y-1">
              {errors.map((error) => (
                <li key={error} className="text-xs font-semibold text-danger">
                  {error}
                </li>
              ))}
            </ul>
          ) : null}
        </form>
      )}
    </Drawer>
  );
}
