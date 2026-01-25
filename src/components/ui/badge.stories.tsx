import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./badge";
import { CheckCircle, AlertTriangle, Clock, Ship, Anchor } from "lucide-react";

/**
 * Badge Component - NAUTI ONE v4.0
 * 
 * Compact status indicator for maritime operations.
 * Used for crew status, vessel state, compliance indicators, and alerts.
 */
const meta: Meta<typeof Badge> = {
  title: "UI/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "A versatile badge component for displaying status, labels, and counts in maritime HR management interfaces.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "outline"],
      description: "Visual style variant",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

// Default Badge
export const Default: Story = {
  args: {
    children: "Badge",
  },
};

// Secondary
export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Secondary",
  },
};

// Destructive
export const Destructive: Story = {
  args: {
    variant: "destructive",
    children: "Crítico",
  },
};

// Outline
export const Outline: Story = {
  args: {
    variant: "outline",
    children: "Outline",
  },
};

// Crew Status Badges
export const CrewStatus: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge>
        <CheckCircle className="mr-1 h-3 w-3" />
        A bordo
      </Badge>
      <Badge variant="secondary">
        <Clock className="mr-1 h-3 w-3" />
        Em férias
      </Badge>
      <Badge variant="outline">
        <Anchor className="mr-1 h-3 w-3" />
        Disponível
      </Badge>
      <Badge variant="destructive">
        <AlertTriangle className="mr-1 h-3 w-3" />
        Documentos pendentes
      </Badge>
    </div>
  ),
};

// Vessel Status
export const VesselStatus: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge>
        <Ship className="mr-1 h-3 w-3" />
        Operacional
      </Badge>
      <Badge variant="secondary">Em manutenção</Badge>
      <Badge variant="outline">Atracado</Badge>
      <Badge variant="destructive">Fora de operação</Badge>
    </div>
  ),
};

// Compliance Badges
export const ComplianceStatus: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge>MLC 2006 ✓</Badge>
      <Badge>STCW ✓</Badge>
      <Badge variant="secondary">ISM Pendente</Badge>
      <Badge variant="destructive">ISPS Expirado</Badge>
    </div>
  ),
};

// Certificate Expiry
export const CertificateExpiry: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="destructive">Expira em 7 dias</Badge>
      <Badge variant="secondary">Expira em 30 dias</Badge>
      <Badge variant="outline">Expira em 90 dias</Badge>
      <Badge>Válido</Badge>
    </div>
  ),
};

// All Variants
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
};
