import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import OrderForm from '@/components/OrderForm';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [currentView, setCurrentView] = useState<'home' | 'calculator' | 'pickup' | 'tracking' | 'about' | 'contacts' | 'account' | 'admin'>('home');
  const [weight, setWeight] = useState('');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
  const [showOrderForm, setShowOrderForm] = useState(false);
  
  const [pickupPoints, setPickupPoints] = useState<any[]>([]);
  const [deliveryPoints, setDeliveryPoints] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerData, setRegisterData] = useState({ email: '', password: '', full_name: '', phone: '' });
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<any>(null);

  useEffect(() => {
    loadData();
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const loadData = async () => {
    try {
      const data = await api.getData();
      setPickupPoints(data.pickup_points || []);
      setDeliveryPoints(data.delivery_points || []);
      setStatuses(data.statuses || []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadOrders = async () => {
    try {
      const data = await api.getOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  useEffect(() => {
    if (user?.is_admin) {
      loadOrders();
    }
  }, [user]);

  const calculatePrice = () => {
    const w = parseFloat(weight);
    if (isNaN(w) || w <= 0) {
      toast.error('Введите корректный вес');
      return;
    }
    
    const pricePerKg = w >= 10 ? 100 : 120;
    const l = parseFloat(length) || 0;
    const wi = parseFloat(width) || 0;
    const h = parseFloat(height) || 0;
    const volumeWeight = (l * wi * h) / 5000;
    
    const finalWeight = Math.max(w, volumeWeight);
    const finalPrice = finalWeight * pricePerKg;
    
    setCalculatedPrice(Math.round(finalPrice));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await api.login(loginEmail, loginPassword);
      if (result.success) {
        setUser(result.user);
        localStorage.setItem('user', JSON.stringify(result.user));
        localStorage.setItem('token', result.token);
        toast.success('Вход выполнен успешно!');
        if (result.user.is_admin) {
          setCurrentView('admin');
        } else {
          setCurrentView('home');
        }
      } else {
        toast.error(result.error || 'Ошибка входа');
      }
    } catch (error) {
      toast.error('Ошибка подключения к серверу');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await api.register(registerData.email, registerData.password, registerData.full_name, registerData.phone);
      if (result.success) {
        setUser(result.user);
        localStorage.setItem('user', JSON.stringify(result.user));
        localStorage.setItem('token', result.token);
        toast.success('Регистрация успешна!');
        setCurrentView('home');
      } else {
        toast.error(result.error || 'Ошибка регистрации');
      }
    } catch (error) {
      toast.error('Ошибка подключения к серверу');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setCurrentView('home');
    toast.success('Вы вышли из системы');
  };

  const handleTrackOrder = async () => {
    if (!trackingNumber.trim()) {
      toast.error('Введите номер заказа');
      return;
    }
    try {
      const result = await api.getOrderByNumber(trackingNumber);
      if (result.error) {
        toast.error(result.error);
        setTrackedOrder(null);
      } else {
        setTrackedOrder(result);
        toast.success('Заказ найден');
      }
    } catch (error) {
      toast.error('Ошибка поиска заказа');
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, statusId: number) => {
    try {
      await api.updateOrderStatus(orderId, statusId);
      toast.success('Статус обновлён');
      loadOrders();
    } catch (error) {
      toast.error('Ошибка обновления статуса');
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    if (!confirm('Удалить заказ?')) return;
    try {
      await api.deleteOrder(orderId);
      toast.success('Заказ удалён');
      loadOrders();
    } catch (error) {
      toast.error('Ошибка удаления заказа');
    }
  };

  const Navigation = () => (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('home')}>
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Icon name="Package" className="text-white" size={24} />
          </div>
          <span className="text-2xl font-bold gradient-text">ExpressАбхазия</span>
        </div>
        
        <div className="hidden md:flex items-center gap-6">
          <button onClick={() => setCurrentView('home')} className="font-medium hover:text-primary transition-colors">Главная</button>
          <button onClick={() => setCurrentView('calculator')} className="font-medium hover:text-primary transition-colors">Калькулятор</button>
          <button onClick={() => setCurrentView('pickup')} className="font-medium hover:text-primary transition-colors">Пункты выдачи</button>
          <button onClick={() => setCurrentView('tracking')} className="font-medium hover:text-primary transition-colors">Отслеживание</button>
          <button onClick={() => setCurrentView('about')} className="font-medium hover:text-primary transition-colors">О нас</button>
          <button onClick={() => setCurrentView('contacts')} className="font-medium hover:text-primary transition-colors">Контакты</button>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              {user.is_admin && (
                <Button onClick={() => setCurrentView('admin')} variant="outline">
                  <Icon name="Settings" size={18} className="mr-2" />
                  Админ
                </Button>
              )}
              <Button onClick={handleLogout} variant="outline">
                <Icon name="LogOut" size={18} className="mr-2" />
                Выйти
              </Button>
            </>
          ) : (
            <Button onClick={() => setCurrentView('account')} className="gradient-primary text-white">
              <Icon name="LogIn" size={18} className="mr-2" />
              Войти
            </Button>
          )}
        </div>
      </div>
    </nav>
  );

  const HomeView = () => (
    <div className="min-h-screen">
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <Badge className="mb-4 gradient-primary text-white">Быстрая доставка из России</Badge>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Курьерская доставка <span className="gradient-text">в Абхазию</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Забираем посылки с Ozon, Wildberries, Яндекс Маркет и других маркетплейсов. Доставляем быстро и надёжно по лучшим тарифам.
              </p>
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon name="Zap" className="text-primary" size={24} />
                  </div>
                  <div>
                    <div className="font-bold text-2xl gradient-text">120₽</div>
                    <div className="text-sm text-gray-600">за 1 кг</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Icon name="TrendingDown" className="text-accent" size={24} />
                  </div>
                  <div>
                    <div className="font-bold text-2xl gradient-text">100₽</div>
                    <div className="text-sm text-gray-600">от 10 кг</div>
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <Button onClick={() => setCurrentView('calculator')} size="lg" className="gradient-primary text-white">
                  <Icon name="Calculator" size={20} className="mr-2" />
                  Рассчитать стоимость
                </Button>
                <Dialog open={showOrderForm} onOpenChange={setShowOrderForm}>
                  <DialogTrigger asChild>
                    <Button size="lg" variant="outline">
                      <Icon name="Package" size={20} className="mr-2" />
                      Оформить заказ
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Оформление заказа</DialogTitle>
                    </DialogHeader>
                    <OrderForm
                      pickupPoints={pickupPoints}
                      deliveryPoints={deliveryPoints}
                      onSuccess={() => {
                        setShowOrderForm(false);
                        toast.success('Заказ успешно создан!');
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <div className="animate-scale-in">
              <div className="relative">
                <div className="absolute inset-0 gradient-primary rounded-3xl blur-3xl opacity-20"></div>
                <img
                  src="https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&h=600&fit=crop"
                  alt="Доставка"
                  className="relative rounded-3xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Наши партнёры</h2>
            <p className="text-gray-600">Забираем посылки с популярных маркетплейсов</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {pickupPoints.slice(0, 6).map((partner) => (
              <Card key={partner.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 flex flex-col items-center justify-center gap-3">
                  <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center">
                    <Icon name="Store" className="text-white" size={32} />
                  </div>
                  <span className="font-semibold text-center">{partner.name}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Как это работает?</h2>
            <p className="text-gray-600">Простой процесс от заказа до получения</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: 'ShoppingCart', title: 'Заказываете', desc: 'Совершаете покупку на маркетплейсе' },
              { icon: 'Package', title: 'Оформляете доставку', desc: 'Указываете наш пункт выдачи и создаёте заказ' },
              { icon: 'Truck', title: 'Мы забираем', desc: 'Получаем посылку и отправляем в Абхазию' },
              { icon: 'CheckCircle', title: 'Вы получаете', desc: 'Забираете заказ в пункте выдачи' },
            ].map((step, idx) => (
              <div key={idx} className="text-center animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                <div className="relative mb-6">
                  <div className="w-20 h-20 mx-auto rounded-2xl gradient-primary flex items-center justify-center">
                    <Icon name={step.icon as any} className="text-white" size={36} />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold">
                    {idx + 1}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );

  const CalculatorView = () => (
    <div className="min-h-screen pt-32 pb-20 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Калькулятор стоимости</h1>
          <p className="text-gray-600">Рассчитайте точную стоимость доставки вашей посылки</p>
        </div>
        
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Calculator" className="text-primary" />
              Параметры посылки
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-base mb-2 block">Вес посылки *</Label>
              <Input
                type="number"
                step="0.1"
                placeholder="Введите вес в килограммах"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
              <p className="text-sm text-gray-500 mt-1">Стоимость: 120₽/кг (до 10 кг), 100₽/кг (от 10 кг)</p>
            </div>

            <div className="space-y-4">
              <Label className="text-base">Габариты (опционально)</Label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm">Длина (см)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-sm">Ширина (см)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-sm">Высота (см)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                  />
                </div>
              </div>
              <p className="text-sm text-gray-500">Объёмный вес = (Д × Ш × В) / 5000</p>
            </div>

            <Button onClick={calculatePrice} className="w-full gradient-primary text-white" size="lg">
              <Icon name="Calculator" size={20} className="mr-2" />
              Рассчитать стоимость
            </Button>

            {calculatedPrice !== null && (
              <div className="mt-6 p-6 rounded-xl gradient-primary text-white animate-scale-in">
                <div className="text-center">
                  <div className="text-sm opacity-90 mb-2">Стоимость доставки</div>
                  <div className="text-5xl font-bold mb-4">{calculatedPrice} ₽</div>
                  <Dialog open={showOrderForm} onOpenChange={setShowOrderForm}>
                    <DialogTrigger asChild>
                      <Button variant="secondary" size="lg">
                        <Icon name="Package" size={20} className="mr-2" />
                        Оформить заказ
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Оформление заказа</DialogTitle>
                      </DialogHeader>
                      <OrderForm
                        pickupPoints={pickupPoints}
                        deliveryPoints={deliveryPoints}
                        onSuccess={() => {
                          setShowOrderForm(false);
                          toast.success('Заказ успешно создан!');
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const PickupView = () => (
    <div className="min-h-screen pt-32 pb-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Пункты выдачи</h1>
          <p className="text-gray-600">Откуда мы забираем и куда доставляем посылки</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="MapPin" className="text-primary" />
                Пункты забора (Россия)
              </CardTitle>
              <CardDescription>Маркетплейсы и службы доставки</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pickupPoints.map(point => (
                  <div key={point.id} className="p-4 rounded-lg border hover:border-primary transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                        <Icon name="Store" className="text-white" size={20} />
                      </div>
                      <div>
                        <div className="font-semibold">{point.name}</div>
                        <div className="text-sm text-gray-600">{point.city}</div>
                        <div className="text-sm text-gray-500">{point.address}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="MapPin" className="text-accent" />
                Пункты доставки (Абхазия)
              </CardTitle>
              <CardDescription>Где вы можете получить посылки</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {deliveryPoints.map(point => (
                  <div key={point.id} className="p-4 rounded-lg border hover:border-accent transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg gradient-accent flex items-center justify-center flex-shrink-0">
                        <Icon name="Home" className="text-white" size={20} />
                      </div>
                      <div>
                        <div className="font-semibold">{point.name}</div>
                        <div className="text-sm text-gray-500">{point.address}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const TrackingView = () => (
    <div className="min-h-screen pt-32 pb-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Отслеживание заказов</h1>
          <p className="text-gray-600">Узнайте статус вашей посылки в реальном времени</p>
        </div>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Input
                placeholder="Введите номер заказа (например: #20260206ABC123)"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleTrackOrder} className="gradient-primary text-white">
                <Icon name="Search" size={20} className="mr-2" />
                Найти
              </Button>
            </div>
          </CardContent>
        </Card>

        {trackedOrder && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Заказ {trackedOrder.order_number}</span>
                <Badge className={`bg-${trackedOrder.status_color}-500`}>
                  {trackedOrder.status_name}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Получатель</Label>
                  <p className="font-medium">{trackedOrder.full_name}</p>
                </div>
                <div>
                  <Label>Телефон</Label>
                  <p className="font-medium">{trackedOrder.phone}</p>
                </div>
                <div>
                  <Label>Откуда</Label>
                  <p className="font-medium">{trackedOrder.pickup_point_name}, {trackedOrder.pickup_city}</p>
                </div>
                <div>
                  <Label>Куда</Label>
                  <p className="font-medium">
                    {trackedOrder.delivery_type === 'pickup' 
                      ? trackedOrder.delivery_point_name 
                      : trackedOrder.delivery_address}
                  </p>
                </div>
                <div>
                  <Label>Вес</Label>
                  <p className="font-medium">{trackedOrder.weight} кг</p>
                </div>
                <div>
                  <Label>Стоимость</Label>
                  <p className="font-medium text-primary">{trackedOrder.price} ₽</p>
                </div>
              </div>
              {trackedOrder.qr_screenshot_url && (
                <div>
                  <Label>QR-код заказа</Label>
                  <img src={trackedOrder.qr_screenshot_url} alt="QR код" className="mt-2 max-w-xs rounded-lg border" />
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );

  const AboutView = () => (
    <div className="min-h-screen pt-32 pb-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">О нас</h1>
          <p className="text-xl text-gray-600">Надёжная доставка из России в Абхазию</p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardContent className="p-8">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center flex-shrink-0">
                  <Icon name="Truck" className="text-white" size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-4">Наша миссия</h3>
                  <p className="text-gray-600 leading-relaxed">
                    ExpressАбхазия — это современный сервис курьерской доставки, который упрощает процесс получения посылок из России в Абхазию. Мы работаем со всеми популярными маркетплейсами и службами доставки, обеспечивая быструю и надёжную доставку по лучшим тарифам на рынке.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: 'Shield', title: 'Надёжность', desc: 'Гарантия безопасности ваших посылок' },
              { icon: 'Zap', title: 'Скорость', desc: 'Быстрая доставка в кратчайшие сроки' },
              { icon: 'DollarSign', title: 'Выгодные тарифы', desc: 'Лучшие цены на рынке доставки' },
            ].map((item, idx) => (
              <Card key={idx} className="text-center">
                <CardContent className="p-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl gradient-primary flex items-center justify-center">
                    <Icon name={item.icon as any} className="text-white" size={32} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const ContactsView = () => (
    <div className="min-h-screen pt-32 pb-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Контакты</h1>
          <p className="text-xl text-gray-600">Свяжитесь с нами удобным способом</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Напишите нам</CardTitle>
              <CardDescription>Ответим в течение 24 часов</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Имя</Label>
                <Input placeholder="Ваше имя" />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" placeholder="your@email.com" />
              </div>
              <div>
                <Label>Сообщение</Label>
                <Textarea placeholder="Ваше сообщение..." rows={5} />
              </div>
              <Button className="w-full gradient-primary text-white">
                <Icon name="Send" size={18} className="mr-2" />
                Отправить сообщение
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {[
              { icon: 'Phone', title: 'Телефон', text: '+7 (XXX) XXX-XX-XX' },
              { icon: 'Mail', title: 'Email', text: 'info@expressabkhazia.ru' },
              { icon: 'MapPin', title: 'Офис', text: 'г. Сухум, ул. Центральная, 5' },
              { icon: 'Clock', title: 'Режим работы', text: 'Пн-Пт: 9:00 - 18:00' },
            ].map((item, idx) => (
              <Card key={idx}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center">
                      <Icon name={item.icon as any} className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold mb-1">{item.title}</h3>
                      <p className="text-gray-600">{item.text}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const AccountView = () => (
    <div className="min-h-screen pt-32 pb-20 px-4">
      <div className="container mx-auto max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Личный кабинет</h1>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Вход</TabsTrigger>
                <TabsTrigger value="register">Регистрация</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <Label>Пароль</Label>
                    <Input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                  <Button type="submit" className="w-full gradient-primary text-white">
                    <Icon name="LogIn" size={18} className="mr-2" />
                    Войти
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <Label>Имя</Label>
                    <Input
                      required
                      value={registerData.full_name}
                      onChange={(e) => setRegisterData({ ...registerData, full_name: e.target.value })}
                      placeholder="Ваше имя"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      required
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <Label>Телефон</Label>
                    <Input
                      required
                      value={registerData.phone}
                      onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                      placeholder="+7 (XXX) XXX-XX-XX"
                    />
                  </div>
                  <div>
                    <Label>Пароль</Label>
                    <Input
                      type="password"
                      required
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      placeholder="••••••••"
                    />
                  </div>
                  <Button type="submit" className="w-full gradient-primary text-white">
                    <Icon name="UserPlus" size={18} className="mr-2" />
                    Зарегистрироваться
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const AdminView = () => {
    if (!user?.is_admin) {
      return (
        <div className="min-h-screen pt-32 pb-20 px-4">
          <div className="container mx-auto max-w-md text-center">
            <Icon name="Lock" className="mx-auto mb-4 text-gray-400" size={64} />
            <h2 className="text-2xl font-bold mb-2">Доступ запрещён</h2>
            <p className="text-gray-600 mb-6">Для доступа к админ-панели необходимо войти под учётной записью администратора</p>
            <Button onClick={() => setCurrentView('account')} className="gradient-primary text-white">
              Войти
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen pt-32 pb-20 px-4">
        <div className="container mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Панель администратора</h1>
            <p className="text-gray-600">Управление заказами, пунктами выдачи и статусами</p>
          </div>

          <Tabs defaultValue="orders" className="space-y-6">
            <TabsList>
              <TabsTrigger value="orders">Заказы</TabsTrigger>
              <TabsTrigger value="pickups">Пункты выдачи</TabsTrigger>
              <TabsTrigger value="statuses">Статусы</TabsTrigger>
            </TabsList>

            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Управление заказами</CardTitle>
                    <Dialog open={showOrderForm} onOpenChange={setShowOrderForm}>
                      <DialogTrigger asChild>
                        <Button className="gradient-primary text-white">
                          <Icon name="Plus" size={18} className="mr-2" />
                          Добавить заказ
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Новый заказ</DialogTitle>
                        </DialogHeader>
                        <OrderForm
                          pickupPoints={pickupPoints}
                          deliveryPoints={deliveryPoints}
                          onSuccess={() => {
                            setShowOrderForm(false);
                            loadOrders();
                          }}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {orders.map(order => (
                      <div key={order.id} className="p-4 border rounded-lg flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                          <Icon name="Package" className="text-primary" size={24} />
                          <div>
                            <div className="font-bold">{order.order_number}</div>
                            <div className="text-sm text-gray-600">{order.full_name} • {order.phone}</div>
                            <div className="text-sm text-gray-500">
                              {order.pickup_point_name} → {order.delivery_point_name || order.delivery_address}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Select
                            value={order.status_id?.toString()}
                            onValueChange={(value) => handleUpdateOrderStatus(order.id, parseInt(value))}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {statuses.map(status => (
                                <SelectItem key={status.id} value={status.id.toString()}>
                                  {status.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <span className="font-bold text-primary">{order.price} ₽</span>
                          <Button
                            onClick={() => handleDeleteOrder(order.id)}
                            variant="outline"
                            size="sm"
                          >
                            <Icon name="Trash2" size={16} />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {orders.length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        <Icon name="Package" className="mx-auto mb-4" size={48} />
                        <p>Заказов пока нет</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pickups">
              <Card>
                <CardHeader>
                  <CardTitle>Пункты выдачи</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pickupPoints.map(point => (
                      <div key={point.id} className="p-4 border rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Icon name="MapPin" className="text-primary" size={24} />
                          <div>
                            <div className="font-bold">{point.name}</div>
                            <div className="text-sm text-gray-600">{point.city} • {point.address}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="statuses">
              <Card>
                <CardHeader>
                  <CardTitle>Статусы заказов</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {statuses.map(status => (
                      <div key={status.id} className="p-4 border rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Icon name="Tag" className="text-primary" size={24} />
                          <div className="font-bold">{status.name}</div>
                        </div>
                        <Badge className={`bg-${status.color}-500`}>{status.color}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      {currentView === 'home' && <HomeView />}
      {currentView === 'calculator' && <CalculatorView />}
      {currentView === 'pickup' && <PickupView />}
      {currentView === 'tracking' && <TrackingView />}
      {currentView === 'about' && <AboutView />}
      {currentView === 'contacts' && <ContactsView />}
      {currentView === 'account' && <AccountView />}
      {currentView === 'admin' && <AdminView />}
    </div>
  );
};

export default Index;
