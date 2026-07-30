import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { StatesList } from "./StatesList";
import { CountryConfig } from "./CountryConfig";

const CountryDetailsPage = ({ params }: { params: { countryId: string } }) => {
  if (!params.countryId) {
    notFound();
  }

  return (
    <div>
      <Link
        href="/admin/app-settings"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={16} />
        Back to app settings
      </Link>

      <div className="mt-3">
        <h1 className="text-2xl font-semibold text-foreground">Country configuration</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Currency, pricing, withdrawal limits and referral rewards for this country.
        </p>
      </div>

      <section className="mt-6 rounded-2xl border bg-card p-6">
        <CountryConfig countryId={params.countryId} />
      </section>

      <section className="mt-6 rounded-2xl border bg-card p-6">
        <StatesList countryId={params.countryId} />
      </section>
    </div>
  );
};
export default CountryDetailsPage;
