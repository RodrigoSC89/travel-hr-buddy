import { SparePartsCatalog } from "@/components/maintenance/SparePartsCatalog";
const SparePartsPage = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold">Spare Parts Catalog</h1>
      <p className="text-muted-foreground">Equipment spare parts inventory with cross-referencing and reorder automation</p>
    </div>
    <SparePartsCatalog />
  </div>
);
export default SparePartsPage;
