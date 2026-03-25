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
export function fetchNobelPrizes(
  {
    category = "all",
    year = "all",
    offset = 0,
    limit = 10,
    sort = "desc",
  } = {},
  onSuccess,
  onError
) {
  const params = new URLSearchParams();

  if (category !== "all") params.append("nobelPrizeCategory", category);
  if (year !== "all") params.append("nobelPrizeYear", year);

  params.append("sort", sort);
  params.append("offset", offset);
  params.append("limit", limit);

  const url = `${API_BASE_URL}/nobelPrizes?${params.toString()}`;
  fetchData(url, onSuccess, onError);
}
