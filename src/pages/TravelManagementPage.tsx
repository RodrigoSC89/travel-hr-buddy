/**
 * PATCH 267 - Travel Management Page
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { travelService, type TravelItinerary, type PriceAlert } from "@/modules/travel/services/travel-service";
import { Plane, Plus, MapPin, DollarSign, Bell } from "lucide-react";

export default function TravelManagementPage() {
  const [itineraries, setItineraries] = useState<TravelItinerary[]>([]);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<TravelItinerary>>({
    tripName: '',
    origin: '',
    destination: '',
    departureDate: new Date().toISOString().split('T')[0],
    status: 'draft',
    segments: []
  });

  const [alertData, setAlertData] = useState<Partial<PriceAlert>>({
    route: '',
    targetPrice: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [itins, alts] = await Promise.all([
      travelService.getItineraries(),
      travelService.getPriceAlerts()
    ]);
    setItineraries(itins);
    setAlerts(alts);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await travelService.createItinerary(formData as TravelItinerary);
      toast.success('Itinerary created');
      setIsDialogOpen(false);
      loadData();
    } catch (error) {
      toast.error('Failed to create itinerary');
    }
  };

  const handleAlertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await travelService.createPriceAlert(alertData as PriceAlert);
      toast.success('Price alert created');
      setIsAlertDialogOpen(false);
      loadData();
    } catch (error) {
      toast.error('Failed to create price alert');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'draft': 'outline',
      'confirmed': 'default',
      'in-progress': 'secondary',
      'completed': 'secondary',
      'cancelled': 'destructive'
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Travel Management</h1>
          <p className="text-muted-foreground">Manage trips and travel bookings</p>
        </div>
      </div>

      <Tabs defaultValue="itineraries" className="w-full">
        <TabsList>
          <TabsTrigger value="itineraries">Itineraries</TabsTrigger>
          <TabsTrigger value="alerts">Price Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="itineraries" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> New Itinerary
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Travel Itinerary</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>Trip Name</Label>
                    <Input
                      value={formData.tripName}
                      onChange={(e) => setFormData({ ...formData, tripName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Origin</Label>
                      <Input
                        value={formData.origin}
                        onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label>Destination</Label>
                      <Input
                        value={formData.destination}
                        onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Departure Date</Label>
                      <Input
                        type="date"
                        value={formData.departureDate}
                        onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label>Return Date</Label>
                      <Input
                        type="date"
                        value={formData.returnDate}
                        onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full">Create Itinerary</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {itineraries.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground">
                <Plane className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No itineraries found. Create your first one!</p>
              </Card>
            ) : (
              itineraries.map((itin) => (
                <Card key={itin.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-semibold">{itin.tripName}</h3>
                        {getStatusBadge(itin.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {itin.origin} → {itin.destination}
                        </span>
                        <span>📅 {new Date(itin.departureDate).toLocaleDateString()}</span>
                        {itin.totalCost && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            ${itin.totalCost}
                          </span>
                        )}
                      </div>
                      {itin.bookingReference && (
                        <p className="text-xs text-muted-foreground">
                          Booking Ref: {itin.bookingReference}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Bell className="mr-2 h-4 w-4" /> New Alert
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Price Alert</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAlertSubmit} className="space-y-4">
                  <div>
                    <Label>Route</Label>
                    <Input
                      value={alertData.route}
                      onChange={(e) => setAlertData({ ...alertData, route: e.target.value })}
                      placeholder="e.g., NYC → LON"
                      required
                    />
                  </div>
                  <div>
                    <Label>Target Price ($)</Label>
                    <Input
                      type="number"
                      value={alertData.targetPrice}
                      onChange={(e) => setAlertData({ ...alertData, targetPrice: parseFloat(e.target.value) })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">Create Alert</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {alerts.map((alert) => (
              <Card key={alert.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{alert.route}</p>
                    <p className="text-sm text-muted-foreground">
                      Target: ${alert.targetPrice}
                      {alert.currentPrice && ` | Current: $${alert.currentPrice}`}
                    </p>
                  </div>
                  {alert.alertTriggered && (
                    <Badge variant="default">Alert Triggered!</Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
