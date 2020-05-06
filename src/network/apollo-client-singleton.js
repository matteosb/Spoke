import ApolloClient from "apollo-client";
import ResponseMiddlewareNetworkInterface from "./response-middleware-network-interface";
import { graphQLErrorParser } from "./errors";

const responseMiddlewareNetworkInterface = new ResponseMiddlewareNetworkInterface(
  process.env.GRAPHQL_URL || "/graphql",
  { credentials: "same-origin" }
);

responseMiddlewareNetworkInterface.use({
  applyResponseMiddleware: (response, next) => {
    const parsedError = graphQLErrorParser(response);
    if (parsedError) {
      console.debug(parsedError);
      if (parsedError.status === 401) {
        window.location = `/login?nextUrl=${window.location.pathname}`;
      } else if (parsedError.status === 403) {
        window.location = "/";
      } else if (parsedError.status === 404) {
        window.location = "/404";
      } else {
        console.error(
          `GraphQL request resulted in error:\nRequest:${JSON.stringify(
            response.data
          )}\nError:${JSON.stringify(response.errors)}`
        );
      }
    }
    next();
  }
});

const networkInterface = responseMiddlewareNetworkInterface;

const ApolloClientSingleton = new ApolloClient({
  networkInterface
});

// For debugging
if (typeof window !== "undefined") {
  window.ApolloClient = ApolloClientSingleton;
}

export default ApolloClientSingleton;
