import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'calculator' | 'pickup' | 'tracking' | 'about' | 'contacts' | 'account' | 'admin'>('home');
  const [weight, setWeight] = useState('');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);

  const calculatePrice = () => {
    const w = parseFloat(weight);
    if (isNaN(w) || w <= 0) return;
    
    const pricePerKg = w >= 10 ? 100 : 120;
    const basePrice = w * pricePerKg;
    
    const l = parseFloat(length) || 0;
    const wi = parseFloat(width) || 0;
    const h = parseFloat(height) || 0;
    const volumeWeight = (l * wi * h) / 5000;
    
    const finalWeight = Math.max(w, volumeWeight);
    const finalPrice = finalWeight * pricePerKg;
    
    setCalculatedPrice(Math.round(finalPrice));
  };

  const pickupPoints = [
    { id: 1, name: 'Ozon', city: 'Москва', address: 'ул. Примерная, 1' },
    { id: 2, name: 'Wildberries', city: 'Москва', address: 'пр. Центральный, 5' },
    { id: 3, name: 'Яндекс Маркет', city: 'Санкт-Петербург', address: 'ул. Невская, 10' },
    { id: 4, name: 'Почта России', city: 'Москва', address: 'ул. Почтовая, 3' },
    { id: 5, name: 'Boxberry', city: 'Москва', address: 'ул. Курьерская, 7' },
    { id: 6, name: 'Автодок', city: 'Санкт-Петербург', address: 'ул. Автомобильная, 12' },
  ];

  const deliveryPoints = [
    { id: 1, name: 'Сухум', address: 'ул. Центральная, 5' },
    { id: 2, name: 'Гагра', address: 'ул. Приморская, 8' },
    { id: 3, name: 'Гудаута', address: 'ул. Ленина, 15' },
  ];

  const orders = [
    { id: '#12345', status: 'В пути', date: '05.02.2026', from: 'Ozon Москва', to: 'Сухум' },
    { id: '#12344', status: 'Доставлено', date: '03.02.2026', from: 'Wildberries Москва', to: 'Гагра' },
    { id: '#12343', status: 'Обработка', date: '06.02.2026', from: 'Яндекс Маркет СПб', to: 'Гудаута' },
  ];

  const Navigation = () => (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
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
          {isLoggedIn ? (
            <>
              <Button onClick={() => setCurrentView('account')} variant="outline">
                <Icon name="User" size={18} className="mr-2" />
                Личный кабинет
              </Button>
              <Button onClick={() => setCurrentView('admin')} className="gradient-primary text-white">
                <Icon name="Settings" size={18} className="mr-2" />
                Админ
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
                <Button onClick={() => setCurrentView('pickup')} size="lg" variant="outline">
                  <Icon name="MapPin" size={20} className="mr-2" />
                  Пункты выдачи
                </Button>
              </div>
            </div>
            <div className="animate-scale-in">
              <div className="relative">
                <div className="absolute inset-0 gradient-primary rounded-3xl blur-3xl opacity-20"></div>
                <Card className="relative border-2 border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Package" className="text-primary" />
                      Быстрое оформление
                    </CardTitle>
                    <CardDescription>Создайте заказ прямо сейчас</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Откуда забрать</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите пункт выдачи" />
                        </SelectTrigger>
                        <SelectContent>
                          {pickupPoints.map(point => (
                            <SelectItem key={point.id} value={point.id.toString()}>
                              {point.name} - {point.city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Куда доставить</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите город доставки" />
                        </SelectTrigger>
                        <SelectContent>
                          {deliveryPoints.map(point => (
                            <SelectItem key={point.id} value={point.id.toString()}>
                              {point.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Вес посылки (кг)</Label>
                      <Input type="number" placeholder="Например: 5" />
                    </div>
                    <Button className="w-full gradient-primary text-white">
                      <Icon name="Send" size={18} className="mr-2" />
                      Оформить заказ
                    </Button>
                  </CardContent>
                </Card>
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
            {['Ozon', 'Wildberries', 'Яндекс Маркет', 'Почта России', 'Boxberry', 'Автодок'].map((partner, idx) => (
              <Card key={idx} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 flex flex-col items-center justify-center gap-3">
                  <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center">
                    <Icon name="Store" className="text-white" size={32} />
                  </div>
                  <span className="font-semibold text-center">{partner}</span>
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
                  <Button onClick={() => setCurrentView('home')} variant="secondary" size="lg">
                    <Icon name="Package" size={20} className="mr-2" />
                    Оформить заказ
                  </Button>
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
                  <div key={point.id} className="p-4 rounded-lg border hover:border-primary transition-colors cursor-pointer">
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
                  <div key={point.id} className="p-4 rounded-lg border hover:border-accent transition-colors cursor-pointer">
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

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Map" className="text-primary" />
              Карта доставки по Абхазии
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <Icon name="Map" className="text-primary mx-auto mb-4" size={64} />
                <p className="text-gray-600">Интерактивная карта с пунктами выдачи</p>
              </div>
            </div>
          </CardContent>
        </Card>
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
              <Input placeholder="Введите номер заказа (например: #12345)" className="flex-1" />
              <Button className="gradient-primary text-white">
                <Icon name="Search" size={20} className="mr-2" />
                Найти
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {orders.map(order => (
            <Card key={order.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center">
                      <Icon name="Package" className="text-white" size={24} />
                    </div>
                    <div>
                      <div className="font-bold text-lg">{order.id}</div>
                      <div className="text-sm text-gray-600">{order.date}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Маршрут</div>
                      <div className="font-medium">{order.from} → {order.to}</div>
                    </div>
                    <Badge className={
                      order.status === 'Доставлено' ? 'bg-green-500' :
                      order.status === 'В пути' ? 'bg-blue-500' :
                      'bg-orange-500'
                    }>
                      {order.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center">
                    <Icon name="Phone" className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Телефон</h3>
                    <p className="text-gray-600">+7 (XXX) XXX-XX-XX</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center">
                    <Icon name="Mail" className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Email</h3>
                    <p className="text-gray-600">info@expressabkhazia.ru</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center">
                    <Icon name="MapPin" className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Офис</h3>
                    <p className="text-gray-600">г. Сухум, ул. Центральная, 5</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center">
                    <Icon name="Clock" className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Режим работы</h3>
                    <p className="text-gray-600">Пн-Пт: 9:00 - 18:00</p>
                    <p className="text-gray-600">Сб-Вс: 10:00 - 16:00</p>
                  </div>
                </div>
              </CardContent>
            </Card>
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
              
              <TabsContent value="login" className="space-y-4">
                <div>
                  <Label>Email</Label>
                  <Input type="email" placeholder="your@email.com" />
                </div>
                <div>
                  <Label>Пароль</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <Button onClick={() => setIsLoggedIn(true)} className="w-full gradient-primary text-white">
                  <Icon name="LogIn" size={18} className="mr-2" />
                  Войти
                </Button>
              </TabsContent>
              
              <TabsContent value="register" className="space-y-4">
                <div>
                  <Label>Имя</Label>
                  <Input placeholder="Ваше имя" />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" placeholder="your@email.com" />
                </div>
                <div>
                  <Label>Телефон</Label>
                  <Input placeholder="+7 (XXX) XXX-XX-XX" />
                </div>
                <div>
                  <Label>Пароль</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <Button onClick={() => setIsLoggedIn(true)} className="w-full gradient-primary text-white">
                  <Icon name="UserPlus" size={18} className="mr-2" />
                  Зарегистрироваться
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const AdminView = () => (
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
                  <Button className="gradient-primary text-white">
                    <Icon name="Plus" size={18} className="mr-2" />
                    Добавить заказ
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {orders.map(order => (
                    <div key={order.id} className="p-4 border rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Icon name="Package" className="text-primary" size={24} />
                        <div>
                          <div className="font-bold">{order.id}</div>
                          <div className="text-sm text-gray-600">{order.from} → {order.to}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge>{order.status}</Badge>
                        <Button variant="outline" size="sm">
                          <Icon name="Edit" size={16} className="mr-1" />
                          Изменить
                        </Button>
                        <Button variant="outline" size="sm">
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pickups">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Пункты выдачи</CardTitle>
                  <Button className="gradient-primary text-white">
                    <Icon name="Plus" size={18} className="mr-2" />
                    Добавить пункт
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...pickupPoints, ...deliveryPoints].map(point => (
                    <div key={point.id} className="p-4 border rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Icon name="MapPin" className="text-primary" size={24} />
                        <div>
                          <div className="font-bold">{point.name}</div>
                          <div className="text-sm text-gray-600">{point.address}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm">
                          <Icon name="Edit" size={16} className="mr-1" />
                          Изменить
                        </Button>
                        <Button variant="outline" size="sm">
                          <Icon name="Trash2" size={16} />
                        </Button>
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
                <div className="flex items-center justify-between">
                  <CardTitle>Управление статусами</CardTitle>
                  <Button className="gradient-primary text-white">
                    <Icon name="Plus" size={18} className="mr-2" />
                    Добавить статус
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['Обработка', 'В пути', 'Прибыл на склад', 'Готов к выдаче', 'Доставлено', 'Отменён'].map((status, idx) => (
                    <div key={idx} className="p-4 border rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Icon name="Tag" className="text-primary" size={24} />
                        <div className="font-bold">{status}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm">
                          <Icon name="Edit" size={16} className="mr-1" />
                          Изменить
                        </Button>
                        <Button variant="outline" size="sm">
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </div>
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
