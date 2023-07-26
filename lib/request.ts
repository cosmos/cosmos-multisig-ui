export type RequestConfig = Omit<RequestInit, "body"> & { body?: unknown };

export const requestJson = async (
  endpoint: string,
  { method, headers, body, ...restConfig }: RequestConfig = {},
) => {
  const config: RequestInit = {
    method: method ?? body ? "POST" : "GET",
    headers: body ? { "Content-Type": "application/json", ...headers } : headers,
    body: body ? JSON.stringify(body) : null,
    ...restConfig,
  };

  const response = await fetch(endpoint, config);
  return response.ok ? response.json() : Promise.reject(new Error(await response.text()));
};

type RequestGraphQlJsonConfig = Omit<RequestInit, "body"> & { body: { query: string } };

/**
 * The fallback URL works for classic databases,for more information about regions see:
 * https://docs.fauna.com/fauna/current/learn/understanding/region_groups
 */
export const requestGraphQlJson = (config: RequestGraphQlJsonConfig) =>
  requestJson(process.env.FAUNADB_URL || "https://graphql.fauna.com/graphql", {
    ...config,
    headers: { Authorization: `Bearer ${process.env.FAUNADB_SECRET}`, ...config.headers },
  });
