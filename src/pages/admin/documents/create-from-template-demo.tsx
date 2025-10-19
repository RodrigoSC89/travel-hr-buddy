import CreateFromTemplate from "./create-from-template";

/**
 * Demo page showing how to use the CreateFromTemplate component
 * This example uses a sample template with variables
 */
export default function CreateFromTemplateDemo() {
  // Example template with variables
  const exampleTemplate = {
    id: "demo-template-1",
    title: "Relatório de Viagem",
    content: `
      <h1>Relatório de Viagem</h1>
      
      <p><strong>Nome do Viajante:</strong> {{nome_viajante}}</p>
      <p><strong>Destino:</strong> {{destino}}</p>
      <p><strong>Data de Partida:</strong> {{data_partida}}</p>
      <p><strong>Data de Retorno:</strong> {{data_retorno}}</p>
      
      <h2>Objetivo da Viagem</h2>
      <p>{{objetivo}}</p>
      
      <h2>Atividades Realizadas</h2>
      <ul>
        <li>Reunião com equipe local</li>
        <li>Inspeção de instalações</li>
        <li>Treinamento de pessoal</li>
      </ul>
      
      <h2>Conclusões</h2>
      <p>Este relatório apresenta as principais atividades e conclusões da viagem realizada.</p>
    `,
  };

  return <CreateFromTemplate template={exampleTemplate} />;
}
