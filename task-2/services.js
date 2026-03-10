// Nobel Prize API Documentation: https://www.nobelprize.org/about/developer-zone-2/

import { fetchData } from "./fetcher.js";

const API_BASE_URL = "https://api.nobelprize.org/2.1";

/**
 * Fetch Nobel Prizes with optional filters
 * @param {Object} filters - Filter options
 * @param {string} filters.year - Year to filter by (optional)
 * @param {string} filters.category - Category code to filter by (optional)
 * @param {number} filters.offset - Pagination offset (default: 0)
 * @param {number} filters.limit - Number of results per page (default: 10)
 * @param {string} filters.sort - The sort order (result is sorted by year)
 * @param {Function} onSuccess - Callback for successful fetch
 * @param {Function} onError - Callback for fetch errors
 */
export function fetchNobelPrizes(filters = {}, onSuccess, onError) {
  let url = API_BASE_URL + "/nobelPrizes?";
  const params = new URLSearchParams();

  if (filters.category != "all") {
    params.append("nobelPrizeCategory", filters.category);
  }

  if (filters.year != "all") {
    params.append("nobelPrizeYear", filters.year);
  }
  params.append("sort", "desc");
  if (filters.sort) {
    params.append("sort", filters.sort);
  }
  params.append("offset", filters.offset);
  params.append("limit", filters.limit);

  url = url + params.toString();
  fetchData(url, onSuccess, onError);
}
