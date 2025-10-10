interface ModuleDetailProps {
  title: string;
  description: string;
}

const ModuleDetail = ({ title, description }: ModuleDetailProps) => {
  return (
    <div>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
};

export default ModuleDetail;
