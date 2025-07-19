import { useState } from "react";
import {
  Upload,
  FileText,
  Users,
  Calculator,
  TrendingUp,
  AlertCircle,
  ReceiptText,
} from "lucide-react";
import { Link } from "react-router-dom";

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [perDay, setperDay] = useState(466);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const calculateSalary = (presentDays, wagesPerDay = perDay) => {
    const gross = presentDays * wagesPerDay;
    const epf = gross * 0.12;
    const esic = gross * 0.0075;
    const net = gross - (epf + esic);
    return {
      gross: gross.toFixed(2),
      epf: epf.toFixed(2),
      net: net.toFixed(2),
    };
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("https://ai-invoice-generator-python.onrender.com/upload/", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      console.log("Raw response from backend:", result);

      const cleaned = result.result.replace(/```json|```/g, "");
      const parsed = JSON.parse(cleaned);
      setParsedData(parsed.extracted_data || []);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalStats = () => {
    if (!parsedData.length)
      return {
        totalEmployees: 0,
        totalGross: 0,
        totalNet: 0,
        totalPresentDays: 0,
      };

    const stats = parsedData.reduce(
      (acc, entry) => {
        const { gross, net } = calculateSalary(entry.present_day);
        return {
          totalEmployees: acc.totalEmployees + 1,
          totalGross: acc.totalGross + parseFloat(gross),
          totalNet: acc.totalNet + parseFloat(net),
          totalPresentDays: acc.totalPresentDays + (entry.present_day || 0),
        };
      },
      { totalEmployees: 0, totalGross: 0, totalNet: 0, totalPresentDays: 0 }
    );

    return stats;
  };

  const stats = getTotalStats();

  // Helper to check if all required fields are present
  const isDataValid =
    parsedData.length > 0 &&
    parsedData.every(
      (entry) =>
        entry.name && entry.present_day != null && entry.total_day != null
    );

  const renderStatsCards = () => {
    if (!parsedData.length) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">
                Total Employees
              </p>
              <p className="text-2xl font-bold text-slate-800">
                {stats.totalEmployees}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Total Gross</p>
              <p className="text-2xl font-bold text-slate-800">
                ₹{stats.totalGross.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">
                Total Net Payable
              </p>
              <p className="text-2xl font-bold text-slate-800">
                ₹{stats.totalNet.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
              <Calculator className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTable = () => {
    if (!parsedData.length) return null;
    if (!isDataValid) {
      return (
        <div className="bg-white/70 backdrop-blur-sm border border-red-200 rounded-2xl shadow-lg p-12 text-center flex flex-col items-center justify-center my-8">
          <div className="w-16 h-16 bg-gradient-to-r from-red-200 to-red-300 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-red-800 mb-2">
            Cannot Read Data
          </h3>
          <p className="text-red-600">
            Some required fields (name, present day, or total day) are missing
            in the uploaded data.
          </p>
        </div>
      );
    }

    return (
      <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg overflow-hidden">
        <div className="sm:flex p-6 border-b border-slate-200/50">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            Attendance Report
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">
                  Employee Name
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700 uppercase tracking-wider">
                  Present Days
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700 uppercase tracking-wider">
                  Total Days
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700 uppercase tracking-wider">
                  Absent Days
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700 uppercase tracking-wider">
                  Gross Salary
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700 uppercase tracking-wider">
                  EPF (12%)
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700 uppercase tracking-wider">
                  Net Payable
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 max-h-screen overflow-y-auto">
              {parsedData.map((entry, idx) => {
                const { gross, epf, net } = calculateSalary(entry.present_day);
                const attendanceRate = (
                  (entry.present_day / entry.total_day) *
                  100
                ).toFixed(1);

                return (
                  <tr
                    key={idx}
                    className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium text-slate-800">
                            {entry.name}
                          </p>
                          <p className="text-sm text-slate-500">
                            {attendanceRate}% attendance
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        {entry.present_day}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {entry.total_day}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                        {entry.total_day - entry.present_day}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-800">
                      ₹{gross}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-600">
                      ₹{epf}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-emerald-600 text-lg">
                        ₹{net}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="border border-neutral-200 my-6 rounded-full"></div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
          Attendance Management System
        </h1>
        <p className="text-slate-600 text-lg max-w-2xl mx-auto">
          Upload your attendance PDF and get instant salary calculations with
          beautiful insights
        </p>
      </div>

      {/* Upload Section */}
      <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg p-8 mb-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* File Upload */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Upload className="w-6 h-6 text-blue-500" />
              Upload Attendance File
            </h2>

            <div className="space-y-6">
              <div className="relative">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-blue-300 rounded-xl cursor-pointer bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-300"
                >
                  <FileText className="w-8 h-8 text-blue-500 mb-2" />
                  <p className="text-sm text-slate-600">
                    {file ? file.name : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    PDF, DOC, or any file format supported
                  </p>
                </label>
              </div>

              <button
                onClick={handleUpload}
                disabled={loading || !file}
                className={`w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 ${
                  loading || !file
                    ? "bg-slate-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl"
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  "Upload & Extract Data"
                )}
              </button>
            </div>
          </div>

          {/* Settings */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Calculator className="w-6 h-6 text-emerald-500" />
              Salary Configuration
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Daily Wage Rate
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={perDay}
                    onChange={(e) => setperDay(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                    placeholder="Enter daily wage"
                  />
                </div>
              </div>

              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">
                      Calculation Info
                    </p>
                    <p className="text-xs text-amber-700 mt-1">
                      EPF: 12% of gross salary
                      <br />
                      ESIC: 0.75% of gross salary
                      <br />
                      Net = Gross - (EPF + ESIC)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-center gap-4">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-600 font-medium">
              Processing your file, please wait...
            </p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {renderStatsCards()}

      {/* Results Table */}
      {isDataValid && renderTable()}
      {/* Generate Invoice Button */}
      {isDataValid && (
        <Link
          to="/Invoice"
          state={{
            totalEmployees: stats.totalEmployees,
            totalPresentDays: stats.totalPresentDays,
            perDay: perDay,
          }}
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl p-2 rounded-lg flex w-[90%] sm:w-fit text-white ml-auto font-bold m-6 text-center items-center justify-center"
        >
          <ReceiptText />
          <span>Generate Invoice</span>
        </Link>
      )}
      {/* If data is invalid, show error message */}
      {!isDataValid && parsedData.length > 0 && renderTable()}

      {/* Empty State */}
      {!parsedData.length && !loading && (
        <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg p-12 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">
            No Data Available
          </h3>
          <p className="text-slate-600">
            Upload an attendance file to see salary calculations and insights
          </p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
