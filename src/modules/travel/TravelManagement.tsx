import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Plane, Calendar, MapPin, AlertTriangle, FileText, Plus, Download, 
  Clock, DollarSign, Users, Ship 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const TravelManagement = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeBookings: 0,
    pendingApproval: 0,
    upcomingTrips: 0,
    activeConflicts: 0
  });
  const [bookings, setBookings] = useState([]);
  const [itineraries, setItineraries] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('travel_bookings')
        .select('*')
        .in('status', ['pending', 'confirmed', 'in_progress'])
        .order('departure_date', { ascending: true })
        .limit(20);

      if (bookingsError) throw bookingsError;

      // Fetch itineraries
      const { data: itinerariesData, error: itinerariesError } = await supabase
        .from('itineraries')
        .select('*, travel_bookings(*)')
        .in('status', ['draft', 'finalized', 'active'])
        .order('start_date', { ascending: true })
        .limit(20);

      if (itinerariesError) throw itinerariesError;

      // Fetch active conflicts
      const { data: conflictsData, error: conflictsError } = await supabase
        .from('travel_schedule_conflicts')
        .select('*')
        .in('resolution_status', ['unresolved', 'acknowledged'])
        .order('severity', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(20);

      if (conflictsError) throw conflictsError;

      setBookings(bookingsData || []);
      setItineraries(itinerariesData || []);
      setConflicts(conflictsData || []);

      // Calculate stats
      const pending = bookingsData?.filter((b: any) => b.status === 'pending').length || 0;
      const upcoming = bookingsData?.filter((b: any) => 
        new Date(b.departure_date) > new Date() && 
        new Date(b.departure_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      ).length || 0;

      setStats({
        activeBookings: bookingsData?.length || 0,
        pendingApproval: pending,
        upcomingTrips: upcoming,
        activeConflicts: conflictsData?.length || 0
      });

    } catch (error) {
      console.error('Error fetching travel data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load travel data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500',
      confirmed: 'bg-green-500',
      in_progress: 'bg-blue-500',
      completed: 'bg-gray-500',
      cancelled: 'bg-red-500',
      draft: 'bg-gray-400',
      finalized: 'bg-blue-400',
      active: 'bg-green-400'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-600',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-blue-500'
    };
    return colors[severity] || 'bg-gray-500';
  };

  const exportItineraryToPDF = async (itinerary: any) => {
    try {
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(20);
      doc.text('Travel Itinerary', 14, 20);
      
      // Booking details
      doc.setFontSize(12);
      doc.text(`Itinerary: ${itinerary.itinerary_name}`, 14, 35);
      doc.text(`Dates: ${format(new Date(itinerary.start_date), 'MMM dd, yyyy')} - ${format(new Date(itinerary.end_date), 'MMM dd, yyyy')}`, 14, 42);
      doc.text(`Status: ${itinerary.status}`, 14, 49);
      
      // Description
      if (itinerary.description) {
        doc.setFontSize(10);
        const splitDescription = doc.splitTextToSize(itinerary.description, 180);
        doc.text(splitDescription, 14, 60);
      }

      // Itinerary items
      if (itinerary.items && Array.isArray(itinerary.items) && itinerary.items.length > 0) {
        doc.setFontSize(14);
        doc.text('Schedule', 14, 80);
        
        const tableData = itinerary.items.map((item: any, index: number) => [
          index + 1,
          item.date || '-',
          item.activity || '-',
          item.location || '-',
          item.duration || '-'
        ]);

        (doc as any).autoTable({
          startY: 85,
          head: [['#', 'Date', 'Activity', 'Location', 'Duration']],
          body: tableData,
          theme: 'grid',
          styles: { fontSize: 9 }
        });
      }

      // Save PDF
      const fileName = `Itinerary_${itinerary.itinerary_name.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}.pdf`;
      doc.save(fileName);

      // Log export
      await supabase.from('travel_export_history').insert({
        itinerary_id: itinerary.id,
        export_type: 'pdf',
        file_name: fileName,
        exported_by: (await supabase.auth.getUser()).data.user?.id
      });

      toast({
        title: 'Success',
        description: 'Itinerary exported to PDF successfully'
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Error',
        description: 'Failed to export itinerary',
        variant: 'destructive'
      });
    }
  };

  const acknowledgeConflict = async (conflictId: string) => {
    try {
      const { error } = await supabase
        .from('travel_schedule_conflicts')
        .update({ 
          resolution_status: 'acknowledged',
          resolved_by: (await supabase.auth.getUser()).data.user?.id,
          resolved_at: new Date().toISOString()
        })
        .eq('id', conflictId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Conflict acknowledged'
      });

      fetchData();
    } catch (error) {
      console.error('Error acknowledging conflict:', error);
      toast({
        title: 'Error',
        description: 'Failed to acknowledge conflict',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Plane className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Travel Management</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            View Calendar
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Booking
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
            <Plane className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeBookings}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApproval}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Trips</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingTrips}</div>
            <p className="text-xs text-muted-foreground">Next 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Conflicts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeConflicts}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="bookings" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="itineraries">Itineraries</TabsTrigger>
          <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Travel Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading bookings...</p>
              ) : bookings.length === 0 ? (
                <p className="text-muted-foreground">No active bookings</p>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking: any) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{booking.booking_number}</h3>
                          <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                          <Badge variant="outline">{booking.booking_type}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {booking.origin_city} → {booking.destination_city}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(booking.departure_date), 'MMM dd, yyyy')}
                          </span>
                          {booking.total_cost > 0 && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              ${booking.total_cost.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">View Details</Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="itineraries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Travel Itineraries</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading itineraries...</p>
              ) : itineraries.length === 0 ? (
                <p className="text-muted-foreground">No itineraries found</p>
              ) : (
                <div className="space-y-4">
                  {itineraries.map((itinerary: any) => (
                    <div key={itinerary.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{itinerary.itinerary_name}</h3>
                          <Badge className={getStatusColor(itinerary.status)}>{itinerary.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {itinerary.description || 'No description'}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(itinerary.start_date), 'MMM dd')} - {format(new Date(itinerary.end_date), 'MMM dd, yyyy')}
                          </span>
                          {itinerary.items && Array.isArray(itinerary.items) && (
                            <span>{itinerary.items.length} activities</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => exportItineraryToPDF(itinerary)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Export PDF
                        </Button>
                        <Button variant="outline" size="sm">View</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conflicts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Schedule Conflicts</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading conflicts...</p>
              ) : conflicts.length === 0 ? (
                <p className="text-muted-foreground">No active conflicts</p>
              ) : (
                <div className="space-y-4">
                  {conflicts.map((conflict: any) => (
                    <div key={conflict.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <AlertTriangle className={`h-6 w-6 mt-1 ${getSeverityColor(conflict.severity)}`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{conflict.conflict_type.replace('_', ' ').toUpperCase()}</h3>
                          <Badge className={getSeverityColor(conflict.severity)}>{conflict.severity}</Badge>
                          <Badge variant="outline">{conflict.resolution_status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{conflict.description}</p>
                        {conflict.overlap_duration_hours && (
                          <p className="text-xs text-muted-foreground">
                            Overlap duration: {conflict.overlap_duration_hours.toFixed(1)} hours
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Detected: {format(new Date(conflict.created_at), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                      {conflict.resolution_status === 'unresolved' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => acknowledgeConflict(conflict.id)}
                        >
                          Acknowledge
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TravelManagement;
