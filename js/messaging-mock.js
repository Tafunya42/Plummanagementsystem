(function() {
  const styles = `
    .chat-widget {
      position: fixed; bottom: 30px; right: 30px;
      width: 360px; height: 500px;
      z-index: 2000; display: flex; flex-direction: column;
      opacity: 0; pointer-events: none; transform: translateY(20px);
      transition: all 0.4s var(--ease, cubic-bezier(.16, 1, .3, 1));
    }
    .chat-widget.open { opacity: 1; pointer-events: auto; transform: translateY(0); }
    .chat-header {
      padding: 20px; background: var(--violet, #a100d6); color: #fff;
      border-radius: 20px 20px 0 0; display: flex; align-items: center; justify-content: space-between;
    }
    .chat-body {
      flex: 1; background: var(--paper-strong, #fff); padding: 20px;
      overflow-y: auto; display: flex; flex-direction: column; gap: 12px;
    }
    .chat-msg {
      max-width: 80%; padding: 12px 16px; border-radius: 16px; font-size: 0.88rem; line-height: 1.5;
    }
    .chat-msg.received { background: var(--paper, #f6f6fc); color: var(--ink); align-self: flex-start; border-bottom-left-radius: 4px; }
    .chat-msg.sent { background: var(--violet); color: #fff; align-self: flex-end; border-bottom-right-radius: 4px; }
    .chat-footer {
      padding: 15px; background: var(--paper-strong); border-top: 1px solid var(--line);
      border-radius: 0 0 20px 20px; display: flex; gap: 10px;
    }
    .chat-input {
      flex: 1; border: 0; background: var(--paper); padding: 10px 15px; border-radius: 10px; outline: 0; color: var(--ink);
    }
  `;

  const html = `
    <div class="chat-widget glass-card" id="plumChat">
      <div class="chat-header">
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="width:10px; height:10px; background:#cbff00; border-radius:50%;"></div>
          <strong id="chatName">Artist Support</strong>
        </div>
        <button onclick="closePlumChat()" style="color:#fff; cursor:pointer;"><i data-lucide="x"></i></button>
      </div>
      <div class="chat-body" id="chatBody">
        <div class="chat-msg received">Hi! How can we help you with your booking today?</div>
      </div>
      <div class="chat-footer">
        <input type="text" class="chat-input" id="chatInput" placeholder="Type a message..." onkeydown="if(event.key==='Enter') sendPlumMsg()">
        <button class="btn btn--primary" style="padding:10px;" onclick="sendPlumMsg()"><i data-lucide="send"></i></button>
      </div>
    </div>
  `;

  const styleEl = document.createElement('style');
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);

  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div);

  window.openPlumChat = function(name = 'Artist Support') {
    document.getElementById('chatName').textContent = name;
    document.getElementById('plumChat').classList.add('open');
    if (window.lucide) window.lucide.createIcons();
  };

  window.closePlumChat = function() {
    document.getElementById('plumChat').classList.remove('open');
  };

  window.sendPlumMsg = function() {
    const input = document.getElementById('chatInput');
    const body = document.getElementById('chatBody');
    if (!input.value.trim()) return;

    const msg = document.createElement('div');
    msg.className = 'chat-msg sent';
    msg.textContent = input.value;
    body.appendChild(msg);
    body.scrollTop = body.scrollHeight;
    input.value = '';

    // Mock response
    setTimeout(() => {
      const reply = document.createElement('div');
      reply.className = 'chat-msg received';
      reply.textContent = "Thanks for the message! I'll get back to you shortly.";
      body.appendChild(reply);
      body.scrollTop = body.scrollHeight;
    }, 1500);
  };
})();
