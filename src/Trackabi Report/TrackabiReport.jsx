import React, { useEffect, useState } from "react";
import { db } from "../firebase"; // your Firebase config file
import { collection, getDocs, query, where } from "firebase/firestore";
import Sidebar from "../Sidebar/Sidebar";
import "./TrackabiReport.css";

const TrackabiReport = () => {
  const [selectedDate, setSelectedDate] = useState(getTodayISODate());
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper to get today in yyyy-mm-dd format (for input type="date")
  function getTodayISODate() {
    const today = new Date();
    return today.toISOString().split("T")[0]; // yyyy-mm-dd
  }

  // Convert yyyy-mm-dd to dd-mm-yyyy format (your Firestore format)
  function formatDateToFirestore(dateISO) {
    const [year, month, day] = dateISO.split("-");
    return `${day}-${month}-${year}`;
  }

  useEffect(() => {
    fetchAttendanceByDate(selectedDate);
  }, [selectedDate]);

  const fetchAttendanceByDate = async (dateISO) => {
    setLoading(true);
    try {
      const formattedDate = formatDateToFirestore(dateISO);
      const attendanceRef = collection(db, "trackabi");
      const q = query(attendanceRef, where("date", "==", formattedDate));
      const querySnapshot = await getDocs(q);

      const attendanceList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setAttendance(attendanceList);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setAttendance([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="attendance-container">
      <Sidebar/>
      <div className="attendance-content">
        <h2 className="attendance-heading">Attendance Report</h2>

        <label>
          Select Date:{" "}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={getTodayISODate()}
            className="attendance-date-input"
          />
        </label>

        {loading ? (
          <p>Loading attendance data...</p>
        ) : attendance.length === 0 ? (
          <p>No attendance records for {selectedDate}</p>
        ) : (
          <table className="attendance-table">
            <thead className="attendance-table-head">
              <tr>
                <th className="attendance-th">Employee Name</th>
                <th className="attendance-th">Status</th>
              </tr>
            </thead>
            <tbody className="attendance-table-body">
              {attendance.map((record) => (
                <tr key={record.id} className="attendance-row">
                  <td className="attendance-td">{record.name || "No Name"}</td>
                  <td className="attendance-td">{record.status || "No Status"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TrackabiReport;
