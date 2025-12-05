<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

require_once "../config/db.php";

// === AMBIL DATA JSON ===
$data = json_decode(file_get_contents("php://input"), true);

// === VALIDASI DATA ===
if (
  !isset(
    $data["seller_id"],
    $data["farmer_card_number"],
    $data["farmer_card_name"],
    $data["organization_name"],
    $data["organization_id"]
  )
) {
  echo json_encode([
    "success" => false,
    "message" => "Data tidak lengkap"
  ]);
  exit;
}

// === AMBIL VALUE ===
$seller_id = (int)$data["seller_id"];
$farmer_card_number = $data["farmer_card_number"];
$farmer_card_name = $data["farmer_card_name"];
$organization_name = $data["organization_name"];
$organization_id = $data["organization_id"];

// === INSERT KE DATABASE (NAMA KOLOM SUDAH BENAR) ===
$stmt = $conn->prepare("
  INSERT INTO farmer_verifications 
  (seller_id, farmer_card_number, farmer_card_name, organization_name, organization_id, verification_status)
  VALUES (?, ?, ?, ?, ?, 'pending')
");

$stmt->bind_param(
  "issss",
  $seller_id,
  $farmer_card_number,
  $farmer_card_name,
  $organization_name,
  $organization_id
);

// === EKSEKUSI ===
if ($stmt->execute()) {
  echo json_encode([
    "success" => true,
    "message" => "Verifikasi berhasil dikirim"
  ]);
} else {
  echo json_encode([
    "success" => false,
    "message" => "Gagal menyimpan data",
    "error" => $stmt->error
  ]);
}

$stmt->close();
$conn->close();
