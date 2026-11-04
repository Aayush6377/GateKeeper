import React from 'react';
import { GenericError } from '../../components/common/GenericError';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <GenericError
        statusCode="404"
        title="Page Not Found"
        description="The requested route pattern or page path does not exist in the GateKeeper control plane."
        icon="shield"
        showHomeButton={true}
        showBackButton={true}
        technicalDetails="ERR_GATEWAY_ROUTE_UNMATCHED: 0 routes registered for this URI pattern."
      />
    </div>
  );
}