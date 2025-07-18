import FileUpload from "../components/FileUpload";

function ExtractDataPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <FileUpload />
      </div>
    </div>
  );
}

export default ExtractDataPage;
