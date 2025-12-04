# Ftrade PHP Backend

Complete PHP backend API for the Ftrade marketplace application.

## Prerequisites

- PHP 7.4 or higher
- MySQL 5.7 or higher
- Composer (optional, for dependency management)

## Setup Instructions

### 1. Database Setup

First, create the database and tables using the DATABASE_SETUP.md guide:

```bash
mysql -u root -p < path/to/DATABASE_SETUP.md
```

Or manually create the database in phpMyAdmin using the SQL from DATABASE_SETUP.md

### 2. Configure Database Connection

Edit `config/db.php` with your database credentials:

```php
$host = 'localhost';
$db_name = 'db_ftrade';
$username = 'root';
$password = '';
```

### 3. Start the PHP Development Server

```bash
php -S localhost:8000
```

The API will be available at `http://localhost:8000/api/`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Products
- `GET /api/products` - Get all products (with filtering)
- `GET /api/products/{id}` - Get product by ID
- `POST /api/products` - Create new product

### Cart
- `GET /api/cart?user_id={id}` - Get user's cart
- `POST /api/cart` - Add item to cart
- `DELETE /api/cart/{id}` - Remove item from cart

### Orders
- `GET /api/orders?buyer_id={id}` - Get user's orders
- `GET /api/orders/{id}` - Get order details
- `POST /api/orders` - Create new order

### Users
- `GET /api/users/{id}` - Get user profile
- `PUT /api/users/{id}` - Update user profile

### Vouchers
- `GET /api/vouchers` - Get all active vouchers
- `GET /api/vouchers/validate?code={code}` - Validate voucher code

### Reviews
- `GET /api/reviews?product_id={id}` - Get product reviews
- `GET /api/reviews?seller_id={id}` - Get seller reviews
- `POST /api/reviews` - Create review

### Sellers
- `GET /api/sellers` - Get all sellers
- `GET /api/sellers/{id}` - Get seller details
- `POST /api/sellers/register` - Register as seller

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/{id}` - Get category details

## Request/Response Format

All requests should use JSON format with proper Content-Type header:

```
Content-Type: application/json
```

### Standard Response Format

Success:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

Error:
```json
{
  "success": false,
  "message": "Error description",
  "data": null
}
```

## Example Requests

### Register User
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "081234567890",
    "role": "buyer"
  }'
```

### Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get Products
```bash
curl "http://localhost:8000/api/products?category=vegetables&page=1&limit=20"
```

## Security Considerations

1. Passwords are hashed using bcrypt
2. SQL Injection prevention with prepared statements
3. CORS headers configured for cross-origin requests
4. Input sanitization for all user inputs
5. Email validation for user registration

## Performance Tips

1. Database indexes are already set up in the schema
2. Use pagination for product listings (page & limit parameters)
3. Cache frequently accessed data if needed
4. Monitor slow queries in production

## Troubleshooting

### Cannot connect to database
- Check MySQL is running
- Verify database credentials in `config/db.php`
- Ensure database `ftrade` exists

### 404 errors on API endpoints
- Check Apache mod_rewrite is enabled
- Verify .htaccess file is in the root php-backend directory
- Try accessing with full path: `http://localhost:8000/api/index.php?action=...`

### CORS errors
- CORS is enabled globally in `config/cors.php`
- Adjust Origin header if needed for specific domains

## Support

For issues or questions, refer to the main project README or contact support.
