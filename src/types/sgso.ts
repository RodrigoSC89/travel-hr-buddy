/**
 * SGSO (Sistema de Gestão de Segurança Operacional) Type Definitions
 * Types for IBAMA requirements and SGSO system
 */

/**
 * SGSO IBAMA Requirement
 * Official IBAMA SGSO requirement definition
 */
export interface SGSOIbamaRequirement {
  id: string;
  requirement_number: number;
  requirement_title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

/**
 * Insert type for SGSO IBAMA Requirement
 */
export interface SGSOIbamaRequirementInsert {
  id?: string;
  requirement_number: number;
  requirement_title: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Update type for SGSO IBAMA Requirement
 */
export interface SGSOIbamaRequirementUpdate {
  id?: string;
  requirement_number?: number;
  requirement_title?: string;
  description?: string;
  updated_at?: string;
}
