export const metadata = { title: "Privacy Policy | MERIK" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-extrabold text-slate-900">Privacy Policy</h1>
      <div className="prose prose-slate mt-6 max-w-none text-slate-600">
        <p>
          MERIK collects and processes personal information in accordance
          with the Protection of Personal Information Act (POPIA). We only
          collect information necessary to assess your loan application,
          verify your identity, and comply with our regulatory obligations.
        </p>
        <p>
          Your information is stored securely, encrypted in transit and at
          rest, and is never sold to third parties. You may request access
          to, correction of, or deletion of your personal information at any
          time, subject to our legal and regulatory retention requirements.
        </p>
        <p>
          This is placeholder legal copy for demonstration purposes and
          should be replaced with attorney-reviewed policy before this
          platform is used to originate real loans.
        </p>
      </div>
    </div>
  );
}
