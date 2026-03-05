import type { Service } from "@/config/types";

export function getServicesByCategory(
  services: Service[],
  categoryId: string
): Service[] {
  return services.filter((service) => service.category === categoryId);
}

export function getServiceById(
  services: Service[],
  id: string
): Service | undefined {
  return services.find((service) => service.id === id);
}

export function searchServices(services: Service[], query: string): Service[] {
  const lowerQuery = query.toLowerCase();
  return services.filter(
    (service) =>
      service.name.toLowerCase().includes(lowerQuery) ||
      service.description.toLowerCase().includes(lowerQuery)
  );
}
