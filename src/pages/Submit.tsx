import { ReportForm } from "@/components/ReportForm";

const Submit = () => {
  const handleReportSubmitted = () => {
    // Redirect to reports page after submission
    window.location.href = '/reports';
  };

  return (
    <div className="container mx-auto px-4">
      <ReportForm onReportSubmitted={handleReportSubmitted} />
    </div>
  );
};

export default Submit; 