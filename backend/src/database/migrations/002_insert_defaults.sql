-- Insert default categories
INSERT OR IGNORE INTO categories (id, name, description, icon, order_position) VALUES
(1, 'Telegram Stars', '🌟 Купіть Telegram Stars для платежів та донатів', '🌟', 1),
(2, 'NFT Подарунки', '🎁 Унікальні NFT колекції та подарунки', '🎁', 2),
(3, 'Premium', '👑 Преміум послуги та підписки', '👑', 3),
(4, 'Послуги', '⚙️ Различні послуги і інструменти', '⚙️', 4),
(5, 'Інше', '📦 Інші цифрові товари', '📦', 5);

-- Insert sample products
INSERT OR IGNORE INTO products (name, description, category_id, price_uah, price_ton, image_url, is_active, order_position) VALUES
('10 Telegram Stars', 'Пакет з 10 Telegram Stars для платежів та ігор', 1, 50, 0.05, '/images/stars-10.png', 1, 1),
('50 Telegram Stars', 'Пакет з 50 Telegram Stars - найпопулярніший варіант', 1, 230, 0.23, '/images/stars-50.png', 1, 2),
('500 Telegram Stars', 'Великий пакет з 500 Telegram Stars для геймерів', 1, 2100, 2.1, '/images/stars-500.png', 1, 3),
('Дизайнерський NFT', 'Унікальний NFT арт із сертифікатом автентичності', 2, 1000, 1.0, '/images/nft-design.png', 1, 1),
('Колекція 3D Avatar', 'Набір з 5 унікальних 3D аватарок для профілю', 2, 500, 0.5, '/images/avatar-collection.png', 1, 2),
('Telegram Premium 1 місяць', 'Преміум підписка на 1 місяць з усіма привілеями', 3, 99, 0.1, '/images/premium-1m.png', 1, 1),
('Telegram Premium 6 місяців', 'Преміум підписка на 6 місяців зі знижкою', 3, 480, 0.48, '/images/premium-6m.png', 1, 2),
('Кастомна аватарка', 'Професійне створення персональної аватарки', 4, 150, 0.15, '/images/avatar-custom.png', 1, 1),
('Дизайн стікер-набору', 'Створення оригінального набору стікерів', 4, 300, 0.3, '/images/sticker-design.png', 1, 2);
