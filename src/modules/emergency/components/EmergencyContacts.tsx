import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, Radio, Satellite, Mail } from "lucide-react";
import { EmergencyContact } from "../emergency-response/types";

interface EmergencyContactsProps {
  contacts: EmergencyContact[];
}

export function EmergencyContacts({ contacts }: EmergencyContactsProps) {
  const getContactIcon = (type: string) => {
    switch (type) {
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'radio': return <Radio className="h-4 w-4" />;
      case 'satellite': return <Satellite className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      default: return <Phone className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contatos de Emergência</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {contacts
            .sort((a, b) => a.priority - b.priority)
            .map((contact) => (
              <div
                key={contact.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    {getContactIcon(contact.contactType)}
                  </div>
                  <div>
                    <p className="font-medium">{contact.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {contact.organization}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {contact.available24h && (
                    <Badge variant="default">24/7</Badge>
                  )}
                  <Button size="sm" variant="outline">
                    {contact.contactInfo}
                  </Button>
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
