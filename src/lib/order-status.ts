export const paymentStatusLabel = {
  PENDING: "Test ödemesi bekleniyor",
  SUCCEEDED: "Test ödemesi kayıtlı",
  FAILED: "Test ödemesi başarısız",
} as const;

export const orderStatusLabel = {
  PENDING: "Ödeme bekleniyor",
  PAID: "Ödeme alındı",
  PREPARING: "Hazırlanıyor",
  SHIPPED: "Kargoya verildi",
  DELIVERED: "Teslim edildi",
  CANCELLED: "İptal edildi",
  REFUNDED: "İade tamamlandı",
} as const;
