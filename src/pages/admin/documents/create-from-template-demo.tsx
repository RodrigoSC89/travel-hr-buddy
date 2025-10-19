import CreateFromTemplate from './create-from-template';

/**
 * Demo page for create-from-template feature
 * Shows an example travel report template with variables
 */
export default function CreateFromTemplateDemo() {
  const exampleTemplate = {
    title: "Travel Report",
    content: `
      <h1>Travel Report for {{employee_name}}</h1>
      <p><strong>Destination:</strong> {{destination}}</p>
      <p><strong>Date:</strong> {{travel_date}}</p>
      <p><strong>Purpose:</strong> {{purpose}}</p>
      
      <h2>Summary</h2>
      <p>{{summary}}</p>
      
      <h2>Expenses</h2>
      <ul>
        <li>Transportation: {{transport_cost}}</li>
        <li>Accommodation: {{hotel_cost}}</li>
        <li>Meals: {{meal_cost}}</li>
      </ul>
      
      <h2>Conclusion</h2>
      <p>{{conclusion}}</p>
    `
  };

  return (
    <div className="container mx-auto py-8">
      <CreateFromTemplate template={exampleTemplate} />
    </div>
  );
}
