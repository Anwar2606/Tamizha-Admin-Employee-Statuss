import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import Sidebar from "../Sidebar/Sidebar";
import "./EmployeeStatus.css";

dayjs.extend(customParseFormat);

const sidebarWidth = 220;

const EmployeeTable = () => {
  const [employees, setEmployees] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [clickupData, setClickupData] = useState([]);
  const [trackabiData, setTrackabiData] = useState([]);
  const [workdoneData, setWorkdoneData] = useState([]); // <-- new state for workdone

  const [selectedMonth, setSelectedMonth] = useState(dayjs().format("YYYY-MM"));
  const [statusCounts, setStatusCounts] = useState({});
  const [clickupCountsByName, setClickupCountsByName] = useState({});
  const [trackabiCountsByName, setTrackabiCountsByName] = useState({});
  const [workdoneCountsByName, setWorkdoneCountsByName] = useState({}); // <-- new counts state

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const snapshot = await getDocs(collection(db, "employees"));
        const empList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEmployees(empList);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };
    fetchEmployees();
  }, []);

  // Fetch attendance
  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        const snapshot = await getDocs(collection(db, "attendance"));
        const records = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAttendanceData(records);
      } catch (error) {
        console.error("Error fetching attendance data:", error);
      }
    };
    fetchAttendanceData();
  }, []);

  // Fetch clickup data
  useEffect(() => {
    const fetchClickupData = async () => {
      try {
        const snapshot = await getDocs(collection(db, "clickup"));
        const records = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setClickupData(records);
      } catch (error) {
        console.error("Error fetching clickup data:", error);
      }
    };
    fetchClickupData();
  }, []);

  // Fetch trackabi data
  useEffect(() => {
    const fetchTrackabiData = async () => {
      try {
        const snapshot = await getDocs(collection(db, "trackabi"));
        const records = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTrackabiData(records);
      } catch (error) {
        console.error("Error fetching trackabi data:", error);
      }
    };
    fetchTrackabiData();
  }, []);

  // Fetch workdone data (NEW)
  useEffect(() => {
    const fetchWorkdoneData = async () => {
      try {
        const snapshot = await getDocs(collection(db, "workdone"));
        const records = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setWorkdoneData(records);
      } catch (error) {
        console.error("Error fetching workdone data:", error);
      }
    };
    fetchWorkdoneData();
  }, []);

  // Calculate attendance counts grouped by employeeId
  useEffect(() => {
    if (!attendanceData.length) return;

    const counts = {};

    attendanceData.forEach((item) => {
      if (!item.status || !item.employeeId || !item.date) return;

      const rawStatus = item.status.toString().trim().toLowerCase();

      let status;
      if (
        rawStatus === "halfday" ||
        rawStatus === "half-day" ||
        rawStatus === "half day"
      ) {
        status = "halfday";
      } else if (rawStatus === "present") {
        status = "present";
      } else if (rawStatus === "absent") {
        status = "absent";
      } else {
        return;
      }

      let dateObj;
      try {
        if (item.date?.toDate) {
          dateObj = item.date.toDate();
        } else if (typeof item.date === "string") {
          dateObj = dayjs(item.date, "DD-MM-YYYY").toDate();
        } else {
          dateObj = new Date(item.date);
        }
      } catch {
        return;
      }

      const itemMonth = dayjs(dateObj).format("YYYY-MM");
      if (itemMonth !== selectedMonth) return;

      const empId = item.employeeId;

      if (!counts[empId]) {
        counts[empId] = { present: 0, absent: 0, halfday: 0 };
      }

      counts[empId][status]++;
    });

    setStatusCounts(counts);
  }, [attendanceData, selectedMonth]);

  // Calculate clickup "yes" counts grouped by name
  useEffect(() => {
    if (!clickupData.length) return;

    const counts = {};

    clickupData.forEach((item) => {
      if (!item.status || !item.name || !item.date) return;

      const statusLower = item.status.toString().trim().toLowerCase();
      if (statusLower !== "yes") return;

      let dateObj;
      try {
        if (item.date?.toDate) {
          dateObj = item.date.toDate();
        } else if (typeof item.date === "string") {
          dateObj = dayjs(item.date, "DD-MM-YYYY").toDate();
        } else {
          dateObj = new Date(item.date);
        }
      } catch {
        return;
      }

      const itemMonth = dayjs(dateObj).format("YYYY-MM");
      if (itemMonth !== selectedMonth) return;

      const empName = item.name;

      if (!counts[empName]) {
        counts[empName] = 0;
      }

      counts[empName]++;
    });

    setClickupCountsByName(counts);
  }, [clickupData, selectedMonth]);

  // Calculate trackabi "yes" counts grouped by name
  useEffect(() => {
    if (!trackabiData.length) return;

    const counts = {};

    trackabiData.forEach((item) => {
      if (!item.status || !item.name || !item.date) return;

      const statusLower = item.status.toString().trim().toLowerCase();
      if (statusLower !== "yes") return;

      let dateObj;
      try {
        if (item.date?.toDate) {
          dateObj = item.date.toDate();
        } else if (typeof item.date === "string") {
          dateObj = dayjs(item.date, "DD-MM-YYYY").toDate();
        } else {
          dateObj = new Date(item.date);
        }
      } catch {
        return;
      }

      const itemMonth = dayjs(dateObj).format("YYYY-MM");
      if (itemMonth !== selectedMonth) return;

      const empName = item.name;

      if (!counts[empName]) {
        counts[empName] = 0;
      }

      counts[empName]++;
    });

    setTrackabiCountsByName(counts);
  }, [trackabiData, selectedMonth]);

  // Calculate workdone "yes" counts grouped by name (NEW)
  useEffect(() => {
    if (!workdoneData.length) return;

    const counts = {};

    workdoneData.forEach((item) => {
      if (!item.status || !item.name || !item.date) return;

      const statusLower = item.status.toString().trim().toLowerCase();
      if (statusLower !== "yes") return;

      let dateObj;
      try {
        if (item.date?.toDate) {
          dateObj = item.date.toDate();
        } else if (typeof item.date === "string") {
          dateObj = dayjs(item.date, "DD-MM-YYYY").toDate();
        } else {
          dateObj = new Date(item.date);
        }
      } catch {
        return;
      }

      const itemMonth = dayjs(dateObj).format("YYYY-MM");
      if (itemMonth !== selectedMonth) return;

      const empName = item.name;

      if (!counts[empName]) {
        counts[empName] = 0;
      }

      counts[empName]++;
    });

    setWorkdoneCountsByName(counts);
  }, [workdoneData, selectedMonth]);

  return (
   <div className="employee-container">
  <div className="employee-sidebar">
    <Sidebar />
  </div>

  <main className="employee-main">
    <h2 className="employee-title">Employee Attendance Summary</h2>

    <label className="employee-filter-label">
      Filter by Month:{" "}
      <input
        type="month"
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(e.target.value)}
        className="employee-filter-input"
      />
    </label>

    <table className="employee-table">
      <thead>
        <tr>
          <th>S.No</th>
          <th>Name</th>
          <th>Present</th>
          <th>Absent</th>
          <th>Tardy</th>
          <th>ClickUp</th>
          <th>Trackabi</th>
          <th>Workdone</th>
        </tr>
      </thead>
      <tbody>
        {employees.length === 0 ? (
          <tr>
            <td colSpan={8} className="employee-empty">
              No employees found.
            </td>
          </tr>
        ) : (
          employees.map((emp, index) => {
            const attendance = statusCounts[emp.id] || {
              present: 0,
              absent: 0,
              halfday: 0,
            };
            return (
              <tr key={emp.id}>
                <td>{index + 1}</td>
                <td>{emp.name}</td>
                <td>{attendance.present}</td>
                <td>{attendance.absent}</td>
                <td>{attendance.halfday}</td>
                <td>{clickupCountsByName[emp.name] || 0}</td>
                <td>{trackabiCountsByName[emp.name] || 0}</td>
                <td>{workdoneCountsByName[emp.name] || 0}</td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  </main>
</div>

  );
};

export default EmployeeTable;
