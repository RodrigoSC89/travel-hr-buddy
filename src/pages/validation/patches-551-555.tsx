import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Patch551Validation from "@/modules/communication/validation/Patch551Validation";
import Patch552Validation from "@/modules/incidents/validation/Patch552Validation";
import Patch553Validation from "@/modules/crew/validation/Patch553Validation";
import Patch554Validation from "@/modules/templates/validation/Patch554Validation";
import Patch555Validation from "@/modules/price-alerts/validation/Patch555Validation";

export default function Patches551to555ValidationPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">PATCHES 551-555 Validation Dashboard</CardTitle>
          <CardDescription>
            Comprehensive validation for Communication, Incidents, Crew, Templates, and Price Alerts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <Patch551Validation />
            <Patch552Validation />
            <Patch553Validation />
            <Patch554Validation />
            <Patch555Validation />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
