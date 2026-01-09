/**
 * useTimeTracking - Hook para controle de ponto com geolocalização
 * MVP: Integração com Supabase + Geolocation API
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export type ClockType = 'entry' | 'lunch_start' | 'lunch_end' | 'exit';

export interface TimeRecord {
  id: string;
  employee_id: string;
  employee_name?: string;
  tracking_date: string;
  clock_in: string | null;
  lunch_out: string | null;
  lunch_in: string | null;
  clock_out: string | null;
  worked_hours: number;
  overtime_hours: number;
  status: 'normal' | 'late' | 'absent' | 'vacation' | 'off';
  location_lat?: number;
  location_lng?: number;
  location_address?: string;
  is_remote: boolean;
}

export interface GeolocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  address?: string;
}

export interface ClockStats {
  presentToday: number;
  lateToday: number;
  onVacation: number;
  totalBankHours: number;
}

export function useTimeTracking() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [records, setRecords] = useState<TimeRecord[]>([]);
  const [todayRecord, setTodayRecord] = useState<TimeRecord | null>(null);
  const [stats, setStats] = useState<ClockStats>({
    presentToday: 0,
    lateToday: 0,
    onVacation: 0,
    totalBankHours: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isClocking, setIsClocking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<GeolocationData | null>(null);

  // Obter localização atual
  const getLocation = useCallback(async (): Promise<GeolocationData | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        toast({
          title: 'Geolocalização não suportada',
          description: 'Seu navegador não suporta geolocalização.',
          variant: 'destructive',
        });
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const data: GeolocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };

          // Tentar obter endereço reverso (opcional)
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${data.latitude}&lon=${data.longitude}&format=json`
            );
            if (response.ok) {
              const json = await response.json();
              data.address = json.display_name;
            }
          } catch {
            // Endereço é opcional
          }

          setCurrentLocation(data);
          resolve(data);
        },
        (error) => {
          console.warn('Geolocation error:', error);
          toast({
            title: 'Localização não disponível',
            description: 'Verifique se permitiu acesso à localização.',
            variant: 'destructive',
          });
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  }, [toast]);

  // Carregar registros de ponto
  const loadRecords = useCallback(async (date?: string) => {
    setIsLoading(true);
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('hr_time_tracking')
        .select(`
          *,
          hr_employees (
            full_name
          )
        `)
        .eq('tracking_date', targetDate)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedRecords: TimeRecord[] = (data || []).map((r: any) => ({
        id: r.id,
        employee_id: r.employee_id,
        employee_name: r.hr_employees?.full_name || 'Desconhecido',
        tracking_date: r.tracking_date,
        clock_in: r.clock_in_1 || null,
        lunch_out: r.clock_out_1 || null,
        lunch_in: r.clock_in_2 || null,
        clock_out: r.clock_out_2 || null,
        worked_hours: r.worked_hours || 0,
        overtime_hours: r.overtime_hours || 0,
        status: (r.status as TimeRecord['status']) || 'normal',
        location_lat: r.geolocation_data?.lat,
        location_lng: r.geolocation_data?.lng,
        location_address: r.geolocation_data?.address,
        is_remote: r.is_offshore || false,
      }));

      setRecords(formattedRecords);

      // Calcular stats
      const present = formattedRecords.filter(r => r.clock_in).length;
      const late = formattedRecords.filter(r => r.status === 'late').length;
      const vacation = formattedRecords.filter(r => r.status === 'vacation').length;
      
      setStats({
        presentToday: present,
        lateToday: late,
        onVacation: vacation,
        totalBankHours: formattedRecords.reduce((acc, r) => acc + (r.overtime_hours || 0), 0),
      });
    } catch (error) {
      console.error('Error loading time records:', error);
      toast({
        title: 'Erro ao carregar registros',
        description: 'Não foi possível carregar os registros de ponto.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Carregar registro do dia para o usuário atual
  const loadTodayRecord = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Primeiro, buscar o employee_id do usuário
      const { data: employee } = await supabase
        .from('hr_employees')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!employee) return;

      const { data, error } = await supabase
        .from('hr_time_tracking')
        .select('*')
        .eq('employee_id', employee.id)
        .eq('tracking_date', today)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setTodayRecord({
          id: data.id,
          employee_id: data.employee_id || '',
          tracking_date: data.tracking_date,
          clock_in: data.clock_in_1 || null,
          lunch_out: data.clock_out_1 || null,
          lunch_in: data.clock_in_2 || null,
          clock_out: data.clock_out_2 || null,
          worked_hours: data.worked_hours || 0,
          overtime_hours: data.overtime_hours || 0,
          status: (data.status as TimeRecord['status']) || 'normal',
          location_lat: (data.geolocation_data as any)?.lat,
          location_lng: (data.geolocation_data as any)?.lng,
          location_address: (data.geolocation_data as any)?.address,
          is_remote: data.is_offshore || false,
        });
      }
    } catch (error) {
      console.error('Error loading today record:', error);
    }
  }, [user?.id]);

  // Registrar ponto
  const clockIn = useCallback(async (type: ClockType): Promise<boolean> => {
    if (!user?.id) {
      toast({
        title: 'Não autenticado',
        description: 'Faça login para registrar ponto.',
        variant: 'destructive',
      });
      return false;
    }

    setIsClocking(true);
    
    try {
      // Obter localização
      const location = await getLocation();
      
      // Buscar employee_id
      const { data: employee } = await supabase
        .from('hr_employees')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!employee) {
        toast({
          title: 'Cadastro não encontrado',
          description: 'Seu cadastro de colaborador não foi encontrado.',
          variant: 'destructive',
        });
        return false;
      }

      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();
      const currentTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

      // Verificar se já existe registro
      const { data: existing } = await supabase
        .from('hr_time_tracking')
        .select('id, clock_in, lunch_out, lunch_in, clock_out')
        .eq('employee_id', employee.id)
        .eq('tracking_date', today)
        .single();

      const clockFieldMap: Record<ClockType, string> = {
        entry: 'clock_in_1',
        lunch_start: 'clock_out_1',
        lunch_end: 'clock_in_2',
        exit: 'clock_out_2',
      };

      const field = clockFieldMap[type];
      const updateData: Record<string, any> = {
        [field]: currentTime,
        updated_at: now,
      };

      if (location) {
        updateData.geolocation_data = {
          lat: location.latitude,
          lng: location.longitude,
          address: location.address,
        };
      }

      // Detectar se é remoto (fora do escritório)
      updateData.is_offshore = true;

      // Verificar atraso (entrada após 08:10)
      if (type === 'entry') {
        const [hour, minute] = currentTime.split(':').map(Number);
        if (hour > 8 || (hour === 8 && minute > 10)) {
          updateData.status = 'late';
        } else {
          updateData.status = 'normal';
        }
      }

      // Verificar se já existe registro
      const { data: existing } = await supabase
        .from('hr_time_tracking')
        .select('id')
        .eq('employee_id', employee.id)
        .eq('tracking_date', today)
        .maybeSingle();

      if (existing) {
        // Atualizar registro existente
        const { error } = await supabase
          .from('hr_time_tracking')
          .update(updateData)
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Criar novo registro
        const { error } = await supabase
          .from('hr_time_tracking')
          .insert({
            employee_id: employee.id,
            tracking_date: today,
            ...updateData,
            created_at: now,
          });

        if (error) throw error;
      }

      const typeLabels: Record<ClockType, string> = {
        entry: 'Entrada',
        lunch_start: 'Saída para almoço',
        lunch_end: 'Retorno do almoço',
        exit: 'Saída',
      };

      toast({
        title: `${typeLabels[type]} registrada!`,
        description: `${currentTime}${location ? ` • ${location.address?.split(',')[0] || 'Localização capturada'}` : ''}`,
      });

      // Recarregar dados
      await loadTodayRecord();
      await loadRecords();

      return true;
    } catch (error) {
      console.error('Error clocking in:', error);
      toast({
        title: 'Erro ao registrar ponto',
        description: 'Tente novamente.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsClocking(false);
    }
  }, [user?.id, getLocation, loadTodayRecord, loadRecords, toast]);

  // Calcular próximo tipo de registro
  const getNextClockType = useCallback((): ClockType | null => {
    if (!todayRecord) return 'entry';
    if (!todayRecord.clock_in) return 'entry';
    if (!todayRecord.lunch_out) return 'lunch_start';
    if (!todayRecord.lunch_in) return 'lunch_end';
    if (!todayRecord.clock_out) return 'exit';
    return null; // Todos já registrados
  }, [todayRecord]);

  // Carregar dados iniciais
  useEffect(() => {
    loadRecords();
    loadTodayRecord();
  }, [loadRecords, loadTodayRecord]);

  return {
    records,
    todayRecord,
    stats,
    isLoading,
    isClocking,
    currentLocation,
    clockIn,
    loadRecords,
    loadTodayRecord,
    getLocation,
    getNextClockType,
  };
}
