const API_URLS = {
  auth: 'https://functions.poehali.dev/5ffdf416-88c7-4a51-ae29-0d98e10c2784',
  orders: 'https://functions.poehali.dev/95e5f6a4-2319-45c5-8b62-6e61d2554852',
  data: 'https://functions.poehali.dev/79cc86f7-cbfd-46cf-aff7-fd6bd0b66bd9',
};

export const api = {
  async login(email: string, password: string) {
    const response = await fetch(API_URLS.auth, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', email, password }),
    });
    return response.json();
  },

  async register(email: string, password: string, full_name: string, phone: string) {
    const response = await fetch(API_URLS.auth, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'register', email, password, full_name, phone }),
    });
    return response.json();
  },

  async createOrder(orderData: any) {
    const response = await fetch(API_URLS.orders, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    return response.json();
  },

  async getOrders() {
    const response = await fetch(API_URLS.orders);
    return response.json();
  },

  async getOrderByNumber(orderNumber: string) {
    const response = await fetch(`${API_URLS.orders}?number=${orderNumber}`);
    return response.json();
  },

  async updateOrderStatus(orderId: number, statusId: number) {
    const response = await fetch(API_URLS.orders, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: orderId, status_id: statusId }),
    });
    return response.json();
  },

  async deleteOrder(orderId: number) {
    const response = await fetch(API_URLS.orders, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: orderId }),
    });
    return response.json();
  },

  async getData(type?: string) {
    const url = type ? `${API_URLS.data}?type=${type}` : API_URLS.data;
    const response = await fetch(url);
    return response.json();
  },

  async addPickupPoint(name: string, city: string, address: string) {
    const response = await fetch(API_URLS.data, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add_pickup_point', name, city, address }),
    });
    return response.json();
  },

  async deletePickupPoint(id: number) {
    const response = await fetch(API_URLS.data, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_pickup_point', id }),
    });
    return response.json();
  },

  async addStatus(name: string, color: string) {
    const response = await fetch(API_URLS.data, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add_status', name, color }),
    });
    return response.json();
  },
};
