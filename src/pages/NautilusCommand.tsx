/**
 * Nautilus Command Page - Entry point for the revolutionary command center
 */

import { NautilusCommandCenter } from "@/components/nautilus/NautilusCommandCenter";
import { Helmet } from "react-helmet-async";

export default function NautilusCommand() {
  return (
    <>
      <Helmet>
        <title>Nautilus Command Center | Nautilus One</title>
        <meta 
          name="description" 
          content="Centro de comando integrado com IA para gestão marítima avançada" 
        />
      </Helmet>
      <NautilusCommandCenter />
    </>
  );
}
