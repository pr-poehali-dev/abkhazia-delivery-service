import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Icon from '@/components/ui/icon';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface OrderFormProps {
  pickupPoints: any[];
  deliveryPoints: any[];
  onSuccess?: () => void;
}

export const OrderForm = ({ pickupPoints, deliveryPoints, onSuccess }: OrderFormProps) => {
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    pickup_point_id: '',
    delivery_type: 'pickup',
    delivery_address: '',
    delivery_point_id: '',
    weight: '',
    length: '',
    width: '',
    height: '',
  });
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const calculatePrice = () => {
    const w = parseFloat(formData.weight);
    if (isNaN(w) || w <= 0) return 0;
    
    const pricePerKg = w >= 10 ? 100 : 120;
    const l = parseFloat(formData.length) || 0;
    const wi = parseFloat(formData.width) || 0;
    const h = parseFloat(formData.height) || 0;
    const volumeWeight = (l * wi * h) / 5000;
    
    const finalWeight = Math.max(w, volumeWeight);
    return Math.round(finalWeight * pricePerKg);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setQrFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setQrPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const price = calculatePrice();
      
      const orderData: any = {
        ...formData,
        pickup_point_id: parseInt(formData.pickup_point_id),
        delivery_point_id: formData.delivery_point_id ? parseInt(formData.delivery_point_id) : null,
        weight: parseFloat(formData.weight),
        length: formData.length ? parseFloat(formData.length) : null,
        width: formData.width ? parseFloat(formData.width) : null,
        height: formData.height ? parseFloat(formData.height) : null,
        price,
      };

      if (qrPreview) {
        orderData.qr_screenshot = qrPreview;
      }

      const result = await api.createOrder(orderData);
      
      if (result.success) {
        toast.success(`Заказ ${result.order_number} успешно создан!`);
        setFormData({
          full_name: '',
          phone: '',
          pickup_point_id: '',
          delivery_type: 'pickup',
          delivery_address: '',
          delivery_point_id: '',
          weight: '',
          length: '',
          width: '',
          height: '',
        });
        setQrFile(null);
        setQrPreview(null);
        onSuccess?.();
      } else {
        toast.error(result.error || 'Ошибка создания заказа');
      }
    } catch (error) {
      toast.error('Ошибка отправки заказа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Package" className="text-primary" />
          Оформление заказа
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>ФИО *</Label>
              <Input
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Иванов Иван Иванович"
              />
            </div>
            <div>
              <Label>Телефон *</Label>
              <Input
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+7 999 999 99 99"
              />
            </div>
          </div>

          <div>
            <Label>Откуда забрать посылку *</Label>
            <Select value={formData.pickup_point_id} onValueChange={(value) => setFormData({ ...formData, pickup_point_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите пункт выдачи" />
              </SelectTrigger>
              <SelectContent>
                {pickupPoints.map((point) => (
                  <SelectItem key={point.id} value={point.id.toString()}>
                    {point.name} - {point.city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Тип доставки *</Label>
            <RadioGroup value={formData.delivery_type} onValueChange={(value) => setFormData({ ...formData, delivery_type: value })}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pickup" id="pickup" />
                <Label htmlFor="pickup" className="font-normal">В пункт выдачи</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="home" id="home" />
                <Label htmlFor="home" className="font-normal">Доставка на дом</Label>
              </div>
            </RadioGroup>
          </div>

          {formData.delivery_type === 'pickup' && (
            <div>
              <Label>Пункт выдачи в Абхазии *</Label>
              <Select value={formData.delivery_point_id} onValueChange={(value) => setFormData({ ...formData, delivery_point_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите город" />
                </SelectTrigger>
                <SelectContent>
                  {deliveryPoints.map((point) => (
                    <SelectItem key={point.id} value={point.id.toString()}>
                      {point.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {formData.delivery_type === 'home' && (
            <div>
              <Label>Адрес доставки *</Label>
              <Input
                required
                value={formData.delivery_address}
                onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
                placeholder="г. Сухум, ул. Примерная, д. 10, кв. 5"
              />
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Вес (кг) *</Label>
              <Input
                required
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                placeholder="5.5"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-xs">Длина (см)</Label>
                <Input
                  type="number"
                  value={formData.length}
                  onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                  placeholder="30"
                />
              </div>
              <div>
                <Label className="text-xs">Ширина (см)</Label>
                <Input
                  type="number"
                  value={formData.width}
                  onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                  placeholder="20"
                />
              </div>
              <div>
                <Label className="text-xs">Высота (см)</Label>
                <Input
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  placeholder="10"
                />
              </div>
            </div>
          </div>

          {formData.weight && (
            <div className="p-4 rounded-lg gradient-primary text-white">
              <div className="text-sm opacity-90">Стоимость доставки:</div>
              <div className="text-3xl font-bold">{calculatePrice()} ₽</div>
            </div>
          )}

          <div>
            <Label>QR-код или скриншот заказа</Label>
            <div className="mt-2">
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
            </div>
            {qrPreview && (
              <div className="mt-3">
                <img src={qrPreview} alt="Preview" className="max-w-xs rounded-lg border" />
              </div>
            )}
          </div>

          <Button type="submit" disabled={loading} className="w-full gradient-primary text-white" size="lg">
            {loading ? (
              <>
                <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                Оформление...
              </>
            ) : (
              <>
                <Icon name="Send" size={20} className="mr-2" />
                Оформить заказ
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default OrderForm;
