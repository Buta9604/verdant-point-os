import type { Order } from "../data/types";

// Lightweight browser printing via a hidden iframe (avoids popup blockers).
// In production these payloads are formatted as ESC/POS and routed to the
// assigned physical printer through the hardware layer.

function printHtml(html: string) {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0";
  document.body.appendChild(iframe);
  const doc = iframe.contentWindow?.document;
  if (!doc) return;
  doc.open();
  doc.write(html);
  doc.close();
  iframe.contentWindow?.focus();
  iframe.contentWindow?.print();
  setTimeout(() => iframe.remove(), 1000);
}

const wrap = (title: string, body: string) => `<!doctype html><html><head>
<meta charset="utf-8"><title>${title}</title>
<style>
  body{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px;width:280px;margin:0 auto;padding:8px}
  h1{font-size:15px;text-align:center;margin:4px 0}
  .muted{color:#444}.row{display:flex;justify-content:space-between}
  hr{border:none;border-top:1px dashed #999;margin:6px 0}
  .big{font-size:16px;font-weight:bold}
  table{width:100%;border-collapse:collapse}td{padding:2px 0;vertical-align:top}
  .r{text-align:right}
</style></head><body>${body}</body></html>`;

function lineRows(order: Order) {
  return order.lines
    .map(
      (l) =>
        `<tr><td>${l.qty}× ${l.name}</td><td class="r">$${(l.price * l.qty).toFixed(
          2,
        )}</td></tr>`,
    )
    .join("");
}

export function printPickTicket(order: Order, printerName: string) {
  const body = `
    <h1>PICK TICKET</h1>
    <div class="row"><span>Order #${order.number}</span><span class="big">${order.terminalName}</span></div>
    <div class="muted">${new Date(order.sentAt).toLocaleString()}</div>
    <div class="muted">Budtender: ${order.budtenderName}</div>
    <hr/>
    <div><b>${order.customerName}</b></div>
    <hr/>
    <table>${order.lines
      .map((l) => `<tr><td>[ ] ${l.qty}×</td><td>${l.name}</td></tr>`)
      .join("")}</table>
    <hr/>
    <div class="muted">Printer: ${printerName}</div>
    <div class="muted">Status: SENT TO FULFILLMENT</div>`;
  printHtml(wrap(`Pick Ticket #${order.number}`, body));
}

export function printReceipt(order: Order, printerName: string) {
  const body = `
    <h1>Verdant Point</h1>
    <div class="muted" style="text-align:center">Albany, NY · ${order.terminalName}</div>
    <hr/>
    <div class="muted">Order #${order.number} · ${new Date().toLocaleString()}</div>
    <div class="muted">Customer: ${order.customerName}</div>
    <hr/>
    <table>${lineRows(order)}</table>
    <hr/>
    <table>
      <tr><td>Subtotal</td><td class="r">$${order.subtotal.toFixed(2)}</td></tr>
      ${order.discountAmount > 0 ? `<tr><td>Discount (${order.discountPct}%)</td><td class="r">-$${order.discountAmount.toFixed(2)}</td></tr>` : ""}
      <tr><td>Excise tax</td><td class="r">$${order.excise.toFixed(2)}</td></tr>
      <tr><td class="big">Total</td><td class="r big">$${order.total.toFixed(2)}</td></tr>
      ${
        order.roundedTotal !== order.total
          ? `<tr><td>Rounded (cash)</td><td class="r big">$${order.roundedTotal.toFixed(2)}</td></tr>`
          : ""
      }
    </table>
    <hr/>
    <div class="muted">Paid: ${order.paymentMethod ?? "—"}</div>
    <div style="text-align:center" class="muted">Thank you!</div>
    <div class="muted">Printer: ${printerName}</div>`;
  printHtml(wrap(`Receipt #${order.number}`, body));
}
