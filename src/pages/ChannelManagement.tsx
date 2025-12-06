import React from "react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import ChannelManagerProfessional from "@/components/channel-manager/ChannelManagerProfessional";

const ChannelManagement = () => {
  return (
    <ModulePageWrapper gradient="purple">
      <ChannelManagerProfessional />
    </ModulePageWrapper>
  );
};

export default ChannelManagement;
