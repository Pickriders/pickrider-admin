import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Suspense } from "react";
import { VerificationPanel } from "./VerificationPanel";
import { RejectVerificationModal } from "@/components/RejectVerificationModal";

const VerificationPage = ({ params }: { params: { id: string } }) => {
  if (!params.id) {
    notFound();
  }

  return (
    <div>
      <Link
        href={`/couriers/${params.id}/details`}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={16} />
        Back to courier
      </Link>
      <h1 className="mt-3 font-clash-display text-2xl font-semibold text-foreground">Licence verification</h1>
      <p className="mt-1 text-sm text-muted-foreground">Review and approve the courier&apos;s driver&apos;s licence.</p>

      <div className="mt-6">
        <VerificationPanel userId={params.id} />
      </div>

      {/* Reject modal */}
      <Suspense>
        <RejectVerificationModal />
      </Suspense>
    </div>
  );
};
export default VerificationPage;
