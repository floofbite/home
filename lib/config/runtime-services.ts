import type { Service } from "@/config/types";
import {
  getServiceById as getServiceByIdFromList,
  getServicesByCategory as getServicesByCategoryFromList,
  searchServices as searchServicesFromList,
} from "@/lib/config/service-helpers";
import { serviceCategories, services } from "@/lib/config/runtime-config";

export { serviceCategories, services };

export function getServicesByCategory(categoryId: string): Service[] {
  return getServicesByCategoryFromList(services, categoryId);
}

export function getServiceById(id: string): Service | undefined {
  return getServiceByIdFromList(services, id);
}

export function searchServices(query: string): Service[] {
  return searchServicesFromList(services, query);
}
