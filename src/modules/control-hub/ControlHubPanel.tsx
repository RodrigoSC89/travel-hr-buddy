import { Card } from "@/components/ui/Card";

export default function ControlHubPanel() {
  return (
    <div className="space-y-4 p-6">
      <h2 className="text-text-base text-xl font-bold">Indicadores Técnicos</h2>
      <div className="grid grid-cols-2 gap-4">
        <Card title="DP Reliability Index"><span className='text-emerald-400 font-bold'>98.7%</span></Card>
        <Card title="ASOG Compliance Rate"><span className='text-primary-light font-bold'>99.2%</span></Card>
        <Card title="FMEA Open Actions"><span className='text-alert-warning font-bold'>4</span></Card>
      </div>
    </div>
  );
}
