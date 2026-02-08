/**
 * Hook para dados reais de Farmácia/Medicamentos
 * Usa tabela inventory_items para dados de medicamentos
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import { differenceInDays, isPast, format } from "date-fns";
import { useState } from "react";

export interface Medication {
  id: string;
  name: string;
  genericName: string;
  category: string;
  form: string;
  strength: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  batchNumber: string;
  expiryDate: string;
  manufacturer: string;
  storageCondition: string;
  controlledSubstance: boolean;
  location: string;
  lastRestock: string;
  pricePerUnit: number;
}

export function usePharmacyData() {
  const queryClient = useQueryClient();
  const [localMedications, setLocalMedications] = useState<Medication[]>([]);

  // Fetch from inventory_items table
  const { data: inventoryItems = [], isLoading: loadingInventory } = useQuery({
    queryKey: ["pharmacy-inventory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory_items")
        .select("*")
        .ilike("category", "%medic%")
        .order("item_code");

      if (error) {
        logger.warn("Using local pharmacy data: " + error.message);
        return [];
      }

      return (data || []).map((item): Medication => ({
        id: item.id,
        name: item.name || item.item_code || "Item",
        genericName: (item.metadata as Record<string, unknown>)?.generic_name as string || item.name || "",
        category: item.category || "Medicamento",
        form: (item.metadata as Record<string, unknown>)?.form as string || "Comprimido",
        strength: (item.metadata as Record<string, unknown>)?.strength as string || "",
        currentStock: item.quantity || 0,
        minStock: item.min_quantity || 10,
        maxStock: item.max_quantity || 100,
        unit: item.unit || "un",
        batchNumber: (item.metadata as Record<string, unknown>)?.batch as string || "",
        expiryDate: (item.metadata as Record<string, unknown>)?.expiry as string || format(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
        manufacturer: (item.metadata as Record<string, unknown>)?.manufacturer as string || "Não informado",
        storageCondition: (item.metadata as Record<string, unknown>)?.storage as string || "Temperatura ambiente",
        controlledSubstance: (item.metadata as Record<string, unknown>)?.controlled as boolean || false,
        location: item.location || "Farmácia",
        lastRestock: item.updated_at || item.created_at,
        pricePerUnit: (item.metadata as Record<string, unknown>)?.price as number || 0,
      }));
    },
    staleTime: 30000,
  });

  // Combine database and local medications
  const allMedications = [...inventoryItems, ...localMedications];

  // Add medication
  const addMedication = useMutation({
    mutationFn: async (med: Partial<Medication>) => {
      const itemCode = "MED-" + Date.now();
      const { data, error } = await supabase
        .from("inventory_items")
        .insert({
          item_code: itemCode,
          name: med.name || itemCode,
          category: med.category || "Medicamento",
          quantity: med.currentStock || 0,
          min_quantity: med.minStock || 10,
          max_quantity: med.maxStock || 100,
          unit: med.unit || "un",
          location: med.location,
          metadata: {
            generic_name: med.genericName,
            form: med.form,
            strength: med.strength,
            manufacturer: med.manufacturer,
            storage: med.storageCondition,
            controlled: med.controlledSubstance,
            batch: med.batchNumber,
            expiry: med.expiryDate,
            price: med.pricePerUnit,
          },
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pharmacy-inventory"] });
      toast.success("Medicamento adicionado com sucesso");
    },
    onError: (error) => {
      toast.error("Erro ao adicionar medicamento: " + error.message);
    },
  });

  // Update stock (dispense)
  const dispenseStock = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number; reason: string }) => {
      const medication = allMedications.find((m) => m.id === id);
      if (!medication) throw new Error("Medicamento não encontrado");

      const newQuantity = medication.currentStock - quantity;
      if (newQuantity < 0) throw new Error("Quantidade insuficiente em estoque");

      const { error } = await supabase
        .from("inventory_items")
        .update({ 
          quantity: newQuantity,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pharmacy-inventory"] });
      toast.success("Medicamento dispensado com sucesso");
    },
    onError: (error) => {
      toast.error("Erro ao dispensar: " + error.message);
    },
  });

  // Restock
  const restockMedication = useMutation({
    mutationFn: async ({ id, quantity, batchNumber, expiryDate }: { 
      id: string; 
      quantity: number; 
      batchNumber: string;
      expiryDate: string;
    }) => {
      const medication = allMedications.find((m) => m.id === id);
      if (!medication) throw new Error("Medicamento não encontrado");

      const newQuantity = medication.currentStock + quantity;

      // Get current metadata first
      const { data: currentItem } = await supabase
        .from("inventory_items")
        .select("metadata")
        .eq("id", id)
        .single();

      const currentMetadata = (currentItem?.metadata as Record<string, unknown>) || {};

      const { error } = await supabase
        .from("inventory_items")
        .update({ 
          quantity: newQuantity,
          updated_at: new Date().toISOString(),
          metadata: {
            ...currentMetadata,
            batch: batchNumber,
            expiry: expiryDate,
          },
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pharmacy-inventory"] });
      toast.success("Estoque reabastecido com sucesso");
    },
    onError: (error) => {
      toast.error("Erro ao reabastecer: " + error.message);
    },
  });

  // Delete medication
  const deleteMedication = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("inventory_items")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pharmacy-inventory"] });
      toast.success("Medicamento removido");
    },
    onError: (error) => {
      toast.error("Erro ao remover: " + error.message);
    },
  });

  // Calculate stats
  const stats = {
    total: allMedications.length,
    lowStock: allMedications.filter((m) => m.currentStock < m.minStock).length,
    expiringSoon: allMedications.filter((m) => {
      const days = differenceInDays(new Date(m.expiryDate), new Date());
      return days <= 90 && days > 0;
    }).length,
    expired: allMedications.filter((m) => isPast(new Date(m.expiryDate))).length,
    controlled: allMedications.filter((m) => m.controlledSubstance).length,
    totalValue: allMedications.reduce((acc, m) => acc + (m.currentStock * m.pricePerUnit), 0),
  };

  return {
    medications: allMedications,
    stats,
    isLoading: loadingInventory,
    addMedication: addMedication.mutate,
    dispenseStock: dispenseStock.mutate,
    restockMedication: restockMedication.mutate,
    deleteMedication: deleteMedication.mutate,
    isAdding: addMedication.isPending,
    isDispensing: dispenseStock.isPending,
  };
}
