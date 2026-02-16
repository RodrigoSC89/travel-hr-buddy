import { CrewCompetencyMatrix } from "@/components/crew/CrewCompetencyMatrix";
const CrewCompetencyPage = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold">Crew Competency Matrix</h1>
      <p className="text-muted-foreground">STCW skills mapping, gap analysis, and training needs assessment</p>
    </div>
    <CrewCompetencyMatrix />
  </div>
);
export default CrewCompetencyPage;
