// Version web (solo para desarrollo en navegador): los pagos no estan disponibles.
export function useStripe() {
  return {
    initPaymentSheet: async () => ({ error: { message: "Pagos no disponibles en la version web" } }),
    presentPaymentSheet: async () => ({ error: { code: "Canceled" as const, message: "Pagos no disponibles en la version web" } }),
  };
}
