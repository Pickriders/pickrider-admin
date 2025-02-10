import { UI } from "@/components/ui";
import { SettingsNavigation } from "./SettingsNavigation";

const AdminPage = () => {
  return (
    <div>
      <UI.PrimaryHeading text="Admin" />
      <section className="mt-8 bg-background rounded-2xl p-6">
        <SettingsNavigation />
      </section>
    </div>
  );
};
export default AdminPage;
