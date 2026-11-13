import { Footer } from "@/components/storefront/footer";
import { Header } from "@/components/storefront/header";

export default function StoreLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="store-surface flex min-h-full flex-1 flex-col">
      <Header />
      <main id="icerik" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
