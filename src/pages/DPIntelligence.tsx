import dynamic from 'next/dynamic';

const DPIntelligenceCenter = dynamic(
  () => import('@/modules/dp-intelligence/DPIntelligenceCenter'),
  {
    ssr: false,
    loading: () => <p>Carregando módulo DP Intelligence...</p>,
  }
);

export default function DPIntelligencePage() {
  return <DPIntelligenceCenter />;
}
