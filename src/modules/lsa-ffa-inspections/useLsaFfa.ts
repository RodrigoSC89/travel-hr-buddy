import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type {
  LSAFFAInspection,
  ChecklistTemplate,
  LSAFFAEquipment,
  ComplianceStats,
  InspectionFormData,
  InspectionType,
} from './types';

export const useLsaFfa = (vesselId?: string) => {
  const [inspections, setInspections] = useState<LSAFFAInspection[]>([]);
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [equipment, setEquipment] = useState<LSAFFAEquipment[]>([]);
  const [stats, setStats] = useState<ComplianceStats | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch inspections for a vessel
  const fetchInspections = async (vId?: string) => {
    try {
      setLoading(true);
      const vesselIdToUse = vId || vesselId;
      
      let query = supabase
        .from('lsa_ffa_inspections')
        .select('*')
        .order('date', { ascending: false });

      if (vesselIdToUse) {
        query = query.eq('vessel_id', vesselIdToUse);
      }

      const { data, error } = await query;

      if (error) throw error;
      setInspections(data || []);
    } catch (error) {
      console.error('Error fetching inspections:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch inspections',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch checklist templates
  const fetchTemplates = async (type?: InspectionType) => {
    try {
      setLoading(true);
      let query = supabase
        .from('lsa_ffa_checklist_templates')
        .select('*')
        .eq('is_active', true);

      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch checklist templates',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch equipment for an inspection
  const fetchEquipment = async (inspectionId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('lsa_ffa_equipment')
        .select('*')
        .eq('inspection_id', inspectionId)
        .order('equipment_type');

      if (error) throw error;
      setEquipment(data || []);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch equipment data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch compliance stats for a vessel
  const fetchStats = async (vId?: string) => {
    try {
      setLoading(true);
      const vesselIdToUse = vId || vesselId;
      
      if (!vesselIdToUse) return;

      const { data, error } = await supabase
        .from('lsa_ffa_compliance_stats')
        .select('*')
        .eq('vessel_id', vesselIdToUse)
        .order('period_end', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create a new inspection
  const createInspection = async (data: InspectionFormData) => {
    try {
      setLoading(true);
      
      // Calculate initial score
      const totalItems = data.checklist.length;
      const checkedItems = data.checklist.filter(item => item.checked).length;
      const score = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;

      const { data: inspection, error } = await supabase
        .from('lsa_ffa_inspections')
        .insert({
          vessel_id: data.vessel_id,
          inspector: data.inspector,
          type: data.type,
          frequency: data.frequency,
          checklist: data.checklist,
          issues_found: data.issues_found,
          score,
          status: 'draft',
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Inspection created successfully',
      });

      await fetchInspections(data.vessel_id);
      return inspection;
    } catch (error) {
      console.error('Error creating inspection:', error);
      toast({
        title: 'Error',
        description: 'Failed to create inspection',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing inspection
  const updateInspection = async (id: string, updates: Partial<LSAFFAInspection>) => {
    try {
      setLoading(true);

      // Recalculate score if checklist is updated
      if (updates.checklist) {
        const totalItems = updates.checklist.length;
        const checkedItems = updates.checklist.filter(item => item.checked).length;
        updates.score = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;
      }

      const { error } = await supabase
        .from('lsa_ffa_inspections')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Inspection updated successfully',
      });

      await fetchInspections(vesselId);
    } catch (error) {
      console.error('Error updating inspection:', error);
      toast({
        title: 'Error',
        description: 'Failed to update inspection',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete an inspection
  const deleteInspection = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('lsa_ffa_inspections')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Inspection deleted successfully',
      });

      await fetchInspections(vesselId);
    } catch (error) {
      console.error('Error deleting inspection:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete inspection',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Add equipment to inspection
  const addEquipment = async (inspectionId: string, equipmentData: Partial<LSAFFAEquipment>) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('lsa_ffa_equipment')
        .insert({
          inspection_id: inspectionId,
          ...equipmentData,
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Equipment added successfully',
      });

      await fetchEquipment(inspectionId);
    } catch (error) {
      console.error('Error adding equipment:', error);
      toast({
        title: 'Error',
        description: 'Failed to add equipment',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (vesselId) {
      fetchInspections(vesselId);
      fetchStats(vesselId);
    }
    fetchTemplates();
  }, [vesselId]);

  return {
    inspections,
    templates,
    equipment,
    stats,
    loading,
    fetchInspections,
    fetchTemplates,
    fetchEquipment,
    fetchStats,
    createInspection,
    updateInspection,
    deleteInspection,
    addEquipment,
  };
};
