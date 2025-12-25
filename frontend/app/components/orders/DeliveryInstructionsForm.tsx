"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AppDispatch, RootState } from "@/app/store/Store";
import { saveDeliveryInstructions, getDeliveryInstructions, updateDeliveryInstructions } from "@/app/features/orders/deliveryApi";
import { DeliveryInstructions } from "@/app/features/orders/deliveryApi";
import { MessageSquare, Clock, Package, Phone } from "lucide-react";
import { toast } from "react-hot-toast";

interface DeliveryInstructionsFormProps {
  orderId: string;
  isEditable?: boolean;
}

export default function DeliveryInstructionsForm({ orderId, isEditable = true }: DeliveryInstructionsFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.orders);
  
  const [instructions, setInstructions] = useState<DeliveryInstructions>({
    orderId,
    instructions: '',
    preferredTime: '',
    specialHandling: '',
    contactPreference: 'phone'
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchInstructions = async () => {
      try {
        const result = await dispatch(getDeliveryInstructions(orderId)).unwrap();
        if (result) {
          setInstructions(result);
          setIsEditing(false);
        }
      } catch (error) {
        // No instructions exist, that's fine
      }
    };

    if (orderId) {
      fetchInstructions();
    }
  }, [dispatch, orderId]);

  const handleSave = async () => {
    if (!instructions.instructions.trim()) {
      toast.error('Please provide delivery instructions');
      return;
    }

    setSaving(true);
    try {
      if (instructions.id) {
        await dispatch(updateDeliveryInstructions({ orderId, instructions })).unwrap();
        toast.success('Delivery instructions updated successfully!');
      } else {
        await dispatch(saveDeliveryInstructions(instructions)).unwrap();
        toast.success('Delivery instructions saved successfully!');
      }
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error || 'Failed to save delivery instructions');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (!instructions.id) {
      // Reset to empty if no existing instructions
      setInstructions({
        orderId,
        instructions: '',
        preferredTime: '',
        specialHandling: '',
        contactPreference: 'phone'
      });
    }
    setIsEditing(false);
  };

  if (!isEditable && !instructions.instructions) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Delivery Instructions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isEditable ? (
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Instructions</Label>
              <p className="text-sm text-gray-600 mt-1">{instructions.instructions || 'No special instructions provided'}</p>
            </div>
            
            {instructions.preferredTime && (
              <div>
                <Label className="text-sm font-medium">Preferred Delivery Time</Label>
                <p className="text-sm text-gray-600 mt-1">{instructions.preferredTime}</p>
              </div>
            )}
            
            {instructions.specialHandling && (
              <div>
                <Label className="text-sm font-medium">Special Handling</Label>
                <p className="text-sm text-gray-600 mt-1">{instructions.specialHandling}</p>
              </div>
            )}
            
            <div>
              <Label className="text-sm font-medium">Contact Preference</Label>
              <p className="text-sm text-gray-600 mt-1 capitalize">{instructions.contactPreference}</p>
            </div>
          </div>
        ) : (
          <>
            {isEditing || !instructions.instructions ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="instructions">Delivery Instructions *</Label>
                  <Textarea
                    id="instructions"
                    placeholder="Please provide any special delivery instructions (e.g., leave at front door, call upon arrival, etc.)"
                    value={instructions.instructions}
                    onChange={(e) => setInstructions(prev => ({ ...prev, instructions: e.target.value }))}
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="preferredTime">Preferred Delivery Time</Label>
                  <Input
                    id="preferredTime"
                    placeholder="e.g., After 6 PM, Weekends only, etc."
                    value={instructions.preferredTime}
                    onChange={(e) => setInstructions(prev => ({ ...prev, preferredTime: e.target.value }))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="specialHandling">Special Handling</Label>
                  <Textarea
                    id="specialHandling"
                    placeholder="Any special handling requirements (e.g., fragile items, temperature sensitive, etc.)"
                    value={instructions.specialHandling}
                    onChange={(e) => setInstructions(prev => ({ ...prev, specialHandling: e.target.value }))}
                    className="mt-1"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="contactPreference">Preferred Contact Method</Label>
                  <Select 
                    value={instructions.contactPreference} 
                    onValueChange={(value: 'phone' | 'email' | 'text') => 
                      setInstructions(prev => ({ ...prev, contactPreference: value }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="phone">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          Phone Call
                        </div>
                      </SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="text">Text Message</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={handleSave} 
                    disabled={saving || loading}
                    className="flex-1"
                  >
                    {saving ? 'Saving...' : 'Save Instructions'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Instructions</Label>
                  <p className="text-sm text-gray-600 mt-1">{instructions.instructions}</p>
                </div>
                
                {instructions.preferredTime && (
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <Label className="text-sm font-medium">Preferred Time</Label>
                      <p className="text-sm text-gray-600 mt-1">{instructions.preferredTime}</p>
                    </div>
                  </div>
                )}
                
                {instructions.specialHandling && (
                  <div className="flex items-start gap-2">
                    <Package className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <Label className="text-sm font-medium">Special Handling</Label>
                      <p className="text-sm text-gray-600 mt-1">{instructions.specialHandling}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <Label className="text-sm font-medium">Contact Preference</Label>
                    <p className="text-sm text-gray-600 mt-1 capitalize">{instructions.contactPreference}</p>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(true)}
                  className="mt-4"
                >
                  Edit Instructions
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
