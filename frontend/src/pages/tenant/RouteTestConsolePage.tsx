import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Terminal, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import { routeService } from '../../services/routeService';
import { GatewayLoader } from '../../components/common/GatewayLoader';
import { apiClient } from '../../services/apiClient';
import { TestRequestBuilder } from '../../components/test/TestRequestBuilder';
import { TestResponseViewer } from '../../components/test/TestResponseViewer';

export default function RouteTestConsolePage() {
  const { routeId } = useParams<{ routeId: string }>();
  const navigate = useNavigate();

  const { data: route, isLoading: isFetchingRoute } = useQuery({
    queryKey: ['route', routeId],
    queryFn: () => routeService.findById(routeId!),
    enabled: Boolean(routeId),
  });

  const [selectedMethod, setSelectedMethod] = useState<string>('GET');
  const [queryParams, setQueryParams] = useState<Array<{ key: string; value: string }>>([]);
  const [headers, setHeaders] = useState<Array<{ key: string; value: string }>>([]);
  const [requestBody, setRequestBody] = useState<string>('{\n  \n}');
  
  const [response, setResponse] = useState<{
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: any;
    durationMs: number;
  } | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  React.useEffect(() => {
    if (route && route.allowedMethods && route.allowedMethods.length > 0) {
      if (!route.allowedMethods.includes(selectedMethod as any)) {
        setSelectedMethod(route.allowedMethods[0]);
      }
    }
  }, [route]);

  if (isFetchingRoute) {
    return <GatewayLoader text="Loading Test Console..." subtext="Retrieving route configuration and proxy targets" />;
  }

  if (!route) {
    return (
      <div className="w-full max-w-4xl mx-auto py-16 text-center space-y-4">
        <Terminal className="w-10 h-10 text-gray-400 mx-auto" />
        <h2 className="text-lg font-bold text-gray-900">Route Not Found</h2>
        <p className="text-xs text-gray-500">The requested route could not be found or has been deleted.</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
        >
          Back to Playground
        </button>
      </div>
    );
  }

  const gatewayBaseUrl = import.meta.env.VITE_GATEWAY_URL;
  let fullGatewayUrl = `${gatewayBaseUrl}${route.pathPattern}`;

  if (fullGatewayUrl.endsWith("/**")){
    fullGatewayUrl = fullGatewayUrl.slice(0, -3);
  }

  const handleExecute = async (customUrl: string) => {
    setIsExecuting(true);
    setResponse(null);

    const urlParams = new URLSearchParams();
    queryParams.forEach(p => {
      if (p.key.trim()) urlParams.append(p.key.trim(), p.value.trim());
    });
    const queryString = urlParams.toString() ? `?${urlParams.toString()}` : '';

    const customHeaders: Record<string, string> = {};
    headers.forEach(h => {
      if (h.key.trim()) customHeaders[h.key.trim()] = h.value.trim();
    });

    const startTime = performance.now();

    try {
      let parsedBody: any = undefined;
      if (['POST', 'PUT', 'PATCH'].includes(selectedMethod) && requestBody.trim()) {
        try {
          parsedBody = JSON.parse(requestBody);
        } catch {
          parsedBody = requestBody;
        }
      }

      const targetExecutionUrl = (customUrl && customUrl.trim()) ? customUrl.trim() : fullGatewayUrl;

      const res = await apiClient.request({
        url: `${targetExecutionUrl}${queryString}`,
        method: selectedMethod,
        headers: customHeaders,
        data: parsedBody,
        validateStatus: () => true,
      });

      const endTime = performance.now();

      const resHeaders: Record<string, string> = {};
      if (res.headers && typeof res.headers === 'object') {
        Object.entries(res.headers).forEach(([k, v]) => {
          resHeaders[k] = String(v);
        });
      }

      setResponse({
        status: res.status,
        statusText: res.statusText || 'OK',
        headers: resHeaders,
        body: res.data,
        durationMs: Math.round(endTime - startTime),
      });

      toast.success(`Request completed with status ${res.status}`);
    } catch (err: any) {
      toast.error(err.message || 'Gateway connection failed');
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-16 px-4 sm:px-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-gray-200 shadow-2xs">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/tenant/playground')}
            className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md mb-1">
              <Globe className="w-3.5 h-3.5" /> Postman Live Test Console
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">
              Testing Route — <span className="text-emerald-600 font-mono">{route.name}</span>
            </h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Request Builder */}
        <div className="lg:col-span-6 space-y-6">
          <TestRequestBuilder
            route={route}
            gatewayUrl={fullGatewayUrl}
            selectedMethod={selectedMethod}
            onMethodChange={setSelectedMethod}
            queryParams={queryParams}
            onQueryParamsChange={setQueryParams}
            headers={headers}
            onHeadersChange={setHeaders}
            requestBody={requestBody}
            onRequestBodyChange={setRequestBody}
            onExecute={handleExecute}
            isExecuting={isExecuting}
          />
        </div>

        {/* Response Viewer */}
        <div className="lg:col-span-6 space-y-6">
          <TestResponseViewer
            response={response}
            isExecuting={isExecuting}
          />
        </div>

      </div>
    </div>
  );
}