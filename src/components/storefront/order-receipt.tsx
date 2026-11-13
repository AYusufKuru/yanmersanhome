import type { presentOrder } from "@/lib/order-view";

type Receipt = ReturnType<typeof presentOrder>;

export function OrderReceipt({
  order,
  lead,
}: {
  order: Receipt;
  lead: string;
}) {
  return (
    <section className="mx-auto max-w-xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="text-xs tracking-[0.18em] text-coffee uppercase">
        {order.statusLabel}
      </p>
      <h1 className="font-display mt-3 text-4xl text-espresso">
        {order.number}
      </h1>
      <p className="mt-3 text-base leading-7 text-muted">{lead}</p>
      <p className="mt-2 text-sm text-muted">{order.createdLabel}</p>
      <ul className="mt-8 space-y-3 text-sm">
        {order.lines.map((item) => (
          <li key={item.id} className="flex justify-between gap-3">
            <span className="text-espresso">
              {item.name} · {item.quantity}
            </span>
            <span className="text-espresso">{item.total}</span>
          </li>
        ))}
      </ul>
      <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Ara toplam</dt>
          <dd className="text-espresso">{order.subtotal}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">İndirim</dt>
          <dd className="text-espresso">{order.discount}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Kargo</dt>
          <dd className="text-espresso">{order.shipping}</dd>
        </div>
        <div className="flex justify-between gap-4 text-base">
          <dt className="text-espresso">Toplam</dt>
          <dd className="text-espresso">{order.total}</dd>
        </div>
      </dl>
      {order.couponCode ? (
        <p className="mt-3 text-sm text-muted">Kupon: {order.couponCode}</p>
      ) : null}
      {order.shipment ? (
        <p className="mt-3 text-sm text-espresso">Kargo: {order.shipment}</p>
      ) : null}
      <div className="mt-8 text-sm leading-6 text-muted">
        <p className="text-espresso">{order.fullName}</p>
        <p>{order.phone}</p>
        <p>{order.email}</p>
        <p>{order.address}</p>
        <p>{order.invoice}</p>
        {order.note ? <p>Not: {order.note}</p> : null}
      </div>
      {order.events.length > 0 ? (
        <ol className="mt-8 space-y-3 border-t border-line pt-6 text-sm">
          {order.events.map((event) => (
            <li key={event.id}>
              <p className="text-espresso">{event.label}</p>
              <p className="text-muted">
                {event.when}
                {event.note ? ` · ${event.note}` : ""}
              </p>
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  );
}
