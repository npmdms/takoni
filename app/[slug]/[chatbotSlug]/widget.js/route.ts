import {
  DEFAULT_APPEARANCE,
  getChatbotColorTokens,
  getChatbotSizeTokens,
} from "@/lib/chatbot-widget";

interface Props {
  params: Promise<{ slug: string; chatbotSlug: string }>;
}

function getWidgetScript() {
  const defaultColors = getChatbotColorTokens(DEFAULT_APPEARANCE.color);
  const defaultSize = getChatbotSizeTokens(DEFAULT_APPEARANCE.size);

  return `(function () {
  var currentScript = document.currentScript;
  if (!currentScript) return;

  var match = currentScript.src.match(/\\/([^/]+)\\/([^/]+)\\/widget\\.js(?:\\?.*)?$/);
  if (!match) return;

  var orgSlug = match[1];
  var chatbotSlug = match[2];
  var widgetKey = orgSlug + ":" + chatbotSlug;
  window.__takoniWidgetLoadedMap = window.__takoniWidgetLoadedMap || {};
  if (window.__takoniWidgetLoadedMap[widgetKey]) return;

  var baseUrl = new URL(currentScript.src).origin;
  var apiUrl = baseUrl + "/api/public/" + orgSlug + "/" + chatbotSlug;
  var storagePrefix = "takoni:" + orgSlug + ":" + chatbotSlug;
  var hasInitialized = false;

  function initWidget() {
    if (hasInitialized || !document.body) return;
    hasInitialized = true;
    window.__takoniWidgetLoadedMap[widgetKey] = true;

    var state = {
      open: false,
      loading: true,
      sending: false,
      preChatDone: false,
      config: null,
      messages: [],
      error: "",
    };

    var root = document.createElement("div");
    root.id = "takoni-chatbot-root";
    document.body.appendChild(root);

    var style = document.createElement("style");
    style.textContent = \`
    #takoni-chatbot-root {
      all: initial;
      --takoni-primary: ${defaultColors.primary};
      --takoni-primary-hover: ${defaultColors.primaryHover};
      --takoni-soft: ${defaultColors.soft};
      --takoni-ring: ${defaultColors.ring};
      --takoni-bubble: ${defaultColors.bubble};
      --takoni-launcher: ${defaultSize.launcher}px;
      --takoni-panel-width: ${defaultSize.panelWidth}px;
      --takoni-panel-height: ${defaultSize.panelHeight}px;
      --takoni-spacing: ${defaultSize.spacing}px;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: #0f172a;
    }
    #takoni-chatbot-root *, #takoni-chatbot-root *::before, #takoni-chatbot-root *::after {
      box-sizing: border-box;
      font-family: inherit;
    }
    .takoni-widget-shell {
      position: fixed;
      z-index: 2147483000;
      right: var(--takoni-spacing);
      bottom: var(--takoni-spacing);
      left: auto;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 12px;
    }
    .takoni-widget-shell[data-position="bottom-left"] {
      left: var(--takoni-spacing);
      right: auto;
      align-items: flex-start;
    }
    .takoni-widget-button {
      width: var(--takoni-launcher);
      height: var(--takoni-launcher);
      border: 0;
      border-radius: 999px;
      background: var(--takoni-primary);
      color: #ffffff;
      cursor: pointer;
      box-shadow: 0 18px 48px var(--takoni-ring);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: transform 160ms ease, background 160ms ease;
      font-size: 24px;
      line-height: 1;
    }
    .takoni-widget-button:hover {
      transform: translateY(-1px);
      background: var(--takoni-primary-hover);
    }
    .takoni-widget-panel {
      width: min(calc(100vw - 24px), var(--takoni-panel-width));
      height: min(calc(100vh - 96px), var(--takoni-panel-height));
      display: none;
      overflow: hidden;
      border: 1px solid rgba(15, 23, 42, 0.08);
      border-radius: 24px;
      background: #ffffff;
      box-shadow: 0 24px 80px rgba(15, 23, 42, 0.2);
    }
    .takoni-widget-panel[data-open="true"] {
      display: flex;
      flex-direction: column;
    }
    .takoni-widget-header {
      padding: 18px 18px 14px;
      background: linear-gradient(135deg, var(--takoni-primary), var(--takoni-primary-hover));
      color: #ffffff;
    }
    .takoni-widget-title {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
    }
    .takoni-widget-description {
      margin: 6px 0 0;
      font-size: 12px;
      line-height: 1.45;
      opacity: 0.9;
    }
    .takoni-widget-status {
      margin-top: 10px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 10px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.14);
      font-size: 11px;
    }
    .takoni-widget-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
      background: var(--takoni-bubble);
    }
    .takoni-widget-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .takoni-widget-message {
      display: flex;
    }
    .takoni-widget-message[data-role="user"] {
      justify-content: flex-end;
    }
    .takoni-widget-bubble {
      max-width: 84%;
      padding: 11px 13px;
      border-radius: 18px;
      white-space: pre-wrap;
      font-size: 13px;
      line-height: 1.5;
      color: #0f172a;
      background: #ffffff;
      box-shadow: 0 6px 18px rgba(15, 23, 42, 0.08);
    }
    .takoni-widget-message[data-role="user"] .takoni-widget-bubble {
      background: var(--takoni-primary);
      color: #ffffff;
      box-shadow: none;
    }
    .takoni-widget-footer {
      border-top: 1px solid rgba(15, 23, 42, 0.08);
      background: #ffffff;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .takoni-widget-form-row {
      display: flex;
      gap: 10px;
    }
    .takoni-widget-input, .takoni-widget-textarea {
      width: 100%;
      border: 1px solid rgba(148, 163, 184, 0.45);
      border-radius: 14px;
      padding: 11px 13px;
      font-size: 13px;
      outline: none;
      background: #ffffff;
      color: #0f172a;
      transition: border-color 160ms ease, box-shadow 160ms ease;
    }
    .takoni-widget-input:focus, .takoni-widget-textarea:focus {
      border-color: var(--takoni-primary);
      box-shadow: 0 0 0 4px var(--takoni-ring);
    }
    .takoni-widget-textarea {
      min-height: 42px;
      max-height: 120px;
      resize: vertical;
    }
    .takoni-widget-send, .takoni-widget-primary {
      border: 0;
      border-radius: 14px;
      padding: 11px 14px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      background: var(--takoni-primary);
      color: #ffffff;
      transition: background 160ms ease, transform 160ms ease;
      white-space: nowrap;
    }
    .takoni-widget-send:hover, .takoni-widget-primary:hover {
      background: var(--takoni-primary-hover);
      transform: translateY(-1px);
    }
    .takoni-widget-send[disabled], .takoni-widget-primary[disabled] {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
    .takoni-widget-helper {
      margin: 0;
      font-size: 11px;
      line-height: 1.45;
      color: #64748b;
    }
    .takoni-widget-error {
      margin: 0;
      font-size: 12px;
      color: #dc2626;
    }
    .takoni-widget-prechat {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .takoni-widget-empty {
      padding: 16px;
      font-size: 13px;
      color: #64748b;
    }
    @media (max-width: 640px) {
      .takoni-widget-shell {
        left: 12px !important;
        right: 12px !important;
        bottom: 12px !important;
        align-items: stretch !important;
      }
      .takoni-widget-panel {
        width: 100%;
        height: min(calc(100vh - 88px), 76vh);
      }
      .takoni-widget-button {
        align-self: flex-end;
      }
    }
    \`;
    document.head.appendChild(style);

  function safeStorageGet(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (_error) {
      return null;
    }
  }

  function safeStorageSet(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (_error) {
      return null;
    }
  }

  function getConversationId() {
    var key = storagePrefix + ":conversation-id";
    var existing = safeStorageGet(key);
    if (existing) return existing;

    var generated = "conv_" + Date.now() + "_" + Math.random().toString(36).slice(2, 10);
    safeStorageSet(key, generated);
    return generated;
  }

  function getVisitor() {
    return {
      name: safeStorageGet(storagePrefix + ":visitor-name") || "",
      email: safeStorageGet(storagePrefix + ":visitor-email") || "",
    };
  }

  function destroyWidget() {
    if (style.parentNode) {
      style.parentNode.removeChild(style);
    }
    if (root.parentNode) {
      root.parentNode.removeChild(root);
    }
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function applyTheme(config) {
    var appearance = (config && config.appearance) || {};
    var color = appearance.color || "${DEFAULT_APPEARANCE.color}";
    var size = appearance.size || "${DEFAULT_APPEARANCE.size}";
    var position = appearance.position || "${DEFAULT_APPEARANCE.position}";

    var colorMap = ${JSON.stringify({
      slate: getChatbotColorTokens("slate"),
      red: getChatbotColorTokens("red"),
      orange: getChatbotColorTokens("orange"),
      green: getChatbotColorTokens("green"),
      blue: getChatbotColorTokens("blue"),
      violet: getChatbotColorTokens("violet"),
      pink: getChatbotColorTokens("pink"),
    })};
    var sizeMap = ${JSON.stringify({
      sm: getChatbotSizeTokens("sm"),
      md: getChatbotSizeTokens("md"),
      lg: getChatbotSizeTokens("lg"),
    })};

    var colors = colorMap[color] || colorMap["${DEFAULT_APPEARANCE.color}"];
    var sizes = sizeMap[size] || sizeMap["${DEFAULT_APPEARANCE.size}"];

    root.style.setProperty("--takoni-primary", colors.primary);
    root.style.setProperty("--takoni-primary-hover", colors.primaryHover);
    root.style.setProperty("--takoni-soft", colors.soft);
    root.style.setProperty("--takoni-ring", colors.ring);
    root.style.setProperty("--takoni-bubble", colors.bubble);
    root.style.setProperty("--takoni-launcher", sizes.launcher + "px");
    root.style.setProperty("--takoni-panel-width", sizes.panelWidth + "px");
    root.style.setProperty("--takoni-panel-height", sizes.panelHeight + "px");
    root.style.setProperty("--takoni-spacing", sizes.spacing + "px");
  }

  function getWelcomeMessage() {
    if (!state.config) return "Loading chatbot...";
    return state.config.welcomeMessage || ("Hi! I am " + state.config.name + ". Ask me anything.");
  }

  function render() {
    var config = state.config;
    var canChat = config && (!config.requirePreChat || state.preChatDone);
    var messagesHtml = state.messages.length
      ? state.messages.map(function (message) {
          return '<div class="takoni-widget-message" data-role="' + message.role + '"><div class="takoni-widget-bubble">' + escapeHtml(message.content) + "</div></div>";
        }).join("")
      : '<div class="takoni-widget-empty">' + escapeHtml(getWelcomeMessage()) + "</div>";

    var visitor = getVisitor();

    root.innerHTML = \`
      <div class="takoni-widget-shell" data-position="\${config && config.appearance ? config.appearance.position : "${DEFAULT_APPEARANCE.position}"}">
        <div class="takoni-widget-panel" data-open="\${state.open ? "true" : "false"}">
          <div class="takoni-widget-header">
            <p class="takoni-widget-title">\${escapeHtml(config ? config.name : "Chatbot")}</p>
            \${config && config.description ? '<p class="takoni-widget-description">' + escapeHtml(config.description) + '</p>' : ""}
            <div class="takoni-widget-status">\${state.loading ? "Loading" : config && config.isActive ? "Online" : "Offline"}</div>
          </div>
          <div class="takoni-widget-body">
            \${config && config.requirePreChat && !state.preChatDone ? \`
              <div class="takoni-widget-prechat">
                <p class="takoni-widget-helper">Please introduce yourself before starting the chat.</p>
                <input class="takoni-widget-input" type="text" name="visitor-name" placeholder="Your name" value="\${escapeHtml(visitor.name)}" />
                <input class="takoni-widget-input" type="email" name="visitor-email" placeholder="Email address" value="\${escapeHtml(visitor.email)}" />
                <button class="takoni-widget-primary" type="button">Start chat</button>
              </div>
            \` : \`
              <div class="takoni-widget-messages">\${messagesHtml}</div>
              <div class="takoni-widget-footer">
                \${state.error ? '<p class="takoni-widget-error">' + escapeHtml(state.error) + '</p>' : ""}
                <div class="takoni-widget-form-row">
                  <textarea class="takoni-widget-textarea" placeholder="Type a message..." \${!canChat || state.sending || !config || !config.isActive ? "disabled" : ""}></textarea>
                  <button class="takoni-widget-send" type="button" \${!canChat || state.sending || !config || !config.isActive ? "disabled" : ""}>\${state.sending ? "Sending..." : "Send"}</button>
                </div>
                <p class="takoni-widget-helper">Press Enter to send. Shift+Enter for a new line.</p>
              </div>
            \`}
          </div>
        </div>
        <button class="takoni-widget-button" type="button" aria-label="Open chat">\${state.open ? "×" : "💬"}</button>
      </div>
    \`;

    applyTheme(config || {});

    var launcher = root.querySelector(".takoni-widget-button");
    if (launcher) {
      launcher.addEventListener("click", function () {
        state.open = !state.open;
        render();
      });
    }

    var preChatButton = root.querySelector(".takoni-widget-primary");
    if (preChatButton) {
      preChatButton.addEventListener("click", function () {
        var nameInput = root.querySelector('input[name="visitor-name"]');
        var emailInput = root.querySelector('input[name="visitor-email"]');
        if (!nameInput || !emailInput) return;
        if (!nameInput.value.trim() || !emailInput.value.trim()) return;
        safeStorageSet(storagePrefix + ":visitor-name", nameInput.value.trim());
        safeStorageSet(storagePrefix + ":visitor-email", emailInput.value.trim());
        state.preChatDone = true;
        state.messages = [{ role: "assistant", content: getWelcomeMessage() }];
        render();
      });
    }

    var textarea = root.querySelector(".takoni-widget-textarea");
    var sendButton = root.querySelector(".takoni-widget-send");

    function handleSend() {
      if (!textarea || !state.config || state.sending) return;
      var message = textarea.value.trim();
      if (!message) return;

      state.error = "";
      state.sending = true;
      state.messages.push({ role: "user", content: message });
      textarea.value = "";
      render();

      fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message,
          conversationId: getConversationId(),
          visitor: getVisitor(),
        }),
      })
        .then(function (response) {
          return response.json().then(function (data) {
            if (!response.ok) {
              throw new Error(data.error || "Failed to get response.");
            }
            return data;
          });
        })
        .then(function (data) {
          state.messages.push({
            role: "assistant",
            content: typeof data.reply === "string" && data.reply.trim()
              ? data.reply.trim()
              : "Maaf, terjadi kesalahan.",
          });
        })
        .catch(function (error) {
          state.error = error && error.message ? error.message : "Unable to connect.";
        })
        .finally(function () {
          state.sending = false;
          render();
          var messagesContainer = root.querySelector(".takoni-widget-messages");
          if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
          }
        });
    }

    if (textarea) {
      textarea.addEventListener("keydown", function (event) {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          handleSend();
        }
      });
    }

    if (sendButton) {
      sendButton.addEventListener("click", handleSend);
    }
  }

    fetch(apiUrl, { method: "GET" })
      .then(function (response) {
        return response.json().then(function (data) {
          if (!response.ok) {
            throw new Error(data.error || "Failed to load chatbot.");
          }
          return data;
        });
      })
      .then(function (data) {
        state.config = data.chatbot;
        state.loading = false;
        state.preChatDone = !state.config.requirePreChat || Boolean(getVisitor().name && getVisitor().email);
        state.messages = state.config && !state.config.requirePreChat
          ? [{ role: "assistant", content: getWelcomeMessage() }]
          : [];
        render();
      })
      .catch(function (_error) {
        destroyWidget();
        window.__takoniWidgetLoadedMap[widgetKey] = false;
      });

    root.innerHTML = "";
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWidget, { once: true });
  }
  initWidget();
})();`;
}

export async function GET(_: Request, { params }: Props) {
  await params;

  return new Response(getWidgetScript(), {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
