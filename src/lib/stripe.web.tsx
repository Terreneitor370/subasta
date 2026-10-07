// Version web (solo para desarrollo en navegador): Stripe no existe aqui.
import type { PropsWithChildren } from "react";

export function StripeProvider({ children }: PropsWithChildren) {
  return <>{children}</>;
}
