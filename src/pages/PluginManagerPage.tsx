/**
 * PLUGIN MANAGER PAGE - PHASE 7
 */
import React from "react";
import { Helmet } from "react-helmet-async";
import { PluginManager } from "@/components/plugins/PluginManager";

const PluginManagerPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Gerenciador de Plugins | Nautilus One</title>
        <meta name="description" content="Sistema modular de plugins e extensões customizáveis" />
      </Helmet>
      <div className="container mx-auto p-6 max-w-7xl">
        <PluginManager />
      </div>
    </>
  );
});

export default PluginManagerPage;
