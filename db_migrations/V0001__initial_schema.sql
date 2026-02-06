CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(50),
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pickup_points (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'pickup',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS delivery_points (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_statuses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    color VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id),
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    pickup_point_id INTEGER REFERENCES pickup_points(id),
    delivery_type VARCHAR(50) NOT NULL,
    delivery_address TEXT,
    delivery_point_id INTEGER REFERENCES delivery_points(id),
    weight DECIMAL(10, 2),
    length DECIMAL(10, 2),
    width DECIMAL(10, 2),
    height DECIMAL(10, 2),
    price DECIMAL(10, 2),
    qr_screenshot_url TEXT,
    status_id INTEGER REFERENCES order_statuses(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO order_statuses (name, color) VALUES 
    ('Обработка', 'orange'),
    ('В пути', 'blue'),
    ('Прибыл на склад', 'purple'),
    ('Готов к выдаче', 'green'),
    ('Доставлено', 'green'),
    ('Отменён', 'red')
ON CONFLICT (name) DO NOTHING;

INSERT INTO pickup_points (name, city, address) VALUES 
    ('Ozon', 'Москва', 'ул. Примерная, 1'),
    ('Wildberries', 'Москва', 'пр. Центральный, 5'),
    ('Яндекс Маркет', 'Санкт-Петербург', 'ул. Невская, 10'),
    ('Почта России', 'Москва', 'ул. Почтовая, 3'),
    ('Boxberry', 'Москва', 'ул. Курьерская, 7'),
    ('Автодок', 'Санкт-Петербург', 'ул. Автомобильная, 12')
ON CONFLICT DO NOTHING;

INSERT INTO delivery_points (name, address) VALUES 
    ('Сухум', 'ул. Центральная, 5'),
    ('Гагра', 'ул. Приморская, 8'),
    ('Гудаута', 'ул. Ленина, 15')
ON CONFLICT DO NOTHING;

INSERT INTO users (email, password_hash, full_name, is_admin) VALUES 
    ('mydavidmy@mail.ru', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5eedodXAJH8.C', 'Администратор', TRUE)
ON CONFLICT (email) DO NOTHING;