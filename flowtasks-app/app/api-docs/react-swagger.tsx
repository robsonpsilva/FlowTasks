"use client";

import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

/**
 * The Shape of our component's props.
 * 'spec' must be the direct OpenAPI object.
 */
type Props = {
  spec: Record<string, unknown>;
};

/**
 * Client-side component to render the Swagger UI for FlowTasks.
 * This ensures the documentation is interactive in the browser.
 */
function ReactSwagger({ spec }: Props) {
  return <SwaggerUI spec={spec} />;
}

export default ReactSwagger;