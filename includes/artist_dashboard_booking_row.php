<div class="booking-row">
  <div class="client-info">
    <?php if (!empty($booking['client_picture'])): ?>
      <div class="client-av"><img src="<?= e(adash_asset($booking['client_picture'])) ?>" alt=""/></div>
    <?php else: ?>
      <div class="client-av fallback"><?= e(adash_initials((string) $booking['client_name'])) ?></div>
    <?php endif; ?>
    <div><div class="client-name"><?= e($booking['client_name']) ?></div><div class="client-event"><?= e($booking['service_name']) ?></div></div>
  </div>
  <div><?= e(adash_date($booking['event_date'] ?? null)) ?></div>
  <div class="amount"><?= e(adash_money($booking['total_amount'] ?? 0)) ?></div>
  <div><span class="status-badge <?= e($booking['booking_status'] ?? 'pending') ?>"><i data-lucide="<?= e(adash_status_icon((string) ($booking['booking_status'] ?? 'pending'))) ?>"></i><?= e(ucfirst((string) ($booking['booking_status'] ?? 'pending'))) ?></span></div>
  <div><button class="row-action" type="button" onclick="showToast('Booking tools are next.')">View</button></div>
</div>
