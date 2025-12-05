<?php

require_once('../config/cors.php');
require_once('../config/db.php');
require_once('../config/helpers.php');

$method = $_SERVER['REQUEST_METHOD'];
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = str_replace('/api/', '', $requestUri);
$segments = explode('/', trim($path, '/'));

$action = $segments[0] ?? '';
$resource = $segments[1] ?? '';

try {
    switch ($action) {
        case 'farmer-verification':
            handleFarmerVerification($method, $resource);
            break;
        case 'auth':
            handleAuth($method, $resource);
            break;
        case 'products':
            handleProducts($method, $resource);
            break;
        case 'cart':
            handleCart($method, $resource);
            break;
        case 'orders':
            handleOrders($method, $resource);
            break;
        case 'users':
            handleUsers($method, $resource);
            break;
        case 'vouchers':
            handleVouchers($method, $resource);
            break;
        case 'reviews':
            handleReviews($method, $resource);
            break;
        case 'sellers':
            handleSellers($method, $resource);
            break;
        case 'categories':
            handleCategories($method, $resource);
            break;
        default:
            sendResponse(false, 'Endpoint not found', null, 404);
    }
} catch (Exception $e) {
    sendResponse(false, 'Server error: ' . $e->getMessage(), null, 500);
}
function handleFarmerVerification($method, $resource) {
    global $conn;

    if ($method !== 'POST') {
        sendResponse(false, 'Method not allowed', null, 405);
    }

    $data = getJsonData();

    // ✅ HANYA WAJIBKAN FIELD YANG BENAR
    if (!validateRequired($data, [
        'user_id',
        'farmer_card_number',
        'farmer_card_name',
        'organization_name',
        'organization_id'
    ])) {
        sendResponse(false, 'Data verifikasi tidak lengkap', null, 400);
    }

    // ✅ AMBIL SELLER_ID DARI USER_ID (BUKAN DARI INPUT)
    $sellerStmt = $conn->prepare("SELECT id FROM sellers WHERE user_id = ?");
    $sellerStmt->execute([$data['user_id']]);
    $seller = $sellerStmt->fetch(PDO::FETCH_ASSOC);

    if (!$seller) {
        sendResponse(false, 'Seller tidak ditemukan untuk user ini', null, 404);
    }

    $seller_id = $seller['id'];

    // ✅ SIMPAN VERIFIKASI
    $stmt = $conn->prepare("
        INSERT INTO farmer_verifications 
        (user_id, seller_id, farmer_card_number, farmer_card_name,
         organization_name, organization_id, verification_status)
        VALUES (?, ?, ?, ?, ?, ?, 'pending')
    ");

    $stmt->execute([
        $data['user_id'],
        $seller_id,
        $data['farmer_card_number'],
        $data['farmer_card_name'],
        $data['organization_name'],
        $data['organization_id']
    ]);

    sendResponse(true, 'Pengajuan verifikasi berhasil dikirim', [
        'seller_id' => $seller_id
    ], 201);
}

function handleAuth($method, $resource) {
    global $conn;
    
    if ($method !== 'POST') {
        sendResponse(false, 'Method not allowed', null, 405);
    }

    $data = getJsonData();

    if ($resource === 'register') {
        if (!validateRequired($data, ['full_name', 'email', 'password', 'phone'])) {
            sendResponse(false, 'Missing required fields', null, 400);
        }

        $full_name = sanitizeInput($data['full_name']);
        $email = sanitizeInput($data['email']);
        $password = $data['password'];
        $phone = sanitizeInput($data['phone']);
        $role = isset($data['role']) && $data['role'] === 'seller' ? 'seller' : 'buyer';

        if (!validateEmail($email)) {
            sendResponse(false, 'Invalid email format', null, 400);
        }

        if (strlen($password) < 6) {
            sendResponse(false, 'Password must be at least 6 characters', null, 400);
        }

        $checkStmt = $conn->prepare('SELECT id FROM users WHERE email = ?');
        $checkStmt->execute([$email]);
        if ($checkStmt->rowCount() > 0) {
            sendResponse(false, 'Email already registered', null, 409);
        }

        $passwordHash = hashPassword($password);

        $stmt = $conn->prepare('INSERT INTO users (full_name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)');
        if ($stmt->execute([$full_name, $email, $passwordHash, $phone, $role])) {
            $user_id = $conn->lastInsertId();
            
            if ($role === 'seller') {
                $business_name = sanitizeInput($data['business_name'] ?? 'Default Business');
                $sellerStmt = $conn->prepare('INSERT INTO sellers (user_id, business_name) VALUES (?, ?)');
                $sellerStmt->execute([$user_id, $business_name]);
            }

            $userStmt = $conn->prepare('SELECT id, full_name, email, phone, role FROM users WHERE id = ?');
            $userStmt->execute([$user_id]);
            $user = $userStmt->fetch(PDO::FETCH_ASSOC);
            
            sendResponse(true, 'User registered successfully', $user, 201);
        } else {
            sendResponse(false, 'Failed to register user', null, 500);
        }
    } elseif ($resource === 'login') {

    if (!validateRequired($data, ['email', 'password'])) {
        sendResponse(false, 'Missing email or password', null, 400);
    }

    $email = sanitizeInput($data['email']);
    $password = $data['password'];

    $stmt = $conn->prepare('
        SELECT 
            u.id, 
            u.full_name, 
            u.email, 
            u.password_hash, 
            u.phone, 
            u.role
        FROM users u 
        WHERE u.email = ?
    ');
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || !verifyPassword($password, $user['password_hash'])) {
        sendResponse(false, 'Invalid credentials', null, 401);
    }

    unset($user['password_hash']);

    // ✅ JIKA ROLE SELLER → CEK VERIFIKASI
    if ($user['role'] === 'seller') {

        $verifStmt = $conn->prepare("
            SELECT verification_status 
            FROM farmer_verifications 
            WHERE user_id = ?
            ORDER BY id DESC 
            LIMIT 1
        ");
        $verifStmt->execute([$user['id']]);
        $verif = $verifStmt->fetch(PDO::FETCH_ASSOC);

if (!$verif) {
    $user['verification_status'] = 'pending';
    sendResponse(
        false,
        'Akun seller belum diverifikasi kartu petani / organisasi tani',
        [
            'need_verification' => true,
            'user_id' => $user['id'],
            'verification_status' => 'pending'
        ],
        403
    );
}

if ($verif['verification_status'] !== 'approved') {
    $user['verification_status'] = $verif['verification_status'];
    sendResponse(
        false,
        'Akun seller belum diverifikasi kartu petani / organisasi tani',
        [
            'need_verification' => true,
            'user_id' => $user['id'],
            'verification_status' => $verif['verification_status']
        ],
        403
    );
}

$user['verification_status'] = $verif['verification_status'];


        // ✅ Tambahkan status verifikasi ke response frontend
        $user['verification_status'] = $verif['verification_status'];
    }

    $updateStmt = $conn->prepare('UPDATE users SET last_login = NOW() WHERE id = ?');
    $updateStmt->execute([$user['id']]);

    sendResponse(true, 'Login successful', $user);
        } else {
        sendResponse(false, 'Invalid auth action', null, 400);
    }
}
function handleProducts($method, $resource) {
    global $conn;

    if ($method === 'GET') {
        if ($resource) {
            $stmt = $conn->prepare('SELECT p.*, s.business_name FROM products p JOIN sellers s ON p.seller_id = s.id WHERE p.id = ?');
            $stmt->execute([$resource]);
            $product = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($product) {
                sendResponse(true, 'Product found', $product);
            } else {
                sendResponse(false, 'Product not found', null, 404);
            }
        } else {
            $category = $_GET['category'] ?? null;
            $search = $_GET['search'] ?? null;
            $page = $_GET['page'] ?? 1;
            $limit = $_GET['limit'] ?? 20;
            $offset = ($page - 1) * $limit;

            $sql = 'SELECT p.*, s.business_name FROM products p JOIN sellers s ON p.seller_id = s.id WHERE p.is_active = 1';
            $params = [];

            if ($category) {
                $sql .= ' AND p.category = ?';
                $params[] = sanitizeInput($category);
            }

            if ($search) {
                $sql .= ' AND (p.name LIKE ? OR p.description LIKE ?)';
                $searchTerm = '%' . sanitizeInput($search) . '%';
                $params[] = $searchTerm;
                $params[] = $searchTerm;
            }

            $sql .= ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
            $params[] = (int)$limit;
            $params[] = (int)$offset;

            $stmt = $conn->prepare($sql);
            $stmt->execute($params);
            $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

            sendResponse(true, 'Products retrieved', ['products' => $products, 'page' => (int)$page, 'limit' => (int)$limit]);
        }
    } elseif ($method === 'POST') {
        if (!validateRequired($_POST, ['seller_id', 'name', 'price', 'quantity_available'])) {
            sendResponse(false, 'Missing required fields', null, 400);
        }

        $seller_id = (int)$_POST['seller_id'];
        $name = sanitizeInput($_POST['name']);
        $description = $_POST['description'] ?? null;
        $category = sanitizeInput($_POST['category']);
        $price = (float)$_POST['price'];
        $quantity_available = (int)$_POST['quantity_available'];
        $unit = $_POST['unit'] ?? null;
        $harvest_date = $_POST['harvest_date'] ?? null;
        $expiry_date = $_POST['expiry_date'] ?? null;
        $quality_grade = $_POST['quality_grade'] ?? 'A';
        $is_organic = isset($_POST['is_organic']) ? (bool)$_POST['is_organic'] : false;
        $origin_location = $_POST['origin_location'] ?? null;

        $stmt = $conn->prepare('INSERT INTO products (seller_id, name, description, category, price, quantity_available, unit, harvest_date, expiry_date, quality_grade, is_organic, origin_location) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        
        if ($stmt->execute([$seller_id, $name, $description, $category, $price, $quantity_available, $unit, $harvest_date, $expiry_date, $quality_grade, $is_organic, $origin_location])) {
            $product_id = $conn->lastInsertId();
            sendResponse(true, 'Product created', ['id' => $product_id], 201);
        } else {
            sendResponse(false, 'Failed to create product', null, 500);
        }
    } else {
        sendResponse(false, 'Method not allowed', null, 405);
    }
}

function handleCart($method, $resource) {
    global $conn;

    if ($method === 'GET') {
        if (!isset($_GET['user_id'])) {
            sendResponse(false, 'Missing user_id', null, 400);
        }

        $user_id = (int)$_GET['user_id'];
        $stmt = $conn->prepare('SELECT c.id, c.product_id, c.quantity, p.name, p.price, p.image_url FROM cart_items c JOIN products p ON c.product_id = p.id WHERE c.user_id = ?');
        $stmt->execute([$user_id]);
        $cartItems = $stmt->fetchAll(PDO::FETCH_ASSOC);

        sendResponse(true, 'Cart retrieved', $cartItems);
    } elseif ($method === 'POST') {
        $data = getJsonData();

        if (!validateRequired($data, ['user_id', 'product_id', 'quantity'])) {
            sendResponse(false, 'Missing required fields', null, 400);
        }

        $user_id = (int)$data['user_id'];
        $product_id = (int)$data['product_id'];
        $quantity = (int)$data['quantity'];

        $checkStmt = $conn->prepare('SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?');
        $checkStmt->execute([$user_id, $product_id]);
        $existing = $checkStmt->fetch(PDO::FETCH_ASSOC);

        if ($existing) {
            $newQuantity = $existing['quantity'] + $quantity;
            $updateStmt = $conn->prepare('UPDATE cart_items SET quantity = ? WHERE id = ?');
            $updateStmt->execute([$newQuantity, $existing['id']]);
            sendResponse(true, 'Cart item updated', ['id' => $existing['id']]);
        } else {
            $insertStmt = $conn->prepare('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)');
            if ($insertStmt->execute([$user_id, $product_id, $quantity])) {
                sendResponse(true, 'Item added to cart', ['id' => $conn->lastInsertId()], 201);
            } else {
                sendResponse(false, 'Failed to add item', null, 500);
            }
        }
    } elseif ($method === 'DELETE') {
        if (!$resource) {
            sendResponse(false, 'Missing cart item id', null, 400);
        }

        $stmt = $conn->prepare('DELETE FROM cart_items WHERE id = ?');
        if ($stmt->execute([(int)$resource])) {
            sendResponse(true, 'Item removed from cart');
        } else {
            sendResponse(false, 'Failed to remove item', null, 500);
        }
    } else {
        sendResponse(false, 'Method not allowed', null, 405);
    }
}

function handleOrders($method, $resource) {
    global $conn;

    if ($method === 'GET') {
        if ($resource) {
            $stmt = $conn->prepare('SELECT * FROM orders WHERE id = ?');
            $stmt->execute([$resource]);
            $order = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($order) {
                $itemStmt = $conn->prepare('SELECT * FROM order_items WHERE order_id = ?');
                $itemStmt->execute([$order['id']]);
                $order['items'] = $itemStmt->fetchAll(PDO::FETCH_ASSOC);
                sendResponse(true, 'Order found', $order);
            } else {
                sendResponse(false, 'Order not found', null, 404);
            }
        } else {
            if (!isset($_GET['buyer_id'])) {
                sendResponse(false, 'Missing buyer_id', null, 400);
            }

            $buyer_id = (int)$_GET['buyer_id'];
            $stmt = $conn->prepare('SELECT * FROM orders WHERE buyer_id = ? ORDER BY created_at DESC');
            $stmt->execute([$buyer_id]);
            $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

            sendResponse(true, 'Orders retrieved', $orders);
        }

    } elseif ($method === 'POST') {

        $data = getJsonData();

        if (!validateRequired($data, ['buyer_id', 'shipping_address', 'items'])) {
            sendResponse(false, 'Missing required fields', null, 400);
        }

        $buyer_id = (int)$data['buyer_id'];
        $shipping_address = $data['shipping_address'];
        $items = $data['items'];
        $payment_method = $data['payment_method'] ?? 'pending';
        $voucher_code = $data['voucher_code'] ?? null;
        $shipping_method = $data['shipping_method'] ?? null;
        $points_used = isset($data['points_used']) ? (int)$data['points_used'] : 0;

        // ✅ AMBIL SELLER ID DARI PRODUK (BUKAN VARIABEL KOSONG)
        $firstProductId = $items[0]['product_id'];
        $sellerStmt = $conn->prepare("SELECT seller_id FROM products WHERE id = ?");
        $sellerStmt->execute([$firstProductId]);
        $sellerData = $sellerStmt->fetch(PDO::FETCH_ASSOC);

        if (!$sellerData) {
            sendResponse(false, 'Seller tidak ditemukan', null, 404);
        }

        $seller_id = $sellerData['seller_id'];

        // ✅ CEK VERIFIKASI SELLER
        $checkVerif = $conn->prepare("
            SELECT verification_status 
            FROM farmer_verifications 
            WHERE seller_id = ? 
            AND verification_status = 'approved'
        ");
        $checkVerif->execute([$seller_id]);

        if ($checkVerif->rowCount() === 0) {
            sendResponse(false, 'Seller belum diverifikasi, tidak bisa checkout', null, 403);
        }

        $totalAmount = 0;
        $discountAmount = 0;

        foreach ($items as $item) {
            $stmt = $conn->prepare('SELECT price FROM products WHERE id = ?');
            $stmt->execute([$item['product_id']]);
            $product = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($product) {
                $totalAmount += $product['price'] * $item['quantity'];
            }
        }

        // ✅ DISKON POIN
        if ($points_used > 0) {
            $userStmt = $conn->prepare('SELECT points FROM users WHERE id = ?');
            $userStmt->execute([$buyer_id]);
            $user = $userStmt->fetch(PDO::FETCH_ASSOC);

            if ($user && $user['points'] >= $points_used) {
                $points_discount_amount = ($points_used / 10) * 2000;
                $discountAmount += min($points_discount_amount, $totalAmount);
            }
        }

        // ✅ DISKON VOUCHER
        if ($voucher_code) {
            $voucherStmt = $conn->prepare('SELECT * FROM vouchers WHERE code = ? AND is_active = 1 AND expires_at > NOW()');
            $voucherStmt->execute([$voucher_code]);
            $voucher = $voucherStmt->fetch(PDO::FETCH_ASSOC);

            if ($voucher) {
                if ($voucher['discount_type'] === 'percentage') {
                    $voucherDiscount = ($totalAmount * $voucher['discount_value']) / 100;
                    if ($voucher['max_discount_amount']) {
                        $voucherDiscount = min($voucherDiscount, $voucher['max_discount_amount']);
                    }
                } else {
                    $voucherDiscount = min($voucher['discount_value'], $totalAmount);
                }
                $discountAmount += $voucherDiscount;
            }
        }

        $discountAmount = min($discountAmount, $totalAmount);
        $finalTotal = $totalAmount - $discountAmount;

        $orderNumber = generateOrderNumber();

        $orderStmt = $conn->prepare('
            INSERT INTO orders 
            (order_number, buyer_id, total_amount, discount_amount, voucher_code, shipping_address, shipping_method, payment_method) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ');

        if ($orderStmt->execute([
            $orderNumber, 
            $buyer_id, 
            $finalTotal, 
            $discountAmount, 
            $voucher_code, 
            $shipping_address, 
            $shipping_method, 
            $payment_method
        ])) {

            $order_id = $conn->lastInsertId();

            foreach ($items as $item) {
                $productStmt = $conn->prepare('SELECT price FROM products WHERE id = ?');
                $productStmt->execute([$item['product_id']]);
                $product = $productStmt->fetch(PDO::FETCH_ASSOC);

                if ($product) {
                    $subtotal = $product['price'] * $item['quantity'];

                    $itemStmt = $conn->prepare('
                        INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal) 
                        VALUES (?, ?, ?, ?, ?)
                    ');
                    $itemStmt->execute([
                        $order_id, 
                        $item['product_id'], 
                        $item['quantity'], 
                        $product['price'], 
                        $subtotal
                    ]);

                    $updateStmt = $conn->prepare('
                        UPDATE products 
                        SET quantity_available = quantity_available - ? 
                        WHERE id = ?
                    ');
                    $updateStmt->execute([$item['quantity'], $item['product_id']]);
                }
            }

            // ✅ UPDATE POIN
            $points_earned = intval($finalTotal / 1000);

            if ($points_earned > 0 || $points_used > 0) {
                $pointsStmt = $conn->prepare('
                    UPDATE users 
                    SET points = points - ? + ? 
                    WHERE id = ?
                ');
                $pointsStmt->execute([$points_used, $points_earned, $buyer_id]);
            }

            sendResponse(true, 'Order created', [
                'order_id' => $order_id,
                'order_number' => $orderNumber,
                'points_earned' => $points_earned
            ], 201);
        } else {
            sendResponse(false, 'Failed to create order', null, 500);
        }

    } else {
        sendResponse(false, 'Method not allowed', null, 405);
    }
}


function handleUsers($method, $resource) {
    global $conn;

    if ($method === 'GET') {
        if (!$resource) {
            sendResponse(false, 'Missing user id', null, 400);
        }

        $stmt = $conn->prepare('SELECT id, full_name, email, phone, role, profile_image, bio, address, city, province, postal_code, is_verified, rating, total_ratings FROM users WHERE id = ?');
        $stmt->execute([$resource]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            sendResponse(true, 'User found', $user);
        } else {
            sendResponse(false, 'User not found', null, 404);
        }
    } elseif ($method === 'PUT') {
        if (!$resource) {
            sendResponse(false, 'Missing user id', null, 400);
        }

        $data = getJsonData();
        $user_id = (int)$resource;

        $updateFields = [];
        $values = [];

        if (isset($data['full_name'])) {
            $updateFields[] = 'full_name = ?';
            $values[] = sanitizeInput($data['full_name']);
        }
        if (isset($data['phone'])) {
            $updateFields[] = 'phone = ?';
            $values[] = sanitizeInput($data['phone']);
        }
        if (isset($data['bio'])) {
            $updateFields[] = 'bio = ?';
            $values[] = $data['bio'];
        }
        if (isset($data['address'])) {
            $updateFields[] = 'address = ?';
            $values[] = $data['address'];
        }
        if (isset($data['city'])) {
            $updateFields[] = 'city = ?';
            $values[] = sanitizeInput($data['city']);
        }
        if (isset($data['province'])) {
            $updateFields[] = 'province = ?';
            $values[] = sanitizeInput($data['province']);
        }
        if (isset($data['postal_code'])) {
            $updateFields[] = 'postal_code = ?';
            $values[] = sanitizeInput($data['postal_code']);
        }

        if (empty($updateFields)) {
            sendResponse(false, 'No fields to update', null, 400);
        }

        $values[] = $user_id;
        $sql = 'UPDATE users SET ' . implode(', ', $updateFields) . ' WHERE id = ?';
        $stmt = $conn->prepare($sql);

        if ($stmt->execute($values)) {
            sendResponse(true, 'User updated', ['id' => $user_id]);
        } else {
            sendResponse(false, 'Failed to update user', null, 500);
        }
    } else {
        sendResponse(false, 'Method not allowed', null, 405);
    }
}

function handleVouchers($method, $resource) {
    global $conn;

    if ($method === 'GET') {
        if ($resource === 'validate') {
            $code = $_GET['code'] ?? null;
            if (!$code) {
                sendResponse(false, 'Missing voucher code', null, 400);
            }

            $stmt = $conn->prepare('SELECT * FROM vouchers WHERE code = ? AND is_active = 1 AND expires_at > NOW()');
            $stmt->execute([sanitizeInput($code)]);
            $voucher = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($voucher) {
                sendResponse(true, 'Voucher valid', $voucher);
            } else {
                sendResponse(false, 'Invalid or expired voucher', null, 404);
            }
        } else {
            $stmt = $conn->prepare('SELECT * FROM vouchers WHERE is_active = 1 AND expires_at > NOW() ORDER BY created_at DESC');
            $stmt->execute();
            $vouchers = $stmt->fetchAll(PDO::FETCH_ASSOC);

            sendResponse(true, 'Vouchers retrieved', $vouchers);
        }
    } else {
        sendResponse(false, 'Method not allowed', null, 405);
    }
}

function handleReviews($method, $resource) {
    global $conn;

    if ($method === 'GET') {
        if (!isset($_GET['product_id']) && !isset($_GET['seller_id'])) {
            sendResponse(false, 'Missing product_id or seller_id', null, 400);
        }

        if (isset($_GET['product_id'])) {
            $product_id = (int)$_GET['product_id'];
            $stmt = $conn->prepare('SELECT pr.*, u.full_name FROM product_reviews pr JOIN users u ON pr.buyer_id = u.id WHERE pr.product_id = ? ORDER BY pr.created_at DESC');
            $stmt->execute([$product_id]);
        } else {
            $seller_id = (int)$_GET['seller_id'];
            $stmt = $conn->prepare('SELECT sr.*, u.full_name FROM seller_reviews sr JOIN users u ON sr.buyer_id = u.id WHERE sr.seller_id = ? ORDER BY sr.created_at DESC');
            $stmt->execute([$seller_id]);
        }

        $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);
        sendResponse(true, 'Reviews retrieved', $reviews);
    } elseif ($method === 'POST') {
        $data = getJsonData();

        if (isset($data['product_id'])) {
            if (!validateRequired($data, ['product_id', 'buyer_id', 'rating', 'comment'])) {
                sendResponse(false, 'Missing required fields', null, 400);
            }

            $stmt = $conn->prepare('INSERT INTO product_reviews (product_id, buyer_id, rating, title, comment, is_verified_purchase) VALUES (?, ?, ?, ?, ?, ?)');
            if ($stmt->execute([$data['product_id'], $data['buyer_id'], $data['rating'], $data['title'] ?? null, $data['comment'], $data['is_verified_purchase'] ?? 0])) {
                sendResponse(true, 'Product review created', ['id' => $conn->lastInsertId()], 201);
            }
        } elseif (isset($data['seller_id'])) {
            if (!validateRequired($data, ['seller_id', 'buyer_id', 'rating'])) {
                sendResponse(false, 'Missing required fields', null, 400);
            }

            $stmt = $conn->prepare('INSERT INTO seller_reviews (seller_id, buyer_id, rating, comment, aspect) VALUES (?, ?, ?, ?, ?)');
            if ($stmt->execute([$data['seller_id'], $data['buyer_id'], $data['rating'], $data['comment'] ?? null, $data['aspect'] ?? 'overall'])) {
                sendResponse(true, 'Seller review created', ['id' => $conn->lastInsertId()], 201);
            }
        } else {
            sendResponse(false, 'Missing product_id or seller_id', null, 400);
        }
    } else {
        sendResponse(false, 'Method not allowed', null, 405);
    }
}

function handleSellers($method, $resource) {
    global $conn;

    if ($method === 'GET') {
        if ($resource) {
            $stmt = $conn->prepare('SELECT s.*, u.full_name, u.email, u.phone, u.rating FROM sellers s JOIN users u ON s.user_id = u.id WHERE s.id = ?');
            $stmt->execute([$resource]);
            $seller = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($seller) {
                sendResponse(true, 'Seller found', $seller);
            } else {
                sendResponse(false, 'Seller not found', null, 404);
            }
        } else {
            $stmt = $conn->prepare('SELECT s.*, u.full_name, u.email, u.phone, u.rating FROM sellers s JOIN users u ON s.user_id = u.id ORDER BY u.rating DESC');
            $stmt->execute();
            $sellers = $stmt->fetchAll(PDO::FETCH_ASSOC);

            sendResponse(true, 'Sellers retrieved', $sellers);
        }
    } elseif ($method === 'POST') {
        if (!$resource || $resource !== 'register') {
            sendResponse(false, 'Invalid action', null, 400);
        }

        $data = getJsonData();

        if (!validateRequired($data, ['user_id', 'business_name'])) {
            sendResponse(false, 'Missing required fields', null, 400);
        }

        $user_id = (int)$data['user_id'];
        $business_name = sanitizeInput($data['business_name']);
        $bank_account_name = $data['bank_account_name'] ?? null;
        $bank_account_number = $data['bank_account_number'] ?? null;
        $bank_name = $data['bank_name'] ?? null;

        $checkStmt = $conn->prepare('SELECT id FROM sellers WHERE user_id = ?');
        $checkStmt->execute([$user_id]);
        if ($checkStmt->rowCount() > 0) {
            sendResponse(false, 'User is already a seller', null, 409);
        }

        $stmt = $conn->prepare('INSERT INTO sellers (user_id, business_name, bank_account_name, bank_account_number, bank_name) VALUES (?, ?, ?, ?, ?)');
        if ($stmt->execute([$user_id, $business_name, $bank_account_name, $bank_account_number, $bank_name])) {
            $seller_id = $conn->lastInsertId();
            $updateStmt = $conn->prepare('UPDATE users SET role = "seller" WHERE id = ?');
            $updateStmt->execute([$user_id]);
            sendResponse(true, 'Seller registered', ['seller_id' => $seller_id], 201);
        } else {
            sendResponse(false, 'Failed to register seller', null, 500);
        }
    } else {
        sendResponse(false, 'Method not allowed', null, 405);
    }
}

function handleCategories($method, $resource) {
    global $conn;

    if ($method !== 'GET') {
        sendResponse(false, 'Method not allowed', null, 405);
    }

    if ($resource) {
        $stmt = $conn->prepare('SELECT * FROM categories WHERE id = ? OR slug = ?');
        $stmt->execute([$resource, $resource]);
        $category = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($category) {
            sendResponse(true, 'Category found', $category);
        } else {
            sendResponse(false, 'Category not found', null, 404);
        }
    } else {
        $stmt = $conn->prepare('SELECT * FROM categories WHERE is_active = 1 ORDER BY name ASC');
        $stmt->execute();
        $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);

        sendResponse(true, 'Categories retrieved', $categories);
    }
 }
  
?>
