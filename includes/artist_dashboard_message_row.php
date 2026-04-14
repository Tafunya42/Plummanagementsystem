<div class="inq-item">
  <?php if (!empty($message['sender_picture'])): ?>
    <div class="inq-av"><img src="<?= e(adash_asset($message['sender_picture'])) ?>" alt=""/></div>
  <?php else: ?>
    <div class="inq-av fallback"><?= e(adash_initials((string) $message['sender_name'])) ?></div>
  <?php endif; ?>
  <div class="inq-body">
    <div class="inq-top"><span class="inq-name"><?= e($message['sender_name']) ?></span><span class="inq-time"><?= e(adash_time_ago($message['created_at'] ?? null)) ?></span></div>
    <div class="inq-msg"><?= e(adash_excerpt((string) $message['message_text'], 130)) ?></div>
    <div class="inq-actions"><button class="inq-btn reply" type="button" onclick="showToast('Reply tools are next.')">Reply</button></div>
  </div>
</div>
