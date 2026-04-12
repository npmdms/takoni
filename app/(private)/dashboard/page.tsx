import CreateOrganization from "../components/create-organization";
import OrganizationList from "../components/organization-list";

export default function DashboardPage() {
  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col">
          <h1 className="text-xl md:text-2xl">Organization&apos;s</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <OrganizationList />
          <CreateOrganization />
        </div>
      </div>
    </>
  );
}
