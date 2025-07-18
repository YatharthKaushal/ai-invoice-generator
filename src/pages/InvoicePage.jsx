import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  PDFDownloadLink,
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

function InvoicePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { totalEmployees, totalPresentDays, perDay } = location.state || {};

  // Rates
  const SERVICE_CHARGE_RATE = 0.07; // 7% as per HTML invoice
  const PF_RATE = 0.13;
  const ESIC_RATE = 0.0325;
  const CGST_RATE = 0.09;
  const SGST_RATE = 0.09;

  // Name, Date, Invoice Number
  const [billTo, setBillTo] = useState("");
  const today = new Date();
  const dateStr = today
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    .split("/")
    .join("/");
  const invoiceNumber = `INV${today.getFullYear()}${String(
    today.getMonth() + 1
  ).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}${Math.floor(
    100 + Math.random() * 900
  )}`;
  const monthOf = today
    .toLocaleDateString("en-GB", {
      month: "long",
      year: "numeric",
    })
    .toUpperCase();

  useEffect(() => {
    if (
      !location.state ||
      totalEmployees == null ||
      totalPresentDays == null ||
      perDay == null
    ) {
      navigate("/", { replace: true });
    }
  }, [location.state, totalEmployees, totalPresentDays, perDay, navigate]);

  // Calculations
  const baseTotal = Number(totalPresentDays) * Number(perDay);
  const serviceCharge = baseTotal * SERVICE_CHARGE_RATE;
  const pf = baseTotal * PF_RATE;
  const esic = baseTotal * ESIC_RATE;
  const subTotal = baseTotal + pf + esic;
  const roundOffSubTotal = Math.round(subTotal);
  const roundOffDiff = (roundOffSubTotal - subTotal).toFixed(2);
  const serviceChargeTotal = serviceCharge;
  const totalBeforeTax = roundOffSubTotal + serviceChargeTotal;
  const cgst = totalBeforeTax * CGST_RATE;
  const sgst = totalBeforeTax * SGST_RATE;
  const grandTotal = Math.round(totalBeforeTax + cgst + sgst);
  // const grandTotal = Math.round(totalBeforeTax);

  // Convert grand total to words
  const numberToWords = (num) => {
    const units = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
    ];
    const teens = [
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];
    const thousands = ["", "Thousand", "Lakh", "Crore"];

    if (num === 0) return "Zero";

    const convertLessThanThousand = (n) => {
      if (n === 0) return "";
      if (n < 10) return units[n];
      if (n < 20) return teens[n - 10];
      if (n < 100) return `${tens[Math.floor(n / 10)]} ${units[n % 10]}`.trim();
      return `${units[Math.floor(n / 100)]} Hundred ${convertLessThanThousand(
        n % 100
      )}`.trim();
    };

    let result = "";
    let place = 0;
    while (num > 0) {
      if (num % 1000 !== 0) {
        let part = convertLessThanThousand(num % 1000);
        if (place > 0) part += ` ${thousands[place]}`;
        result = `${part} ${result}`.trim();
      }
      num = Math.floor(num / 1000);
      place++;
    }
    return `${result} Rupees Only`.toUpperCase();
  };

  const grandTotalInWords = numberToWords(grandTotal);

  // PDF Styles
  const styles = StyleSheet.create({
    page: {
      padding: 0,
      fontSize: 10,
      fontFamily: "Helvetica",
      backgroundColor: "#fff",
    },
    container: {
      maxWidth: 800,
      margin: 10,
      borderWidth: 2,
      borderColor: "#000",
    },
    header: {
      flexDirection: "column",
      padding: 5,
      borderBottomWidth: 2,
      borderColor: "#000",
    },
    companyName: {
      fontSize: 18,
      fontWeight: "bold",
      textAlign: "center",
      letterSpacing: 2,
      marginBottom: 5,
    },
    logoImage: {
      width: "100%",
      height: "auto",
      marginBottom: 5,
    },
    headerContent: {
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
    },
    contactInfo: {
      fontSize: 9,
      lineHeight: 1.1,
      marginRight: 5,
    },
    invoiceTitle: {
      backgroundColor: "#000",
      color: "#fff",
      textAlign: "center",
      padding: 5,
      fontSize: 14,
      fontWeight: "bold",
      letterSpacing: 3,
    },
    invoiceDetails: {
      flexDirection: "row",
      borderBottomWidth: 2,
      borderColor: "#000",
    },
    clientInfo: {
      flex: 2,
      padding: 5,
      borderRightWidth: 2,
      borderColor: "#000",
    },
    invoiceMeta: {
      flex: 1,
      padding: 5,
    },
    metaTable: {
      width: "100%",
      borderCollapse: "collapse",
    },
    metaRow: {
      flexDirection: "row",
    },
    metaCell: {
      borderWidth: 1,
      borderColor: "#000",
      padding: 4,
      fontSize: 10,
      width: "50%",
    },
    metaCellHeader: {
      fontWeight: "bold",
      backgroundColor: "#f0f0f0",
    },
    itemsTable: {
      width: "100%",
      borderCollapse: "collapse",
      marginBottom: 0,
    },
    tableRow: {
      flexDirection: "row",
    },
    tableCell: {
      borderWidth: 1,
      borderColor: "#000",
      padding: 4,
      textAlign: "center",
      fontSize: 10,
      flex: 1,
    },
    tableCellLeft: {
      textAlign: "left",
    },
    tableHeader: {
      backgroundColor: "#f0f0f0",
      fontWeight: "bold",
    },
    totalsSection: {
      flexDirection: "row",
      borderTopWidth: 2,
      borderColor: "#000",
    },
    calculations: {
      flex: 1,
      padding: 5,
      borderRightWidth: 2,
      borderColor: "#000",
    },
    totals: {
      flex: 1,
      padding: 5,
    },
    totalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 3,
      fontSize: 10,
    },
    totalRowGrand: {
      fontWeight: "bold",
      fontSize: 12,
      borderTopWidth: 2,
      borderColor: "#000",
      paddingTop: 3,
    },
    gstSection: {
      marginTop: 8,
      padding: 5,
      borderWidth: 1,
      borderColor: "#000",
      fontSize: 9,
    },
    bankDetails: {
      marginTop: 5,
      fontSize: 9,
      lineHeight: 1.2,
    },
    grandTotalSection: {
      backgroundColor: "#f0f0f0",
      padding: 5,
      borderWidth: 2,
      borderColor: "#000",
      textAlign: "center",
      fontWeight: "bold",
      fontSize: 14,
      marginBottom: 5,
    },
    amountWords: {
      marginTop: 5,
      fontSize: 10,
      fontWeight: "bold",
    },
    footerInfo: {
      marginTop: 5,
      padding: 5,
      fontSize: 8,
      lineHeight: 1.2,
    },
    signatureSection: {
      textAlign: "right",
      marginTop: 10,
      paddingRight: 5,
      fontSize: 10,
      fontWeight: "bold",
    },
  });

  // PDF Component
  const InvoicePDF = (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.companyName}>ASHAPURI SECURITY SERVICES</Text>
            <Image style={styles.logoImage} src="/logo.jpeg" />
            {/* <View style={styles.headerContent}>
              <View style={styles.contactInfo}>
                <Text>TG : 1, ABHILASH RESIDENCY, TIPI, TILODA CAMP ABC,</Text>
                <Text>FLAT NO. 3, VIJAY TOWER, TRANSPORT NAGAR HIT (A.P.)</Text>
                <Text>PIN NO. : 452 011 INDORE</Text>
                <Text>MOBILE : 9425864914 / 9425864914</Text>
                <Text>EMAIL : ashapurisecurity@yahoo.com</Text>
              </View>
            </View> */}
          </View>
          {/* Invoice Title */}
          <View style={styles.invoiceTitle}>
            <Text>INVOICE</Text>
          </View>
          {/* Invoice Details */}
          <View style={styles.invoiceDetails}>
            <View style={styles.clientInfo}>
              <Text style={{ fontWeight: "bold" }}>
                {billTo || "M/S EXECUTIVE ENGINEER"}
              </Text>
              <Text>MPPICL 400 KV TESTING DIVISION</Text>
              <Text>PITHAMPUR ORDER No.</Text>
              <Text>2307000 ACL W&W/TS-45/2023/3786</Text>
              <Text>GSTIN NO 23AADCM4432C1Z3</Text>
            </View>
            <View style={styles.invoiceMeta}>
              <View style={styles.metaTable}>
                <View style={styles.metaRow}>
                  <Text style={[styles.metaCell, styles.metaCellHeader]}>
                    INVOICE NO.
                  </Text>
                  <Text style={styles.metaCell}>{invoiceNumber}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={[styles.metaCell, styles.metaCellHeader]}>
                    DATE
                  </Text>
                  <Text style={styles.metaCell}>{dateStr}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={[styles.metaCell, styles.metaCellHeader]}>
                    MONTH OF
                  </Text>
                  <Text style={styles.metaCell}>{monthOf}</Text>
                </View>
              </View>
            </View>
          </View>
          {/* Items Table */}
          <View style={styles.itemsTable}>
            <View style={styles.tableRow}>
              <Text
                style={[styles.tableCell, styles.tableHeader, { flex: 0.5 }]}
              >
                S. NO.
              </Text>
              <Text style={[styles.tableCell, styles.tableHeader, { flex: 2 }]}>
                DESCRIPTION
              </Text>
              <Text style={[styles.tableCell, styles.tableHeader]}>SAC</Text>
              <Text style={[styles.tableCell, styles.tableHeader]}>
                NO. OF MAN DAYS/MONTH
              </Text>
              <Text style={[styles.tableCell, styles.tableHeader]}>RATE</Text>
              <Text style={[styles.tableCell, styles.tableHeader]}>AMOUNT</Text>
            </View>
            <View style={styles.tableRow}>
              <Text
                style={[
                  styles.tableCell,
                  { flex: 6, textAlign: "left", fontWeight: "bold" },
                ]}
              >
                UNARMED GUARD (unskilled)
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 0.5 }]}>1</Text>
              <Text
                style={[styles.tableCell, styles.tableCellLeft, { flex: 2 }]}
              >
                SECURITY SERVICES
              </Text>
              <Text style={styles.tableCell}>998514</Text>
              <Text style={styles.tableCell}>{totalPresentDays}</Text>
              <Text style={styles.tableCell}>{Number(perDay).toFixed(2)}</Text>
              <Text style={styles.tableCell}>{baseTotal.toFixed(2)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text
                style={[
                  styles.tableCell,
                  { flex: 5, textAlign: "right", fontWeight: "bold" },
                ]}
              >
                TOTAL
              </Text>
              <Text style={styles.tableCell}>{baseTotal.toFixed(2)}</Text>
            </View>
          </View>
          {/* Totals Section */}
          <View style={styles.totalsSection}>
            <View style={styles.calculations}>
              <Text>PF @13%</Text>
              <Text>ESIC @3.25%</Text>
              <Text style={{ marginTop: 5, fontWeight: "bold" }}>
                SUB TOTAL
              </Text>
              <Text style={{ marginTop: 5 }}>Service charge @7%</Text>
            </View>
            <View style={styles.totals}>
              <View style={styles.totalRow}>
                <Text></Text>
                <Text>{pf.toFixed(2)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text></Text>
                <Text>{esic.toFixed(2)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text>TOTAL</Text>
                <Text>{subTotal.toFixed(2)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text></Text>
                <Text>{serviceChargeTotal.toFixed(2)}</Text>
              </View>
              <View style={[styles.totalRow, styles.totalRowGrand]}>
                <Text>TOTAL</Text>
                <Text>{totalBeforeTax.toFixed(2)}</Text>
              </View>
            </View>
          </View>
          {/* GST Section */}
          <View style={styles.gstSection}>
            <Text style={{ fontWeight: "bold" }}>
              Note:- As per Notification no. 29/2018 dated 31.12.2018
            </Text>
            <Text style={{ fontWeight: "bold" }}>
              100% GST paid directly by you
            </Text>
            <Text>CGST @ 9% {cgst.toFixed(2)}</Text>
            <Text>SGST @ 9% {sgst.toFixed(2)}</Text>
            <View style={styles.bankDetails}>
              <Text style={{ fontWeight: "bold" }}>PUNJAB NATIONAL BANK</Text>
              <Text>Pls Transfer Payment C/A 0788101000960</Text>
              <Text>IFSC CODE : PUNB0078810</Text>
              <Text>SCH. NO. 54, VIJAY NAGAR, INDORE</Text>
            </View>
          </View>
          {/* Grand Total */}
          <View style={styles.grandTotalSection}>
            <Text style={{ fontSize: 16, marginBottom: 5 }}>
              GRAND TOTAL {grandTotal}
            </Text>
            <Text style={styles.amountWords}>{grandTotalInWords}</Text>
          </View>
          {/* Footer */}
          <View style={styles.footerInfo}>
            <Text>
              <Text style={{ fontWeight: "bold" }}>
                GSTIN. NO. :23ADCPC7046H1ZZ PAN NO. : ADCPC7046H
              </Text>
            </Text>
            <Text style={{ marginTop: 5 }}>
              *Monthly Includes Reliever engaged for providing weekly off and
              leaves allowed for .... Nos. Mandays during the period. It is to
              be certified under oath that I have completed the above mentioned
              work as per terms & conditions given in the order. I have
              completed the statutory requirements viz.payments of minimum wages
              deposit of EPF and ESIC as mandated in transport rules under ACL
              payment sheet.the payment of wages made to employees,deposit of
              employees contribution deducted from salary and deposit of
              contribution of employer (both)for EPF and ESIC as given in the
              payment sheet enclosed for M/o ..... has been deposited in the
              account of employees. I have not claimed above bill previously. In
              case any information given above is found false/ incorrect the
              MPPTCL may take any action as deem fit and may also recover any
              excess amount so paid from me with interest and/or otherwise
              adjust from any amount due to me
            </Text>
          </View>
          <View style={styles.signatureSection}>
            <Text>FOR ASHAPURI SECURITY SERVICES</Text>
          </View>
        </View>
      </Page>
    </Document>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="w-full max-w-xl">
        <div className="mb-4 flex flex-col sm:flex-row gap-2 items-start sm:items-end justify-between">
          <div className="flex-1 w-full">
            <label
              className="text-slate-700 font-medium text-left"
              htmlFor="billTo"
            >
              Bill To (Name):
            </label>
            <input
              id="billTo"
              type="text"
              value={billTo}
              onChange={(e) => setBillTo(e.target.value)}
              placeholder="Enter name"
              className="px-3 py-1 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white/80 text-slate-800 font-medium w-full"
            />
          </div>
          <PDFDownloadLink
            document={InvoicePDF}
            fileName={`${billTo || "invoice"}-${invoiceNumber}.pdf`}
            className="mt-2 sm:mt-0 sm:ml-4 px-5 py-1 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all duration-200 text-center"
          >
            {({ loading }) => (loading ? "Preparing PDF..." : "Download PDF")}
          </PDFDownloadLink>
        </div>
        <div className="bg-white/80 p-6 rounded-2xl shadow-xl download-invoice">
          <h1 className="text-2xl font-bold mb-4 text-slate-800 text-center">
            Invoice Preview
          </h1>
          <table className="w-full mb-2 text-slate-700 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <tbody>
              <tr>
                <td className="p-2 font-medium">Name</td>
                <td className="p-2">
                  {billTo || (
                    <span className="italic text-slate-400">
                      (Not specified)
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="p-2 font-medium">Date</td>
                <td className="p-2">{dateStr}</td>
              </tr>
              <tr>
                <td className="p-2 font-medium">Invoice Number</td>
                <td className="p-2">{invoiceNumber}</td>
              </tr>
            </tbody>
          </table>
          <table className="w-full mb-6 text-slate-700 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <tbody>
              <tr>
                <td className="p-2 font-medium">No. of Person</td>
                <td className="p-2">{totalEmployees}</td>
                <td className="p-2 font-medium">No. of Duty</td>
                <td className="p-2">{totalPresentDays}</td>
              </tr>
              <tr>
                <td className="p-2 font-medium">Rate</td>
                <td className="p-2">₹{Number(perDay).toFixed(2)}</td>
                <td className="p-2 font-medium">Amount</td>
                <td className="p-2">₹{baseTotal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          <div className="space-y-2 text-slate-700">
            <div className="flex justify-between border-b pb-1 mt-2">
              <span className="font-semibold">Sub Total:</span>
              <span className="font-semibold">₹{baseTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Service Charge @ 7%:</span>
              <span>₹{serviceCharge.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>PF @ 13%:</span>
              <span>₹{pf.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>ESIC @ 3.25%:</span>
              <span>₹{esic.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t pt-1 mt-2">
              <span className="font-semibold">Total:</span>
              <span className="font-semibold">₹{subTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Round off:</span>
              <span>₹{roundOffSubTotal}</span>
            </div>
            <div className="flex justify-between">
              <span>CGST @ 9%:</span>
              <span>₹{cgst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>SGST @ 9%:</span>
              <span>₹{sgst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>R/O:</span>
              <span>{roundOffDiff}</span>
            </div>
            <div className="flex justify-between border-t-2 pt-2 mt-2 text-lg font-bold text-indigo-700">
              <span>Grand Total:</span>
              <span>₹{grandTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvoicePage;

//

// v2
// import { useLocation, useNavigate } from "react-router-dom";
// import { useEffect, useState } from "react";
// import {
//   PDFDownloadLink,
//   Page,
//   Text,
//   View,
//   Document,
//   StyleSheet,
// } from "@react-pdf/renderer";

// function InvoicePage() {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { totalEmployees, totalPresentDays, perDay } = location.state || {};

//   // Rates
//   const SERVICE_CHARGE_RATE = 0.07; // 7% as per HTML invoice
//   const PF_RATE = 0.13;
//   const ESIC_RATE = 0.0325;
//   const CGST_RATE = 0.09;
//   const SGST_RATE = 0.09;

//   // Name, Date, Invoice Number
//   const [billTo, setBillTo] = useState("");
//   const today = new Date();
//   const dateStr = today.toLocaleDateString("en-GB", {
//     day: "2-digit",
//     month: "2-digit",
//     year: "numeric",
//   }).split("/").join("/");
//   const invoiceNumber = `INV${today.getFullYear()}${String(
//     today.getMonth() + 1
//   ).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}${Math.floor(
//     100 + Math.random() * 900
//   )}`;
//   const monthOf = today.toLocaleDateString("en-GB", {
//     month: "long",
//     year: "numeric",
//   }).toUpperCase();

//   useEffect(() => {
//     if (
//       !location.state ||
//       totalEmployees == null ||
//       totalPresentDays == null ||
//       perDay == null
//     ) {
//       navigate("/", { replace: true });
//     }
//   }, [location.state, totalEmployees, totalPresentDays, perDay, navigate]);

//   // Calculations
//   const baseTotal = Number(totalPresentDays) * Number(perDay);
//   const serviceCharge = baseTotal * SERVICE_CHARGE_RATE;
//   const pf = baseTotal * PF_RATE;
//   const esic = baseTotal * ESIC_RATE;
//   const subTotal = baseTotal + pf + esic;
//   const roundOffSubTotal = Math.round(subTotal);
//   const roundOffDiff = (roundOffSubTotal - subTotal).toFixed(2);
//   const serviceChargeTotal = serviceCharge;
//   const totalBeforeTax = roundOffSubTotal + serviceChargeTotal;
//   const cgst = totalBeforeTax * CGST_RATE;
//   const sgst = totalBeforeTax * SGST_RATE;
//   const grandTotal = Math.round(totalBeforeTax + cgst + sgst);

//   // Convert grand total to words
//   const numberToWords = (num) => {
//     const units = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
//     const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
//     const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
//     const thousands = ["", "Thousand", "Lakh", "Crore"];

//     if (num === 0) return "Zero";

//     const convertLessThanThousand = (n) => {
//       if (n === 0) return "";
//       if (n < 10) return units[n];
//       if (n < 20) return teens[n - 10];
//       if (n < 100) return `${tens[Math.floor(n / 10)]} ${units[n % 10]}`.trim();
//       return `${units[Math.floor(n / 100)]} Hundred ${convertLessThanThousand(n % 100)}`.trim();
//     };

//     let result = "";
//     let place = 0;
//     while (num > 0) {
//       if (num % 1000 !== 0) {
//         let part = convertLessThanThousand(num % 1000);
//         if (place > 0) part += ` ${thousands[place]}`;
//         result = `${part} ${result}`.trim();
//       }
//       num = Math.floor(num / 1000);
//       place++;
//     }
//     return `${result} Rupees Only`.toUpperCase();
//   };

//   const grandTotalInWords = numberToWords(grandTotal);

//   // PDF Styles
//   const styles = StyleSheet.create({
//     page: {
//       padding: 0,
//       fontSize: 12,
//       fontFamily: "Helvetica",
//       backgroundColor: "#fff",
//     },
//     container: {
//       maxWidth: 800,
//       margin: 20,
//       borderWidth: 2,
//       borderColor: "#000",
//     },
//     header: {
//       flexDirection: "row",
//       alignItems: "center",
//       padding: 10,
//       borderBottomWidth: 2,
//       borderColor: "#000",
//     },
//     logo: {
//       width: 80,
//       height: 80,
//       borderWidth: 2,
//       borderColor: "#000",
//       backgroundColor: "#f0f0f0",
//       justifyContent: "center",
//       alignItems: "center",
//       marginRight: 15,
//     },
//     logoText: {
//       fontSize: 10,
//       fontWeight: "bold",
//       textAlign: "center",
//       lineHeight: 1.2,
//     },
//     companyName: {
//       fontSize: 24,
//       fontWeight: "bold",
//       marginRight: 20,
//       letterSpacing: 2,
//     },
//     contactInfo: {
//       fontSize: 10,
//       lineHeight: 1.3,
//       marginLeft: "auto",
//     },
//     invoiceTitle: {
//       backgroundColor: "#000",
//       color: "#fff",
//       textAlign: "center",
//       padding: 5,
//       fontSize: 18,
//       fontWeight: "bold",
//       letterSpacing: 3,
//     },
//     invoiceDetails: {
//       flexDirection: "row",
//       borderBottomWidth: 2,
//       borderColor: "#000",
//     },
//     clientInfo: {
//       flex: 2,
//       padding: 10,
//       borderRightWidth: 2,
//       borderColor: "#000",
//     },
//     invoiceMeta: {
//       flex: 1,
//       padding: 10,
//     },
//     metaTable: {
//       width: "100%",
//       borderCollapse: "collapse",
//     },
//     metaRow: {
//       flexDirection: "row",
//     },
//     metaCell: {
//       borderWidth: 1,
//       borderColor: "#000",
//       padding: 5,
//       fontSize: 12,
//       width: "50%",
//     },
//     metaCellHeader: {
//       fontWeight: "bold",
//       backgroundColor: "#f0f0f0",
//     },
//     itemsTable: {
//       width: "100%",
//       borderCollapse: "collapse",
//       marginBottom: 0,
//     },
//     tableRow: {
//       flexDirection: "row",
//     },
//     tableCell: {
//       borderWidth: 1,
//       borderColor: "#000",
//       padding: 8,
//       textAlign: "center",
//       fontSize: 12,
//       flex: 1,
//     },
//     tableCellLeft: {
//       textAlign: "left",
//     },
//     tableHeader: {
//       backgroundColor: "#f0f0f0",
//       fontWeight: "bold",
//     },
//     totalsSection: {
//       flexDirection: "row",
//       borderTopWidth: 2,
//       borderColor: "#000",
//     },
//     calculations: {
//       flex: 1,
//       padding: 10,
//       borderRightWidth: 2,
//       borderColor: "#000",
//     },
//     totals: {
//       flex: 1,
//       padding: 10,
//     },
//     totalRow: {
//       flexDirection: "row",
//       justifyContent: "space-between",
//       marginBottom: 5,
//       fontSize: 12,
//     },
//     totalRowGrand: {
//       fontWeight: "bold",
//       fontSize: 14,
//       borderTopWidth: 2,
//       borderColor: "#000",
//       paddingTop: 5,
//     },
//     gstSection: {
//       marginTop: 15,
//       padding: 10,
//       borderWidth: 1,
//       borderColor: "#000",
//       fontSize: 11,
//     },
//     bankDetails: {
//       marginTop: 10,
//       fontSize: 11,
//       lineHeight: 1.4,
//     },
//     grandTotalSection: {
//       backgroundColor: "#f0f0f0",
//       padding: 10,
//       borderWidth: 2,
//       borderColor: "#000",
//       textAlign: "center",
//       fontWeight: "bold",
//       fontSize: 16,
//     },
//     amountWords: {
//       marginTop: 10,
//       fontSize: 12,
//       fontWeight: "bold",
//     },
//     footerInfo: {
//       marginTop: 10,
//       padding: 10,
//       fontSize: 10,
//       lineHeight: 1.4,
//     },
//     signatureSection: {
//       textAlign: "right",
//       marginTop: 20,
//       paddingRight: 10,
//       fontSize: 12,
//       fontWeight: "bold",
//     },
//   });

//   // PDF Component
//   const InvoicePDF = (
//     <Document>
//       <Page size="A4" style={styles.page}>
//         <View style={styles.container}>
//           {/* Header */}
//           <View style={styles.header}>
//             <View style={styles.logo}>
//               <Text style={styles.logoText}>ASHAPURI\nSECURITY</Text>
//             </View>
//             <View>
//               <Text style={styles.companyName}>ASHAPURI\nSECURITY\nSERVICES</Text>
//             </View>
//             <View style={styles.contactInfo}>
//               <Text>TG : 1, ABHILASH RESIDENCY, TIPI, TILODA CAMP ABC,</Text>
//               <Text>FLAT NO. 3, VIJAY TOWER, TRANSPORT NAGAR HIT (A.P.)</Text>
//               <Text>PIN NO. : 452 011 INDORE</Text>
//               <Text>MOBILE : 9425864914 / 9425864914</Text>
//               <Text>EMAIL : ashapurisecurity@yahoo.com</Text>
//             </View>
//           </View>
//           {/* Invoice Title */}
//           <View style={styles.invoiceTitle}>
//             <Text>INVOICE</Text>
//           </View>
//           {/* Invoice Details */}
//           <View style={styles.invoiceDetails}>
//             <View style={styles.clientInfo}>
//               <Text style={{ fontWeight: "bold" }}>{billTo || "M/S EXECUTIVE ENGINEER"}</Text>
//               <Text>MPPICL 400 KV TESTING DIVISION</Text>
//               <Text>PITHAMPUR ORDER No.</Text>
//               <Text>2307000 ACL W&W/TS-45/2023/3786</Text>
//               <Text>GSTIN NO 23AADCM4432C1Z3</Text>
//             </View>
//             <View style={styles.invoiceMeta}>
//               <View style={styles.metaTable}>
//                 <View style={styles.metaRow}>
//                   <Text style={[styles.metaCell, styles.metaCellHeader]}>INVOICE NO.</Text>
//                   <Text style={styles.metaCell}>{invoiceNumber}</Text>
//                 </View>
//                 <View style={styles.metaRow}>
//                   <Text style={[styles.metaCell, styles.metaCellHeader]}>DATE</Text>
//                   <Text style={styles.metaCell}>{dateStr}</Text>
//                 </View>
//                 <View style={styles.metaRow}>
//                   <Text style={[styles.metaCell, styles.metaCellHeader]}>MONTH OF</Text>
//                   <Text style={styles.metaCell}>{monthOf}</Text>
//                 </View>
//               </View>
//             </View>
//           </View>
//           {/* Items Table */}
//           <View style={styles.itemsTable}>
//             <View style={styles.tableRow}>
//               <Text style={[styles.tableCell, styles.tableHeader, { flex: 0.5 }]}>S. NO.</Text>
//               <Text style={[styles.tableCell, styles.tableHeader, { flex: 2 }]}>DESCRIPTION</Text>
//               <Text style={[styles.tableCell, styles.tableHeader]}>SAC</Text>
//               <Text style={[styles.tableCell, styles.tableHeader]}>NO. OF MAN DAYS/MONTH</Text>
//               <Text style={[styles.tableCell, styles.tableHeader]}>RATE</Text>
//               <Text style={[styles.tableCell, styles.tableHeader]}>AMOUNT</Text>
//             </View>
//             <View style={styles.tableRow}>
//               <Text style={[styles.tableCell, { flex: 6, textAlign: "left", fontWeight: "bold" }]}>UNARMED GUARD (unskilled)</Text>
//             </View>
//             <View style={styles.tableRow}>
//               <Text style={[styles.tableCell, { flex: 0.5 }]}>1</Text>
//               <Text style={[styles.tableCell, styles.tableCellLeft, { flex: 2 }]}>SECURITY SERVICES</Text>
//               <Text style={styles.tableCell}>998514</Text>
//               <Text style={styles.tableCell}>{totalPresentDays}</Text>
//               <Text style={styles.tableCell}>{Number(perDay).toFixed(2)}</Text>
//               <Text style={styles.tableCell}>{baseTotal.toFixed(2)}</Text>
//             </View>
//             <View style={styles.tableRow}>
//               <Text style={[styles.tableCell, { flex: 5, textAlign: "right", fontWeight: "bold" }]}>TOTAL</Text>
//               <Text style={styles.tableCell}>{baseTotal.toFixed(2)}</Text>
//             </View>
//           </View>
//           {/* Totals Section */}
//           <View style={styles.totalsSection}>
//             <View style={styles.calculations}>
//               <Text>PF @13%</Text>
//               <Text>ESIC @3.25%</Text>
//               <Text style={{ marginTop: 10, fontWeight: "bold" }}>SUB TOTAL</Text>
//               <Text style={{ marginTop: 10 }}>Service charge @7%</Text>
//             </View>
//             <View style={styles.totals}>
//               <View style={styles.totalRow}>
//                 <Text></Text>
//                 <Text>{pf.toFixed(2)}</Text>
//               </View>
//               <View style={styles.totalRow}>
//                 <Text></Text>
//                 <Text>{esic.toFixed(2)}</Text>
//               </View>
//               <View style={styles.totalRow}>
//                 <Text>TOTAL</Text>
//                 <Text>{subTotal.toFixed(2)}</Text>
//               </View>
//               <View style={styles.totalRow}>
//                 <Text></Text>
//                 <Text>{serviceChargeTotal.toFixed(2)}</Text>
//               </View>
//               <View style={[styles.totalRow, styles.totalRowGrand]}>
//                 <Text>TOTAL</Text>
//                 <Text>{totalBeforeTax.toFixed(2)}</Text>
//               </View>
//             </View>
//           </View>
//           {/* GST Section */}
//           <View style={styles.gstSection}>
//             <Text style={{ fontWeight: "bold" }}>Note:- As per Notification no. 29/2018 dated 31.12.2018</Text>
//             <Text style={{ fontWeight: "bold" }}>100% GST paid directly by you</Text>
//             <Text>CGST @ 9%     {cgst.toFixed(2)}</Text>
//             <Text>SGST @ 9%     {sgst.toFixed(2)}</Text>
//             <View style={styles.bankDetails}>
//               <Text style={{ fontWeight: "bold" }}>PUNJAB NATIONAL BANK</Text>
//               <Text>Pls Transfer Payment C/A 0788101000960</Text>
//               <Text>IFSC CODE : PUNB0078810</Text>
//               <Text>SCH. NO. 54, VIJAY NAGAR, INDORE</Text>
//             </View>
//           </View>
//           {/* Grand Total */}
//           <View style={styles.grandTotalSection}>
//             <Text style={{ fontSize: 20, marginBottom: 10 }}>GRAND TOTAL     {grandTotal}</Text>
//             <Text style={styles.amountWords}>{grandTotalInWords}</Text>
//           </View>
//           {/* Footer */}
//           <View style={styles.footerInfo}>
//             <Text>
//               <Text style={{ fontWeight: "bold" }}>
//                 GSTIN. NO. :23ADCPC7046H1ZZ                 PAN NO. : ADCPC7046H
//               </Text>
//             </Text>
//             <Text style={{ marginTop: 10 }}>
//               *Monthly Includes Reliever engaged for providing weekly off and leaves allowed for .... Nos. Mandays during the period. It is to be certified under oath that I have completed the above mentioned work as per terms & conditions given in the order. I have completed the statutory requirements viz.payments of minimum wages deposit of EPF and ESIC as mandated in transport rules under ACL payment sheet.the payment of wages made to employees,deposit of employees contribution deducted from salary and deposit of contribution of employer (both)for EPF and ESIC as given in the payment sheet enclosed for M/o ..... has been deposited in the account of employees. I have not claimed above bill previously. In case any information given above is found false/ incorrect the MPPTCL may take any action as deem fit and may also recover any excess amount so paid from me with interest and/or otherwise adjust from any amount due to me
//             </Text>
//           </View>
//           <View style={styles.signatureSection}>
//             <Text>FOR ASHAPURI SECURITY SERVICES</Text>
//           </View>
//         </View>
//       </Page>
//     </Document>
//   );

//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
//       <div className="w-full max-w-xl">
//         <div className="mb-6 flex flex-col sm:flex-row gap-2 items-start sm:items-end justify-between">
//           <div className="flex-1 w-full">
//             <label
//               className="text-slate-700 font-medium text-left"
//               htmlFor="billTo"
//             >
//               Bill To (Name):
//             </label>
//             <input
//               id="billTo"
//               type="text"
//               value={billTo}
//               onChange={(e) => setBillTo(e.target.value)}
//               placeholder="Enter name"
//               className="px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white/80 text-slate-800 font-medium w-full"
//             />
//           </div>
//           <PDFDownloadLink
//             document={InvoicePDF}
//             fileName={`${billTo || "invoice"}-${invoiceNumber}.pdf`}
//             className="mt-2 sm:mt-0 sm:ml-4 px-6 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all duration-200 text-center"
//           >
//             {({ loading }) => (loading ? "Preparing PDF..." : "Download PDF")}
//           </PDFDownloadLink>
//         </div>
//         <div className="bg-white/80 p-10 rounded-2xl shadow-xl download-invoice">
//           <h1 className="text-3xl font-bold mb-6 text-slate-800 text-center">
//             Invoice Preview
//           </h1>
//           <table className="w-full mb-2 text-slate-700 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
//             <tbody>
//               <tr>
//                 <td className="p-3 font-medium">Name</td>
//                 <td className="p-3">
//                   {billTo || (
//                     <span className="italic text-slate-400">
//                       (Not specified)
//                     </span>
//                   )}
//                 </td>
//               </tr>
//               <tr>
//                 <td className="p-3 font-medium">Date</td>
//                 <td className="p-3">{dateStr}</td>
//               </tr>
//               <tr>
//                 <td className="p-3 font-medium">Invoice Number</td>
//                 <td className="p-3">{invoiceNumber}</td>
//               </tr>
//             </tbody>
//           </table>
//           <table className="w-full mb-8 text-slate-700 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
//             <tbody>
//               <tr>
//                 <td className="p-3 font-medium">No. of Person</td>
//                 <td className="p-3">{totalEmployees}</td>
//                 <td className="p-3 font-medium">No. of Duty</td>
//                 <td className="p-3">{totalPresentDays}</td>
//               </tr>
//               <tr>
//                 <td className="p-3 font-medium">Rate</td>
//                 <td className="p-3">₹{Number(perDay).toFixed(2)}</td>
//                 <td className="p-3 font-medium">Amount</td>
//                 <td className="p-3">₹{baseTotal.toFixed(2)}</td>
//               </tr>
//             </tbody>
//           </table>
//           <div className="space-y-4 text-slate-700">
//             <div className="flex justify-between border-b pb-2 mt-4">
//               <span className="font-semibold">Sub Total:</span>
//               <span className="font-semibold">₹{baseTotal.toFixed(2)}</span>
//             </div>
//             <div className="flex justify-between">
//               <span>Service Charge @ 7%:</span>
//               <span>₹{serviceCharge.toFixed(2)}</span>
//             </div>
//             <div className="flex justify-between">
//               <span>PF @ 13%:</span>
//               <span>₹{pf.toFixed(2)}</span>
//             </div>
//             <div className="flex justify-between">
//               <span>ESIC @ 3.25%:</span>
//               <span>₹{esic.toFixed(2)}</span>
//             </div>
//             <div className="flex justify-between border-t pt-2 mt-4">
//               <span className="font-semibold">Total:</span>
//               <span className="font-semibold">₹{subTotal.toFixed(2)}</span>
//             </div>
//             <div className="flex justify-between">
//               <span>Round off:</span>
//               <span>₹{roundOffSubTotal}</span>
//             </div>
//             <div className="flex justify-between">
//               <span>CGST @ 9%:</span>
//               <span>₹{cgst.toFixed(2)}</span>
//             </div>
//             <div className="flex justify-between">
//               <span>SGST @ 9%:</span>
//               <span>₹{sgst.toFixed(2)}</span>
//             </div>
//             <div className="flex justify-between">
//               <span>R/O:</span>
//               <span>{roundOffDiff}</span>
//             </div>
//             <div className="flex justify-between border-t-2 pt-4 mt-4 text-xl font-bold text-indigo-700">
//               <span>Grand Total:</span>
//               <span>₹{grandTotal.toLocaleString()}</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default InvoicePage;

//

// v1
// import { useLocation, useNavigate } from "react-router-dom";
// import { useEffect, useState } from "react";
// import {
//   PDFDownloadLink,
//   Page,
//   Text,
//   View,
//   Document,
//   StyleSheet,
// } from "@react-pdf/renderer";

// function InvoicePage() {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { totalEmployees, totalPresentDays, perDay } = location.state || {};

//   // Rates
//   const SERVICE_CHARGE_RATE = 0.01;
//   const PF_RATE = 0.13;
//   const ESIC_RATE = 0.0325;
//   const CGST_RATE = 0.09;
//   const SGST_RATE = 0.09;

//   // Name, Date, Invoice Number
//   const [billTo, setBillTo] = useState("");
//   const today = new Date();
//   const dateStr = today.toLocaleDateString("en-CA"); // yyyy-mm-dd
//   const invoiceNumber = `INV${today.getFullYear()}${String(
//     today.getMonth() + 1
//   ).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}${Math.floor(
//     100 + Math.random() * 900
//   )}`;

//   useEffect(() => {
//     if (
//       !location.state ||
//       totalEmployees == null ||
//       totalPresentDays == null ||
//       perDay == null
//     ) {
//       navigate("/", { replace: true });
//     }
//   }, [location.state, totalEmployees, totalPresentDays, perDay, navigate]);

//   // Calculations
//   const baseTotal = Number(totalPresentDays) * Number(perDay);
//   const serviceCharge = baseTotal * SERVICE_CHARGE_RATE;
//   const pf = baseTotal * PF_RATE;
//   const esic = baseTotal * ESIC_RATE;
//   const subTotal = baseTotal + serviceCharge + pf + esic;
//   const roundOffSubTotal = Math.round(subTotal);
//   const roundOffDiff = (roundOffSubTotal - subTotal).toFixed(2);
//   const cgst = roundOffSubTotal * CGST_RATE;
//   const sgst = roundOffSubTotal * SGST_RATE;
//   const grandTotal = Math.round(roundOffSubTotal + cgst + sgst);

//   // PDF Styles
//   const styles = StyleSheet.create({
//     page: {
//       padding: 24,
//       fontSize: 12,
//       fontFamily: "Helvetica",
//       backgroundColor: "#fff",
//     },
//     section: { marginBottom: 16 },
//     heading: {
//       fontSize: 20,
//       fontWeight: "bold",
//       marginBottom: 16,
//       textAlign: "center",
//       color: "#3730a3",
//     },
//     table: {
//       display: "table",
//       width: 320,
//       marginBottom: 12,
//       borderStyle: "solid",
//       borderWidth: 1,
//       borderColor: "#e5e7eb",
//       marginLeft: "auto",
//       marginRight: "auto",
//     },
//     row: { flexDirection: "row", width: 320 },
//     cell: {
//       padding: 6,
//       borderRightWidth: 1,
//       borderBottomWidth: 1,
//       borderColor: "#e5e7eb",
//       width: 160,
//       fontSize: 12,
//     },
//     cellHeader: { fontWeight: "bold", backgroundColor: "#f3f4f6" },
//     total: { fontWeight: "bold", fontSize: 14, color: "#3730a3" },
//     grand: {
//       fontWeight: "bold",
//       fontSize: 16,
//       color: "#7c3aed",
//       marginTop: 10,
//     },
//     parent: { width: 340, margin: "0 auto" },
//     alignRight: { textAlign: "right" },
//     number: { fontWeight: "bold" },
//   });

//   // PDF Component
//   const InvoicePDF = (
//     <Document>
//       <Page size="A4" style={styles.page} renderPageNumber={false}>
//         <View style={styles.parent}>
//           <Text style={styles.heading}>Invoice</Text>
//           <View style={styles.section}>
//             {/* Table 1: name, date, invoice no. (each in its own row) */}
//             <View style={styles.table}>
//               <View style={styles.row}>
//                 <Text style={[styles.cell, styles.cellHeader]}>Name</Text>
//                 <Text style={styles.cell}>{billTo || "(Not specified)"}</Text>
//               </View>
//               <View style={styles.row}>
//                 <Text style={[styles.cell, styles.cellHeader]}>Date</Text>
//                 <Text style={styles.cell}>{dateStr}</Text>
//               </View>
//               <View style={styles.row}>
//                 <Text style={[styles.cell, styles.cellHeader]}>
//                   Invoice No.
//                 </Text>
//                 <Text style={styles.cell}>{invoiceNumber}</Text>
//               </View>
//             </View>
//             {/* Table 2: no of person, no of duty, rate, amount (each in its own row) */}
//             <View style={styles.table}>
//               <View style={styles.row}>
//                 <Text style={[styles.cell, styles.cellHeader]}>
//                   No. of Person
//                 </Text>
//                 <Text style={styles.cell}>{`${totalEmployees}`}</Text>
//               </View>
//               <View style={styles.row}>
//                 <Text style={[styles.cell, styles.cellHeader]}>
//                   No. of Duty
//                 </Text>
//                 <Text style={styles.cell}>{`${totalPresentDays}`}</Text>
//               </View>
//               <View style={styles.row}>
//                 <Text style={[styles.cell, styles.cellHeader]}>Rate</Text>
//                 <Text style={[styles.cell, styles.number]}>{`${Number(
//                   perDay
//                 ).toFixed(2)}`}</Text>
//               </View>
//               <View style={styles.row}>
//                 <Text style={[styles.cell, styles.cellHeader]}>Amount</Text>
//                 <Text
//                   style={[styles.cell, styles.number]}
//                 >{`${baseTotal.toFixed(2)}`}</Text>
//               </View>
//             </View>
//           </View>
//           <View style={styles.section}>
//             <View style={styles.table}>
//               <View style={styles.row}>
//                 <Text style={styles.cell}>Sub Total:</Text>
//                 <Text
//                   style={[styles.cell, styles.alignRight, styles.number]}
//                 >{`${baseTotal.toFixed(2)}`}</Text>
//               </View>
//               <View style={styles.row}>
//                 <Text style={styles.cell}>Service Charge @ 1%:</Text>
//                 <Text
//                   style={[styles.cell, styles.alignRight, styles.number]}
//                 >{`${serviceCharge.toFixed(2)}`}</Text>
//               </View>
//               <View style={styles.row}>
//                 <Text style={styles.cell}>PF @ 13%:</Text>
//                 <Text
//                   style={[styles.cell, styles.alignRight, styles.number]}
//                 >{`${pf.toFixed(2)}`}</Text>
//               </View>
//               <View style={styles.row}>
//                 <Text style={styles.cell}>ESIC @ 3.25%:</Text>
//                 <Text
//                   style={[styles.cell, styles.alignRight, styles.number]}
//                 >{`${esic.toFixed(2)}`}</Text>
//               </View>
//               <View style={styles.row}>
//                 <Text style={styles.cell}>Total:</Text>
//                 <Text
//                   style={[styles.cell, styles.alignRight, styles.number]}
//                 >{`${subTotal.toFixed(2)}`}</Text>
//               </View>
//               <View style={styles.row}>
//                 <Text style={styles.cell}>Round off:</Text>
//                 <Text
//                   style={[styles.cell, styles.alignRight, styles.number]}
//                 >{`${roundOffSubTotal}`}</Text>
//               </View>
//               <View style={styles.row}>
//                 <Text style={styles.cell}>CGST @ 9%:</Text>
//                 <Text
//                   style={[styles.cell, styles.alignRight, styles.number]}
//                 >{`${cgst.toFixed(2)}`}</Text>
//               </View>
//               <View style={styles.row}>
//                 <Text style={styles.cell}>SGST @ 9%:</Text>
//                 <Text
//                   style={[styles.cell, styles.alignRight, styles.number]}
//                 >{`${sgst.toFixed(2)}`}</Text>
//               </View>
//               <View style={styles.row}>
//                 <Text style={styles.cell}>R/O:</Text>
//                 <Text
//                   style={[styles.cell, styles.alignRight, styles.number]}
//                 >{`${roundOffDiff}`}</Text>
//               </View>
//               <View style={styles.row}>
//                 <Text style={[styles.cell, styles.grand]}>Grand Total:</Text>
//                 <Text
//                   style={[
//                     styles.cell,
//                     styles.grand,
//                     styles.alignRight,
//                     styles.number,
//                   ]}
//                 >{`${grandTotal.toLocaleString()}`}</Text>
//               </View>
//             </View>
//           </View>
//         </View>
//       </Page>
//     </Document>
//   );

//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
//       <div className="w-full max-w-xl">
//         <div className="mb-6 flex flex-col sm:flex-row gap-2 items-start sm:items-end justify-between">
//           <div className="flex-1 w-full">
//             <label
//               className="text-slate-700 font-medium text-left"
//               htmlFor="billTo"
//             >
//               Bill To (Name):
//             </label>
//             <input
//               id="billTo"
//               type="text"
//               value={billTo}
//               onChange={(e) => setBillTo(e.target.value)}
//               placeholder="Enter name"
//               className="px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white/80 text-slate-800 font-medium w-full"
//             />
//           </div>
//           <PDFDownloadLink
//             document={InvoicePDF}
//             fileName={`${billTo || "invoice"}-${invoiceNumber}.pdf`}
//             className="mt-2 sm:mt-0 sm:ml-4 px-6 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all duration-200 text-center"
//           >
//             {({ loading }) => (loading ? "Preparing PDF..." : "Download PDF")}
//           </PDFDownloadLink>
//         </div>
//         <div className="bg-white/80 p-10 rounded-2xl shadow-xl download-invoice">
//           <h1 className="text-3xl font-bold mb-6 text-slate-800 text-center">
//             Invoice
//           </h1>
//           {/* Table 1: name | date | invoice no. */}
//           <table className="w-full mb-2 text-slate-700 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
//             <tbody>
//               <tr>
//                 <td className="p-3 font-medium">Name</td>
//                 <td className="p-3">
//                   {billTo || (
//                     <span className="italic text-slate-400">
//                       (Not specified)
//                     </span>
//                   )}
//                 </td>
//               </tr>
//               <tr>
//                 <td className="p-3 font-medium">Date</td>
//                 <td className="p-3">{dateStr}</td>
//               </tr>
//               <tr>
//                 <td className="p-3 font-medium">Invoice Number</td>
//                 <td className="p-3">{invoiceNumber}</td>
//               </tr>
//             </tbody>
//           </table>
//           {/* Table 2: no of person | no of duty | rate | amount */}
//           <table className="w-full mb-8 text-slate-700 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
//             <tbody>
//               <tr>
//                 <td className="p-3 font-medium">No. of Person</td>
//                 <td className="p-3">{totalEmployees}</td>
//                 <td className="p-3 font-medium">No. of Duty</td>
//                 <td className="p-3">{totalPresentDays}</td>
//               </tr>
//               <tr>
//                 <td className="p-3 font-medium">Rate</td>
//                 <td className="p-3">₹{Number(perDay).toFixed(2)}</td>
//                 <td className="p-3 font-medium">Amount</td>
//                 <td className="p-3">₹{baseTotal.toFixed(2)}</td>
//               </tr>
//             </tbody>
//           </table>
//           <div className="space-y-4 text-slate-700">
//             <div className="flex justify-between border-b pb-2 mt-4">
//               <span className="font-semibold">Sub Total:</span>
//               <span className="font-semibold">₹{baseTotal.toFixed(2)}</span>
//             </div>
//             <div className="flex justify-between">
//               <span>Service Charge @ 1%:</span>
//               <span>₹{serviceCharge.toFixed(2)}</span>
//             </div>
//             <div className="flex justify-between">
//               <span>PF @ 13%:</span>
//               <span>₹{pf.toFixed(2)}</span>
//             </div>
//             <div className="flex justify-between">
//               <span>ESIC @ 3.25%:</span>
//               <span>₹{esic.toFixed(2)}</span>
//             </div>
//             <div className="flex justify-between border-t pt-2 mt-4">
//               <span className="font-semibold">Total:</span>
//               <span className="font-semibold">₹{subTotal.toFixed(2)}</span>
//             </div>
//             <div className="flex justify-between">
//               <span>Round off:</span>
//               <span>₹{roundOffSubTotal}</span>
//             </div>
//             <div className="flex justify-between">
//               <span>CGST @ 9%:</span>
//               <span>₹{cgst.toFixed(2)}</span>
//             </div>
//             <div className="flex justify-between">
//               <span>SGST @ 9%:</span>
//               <span>₹{sgst.toFixed(2)}</span>
//             </div>
//             <div className="flex justify-between">
//               <span>R/O:</span>
//               <span>{roundOffDiff}</span>
//             </div>
//             <div className="flex justify-between border-t-2 pt-4 mt-4 text-xl font-bold text-indigo-700">
//               <span>Grand Total:</span>
//               <span>₹{grandTotal.toLocaleString()}</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default InvoicePage;
