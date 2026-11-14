import { ApiDocsHeader } from '../../components/docs/ApiDocsHeader';
import { EndpointStructureCard } from '../../components/docs/EndpointStructureCard';
import { CodeSnippetsSection } from '../../components/docs/CodeSnippetsSection';
import { HeadersReference } from '../../components/docs/HeadersReference';
import { StatusCodesGrid } from '../../components/docs/StatusCodesGrid';

export default function ApiDocsPage() {
  return (
    <div className="flex-1 flex flex-col bg-[#030712] text-slate-100">
      <ApiDocsHeader />

      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        <EndpointStructureCard />
        <CodeSnippetsSection />
        <HeadersReference />
        <StatusCodesGrid />
      </div>
    </div>
  );
}