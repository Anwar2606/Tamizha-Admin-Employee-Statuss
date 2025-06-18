import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import "./DailyAttendance.css";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import Sidebar from "../Sidebar/Sidebar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DailyAttendance = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [timeInputs, setTimeInputs] = useState({});

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (employees.length > 0) {
      fetchAttendanceStatus();
    }
  }, [selectedDate, employees.length]);

  const fetchEmployees = async () => {
    const snapshot = await getDocs(collection(db, "employees"));
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setEmployees(data);
  };

  const fetchAttendanceStatus = async () => {
    const formattedDate = selectedDate.split("-").reverse().join("-");
    const updatedEmployees = await Promise.all(
      employees.map(async (emp) => {
        const docId = `${emp.id}_${formattedDate}`;
        const ref = doc(db, "attendance", docId);
        const snap = await getDoc(ref);

        return {
          ...emp,
          status: snap.exists() ? snap.data().status : "Select Status",
          entryTime: snap.exists() ? snap.data().entryTime || "" : "",
          leavingTime: snap.exists() ? snap.data().leavingTime || "" : "",
        };
      })
    );

    setEmployees(updatedEmployees);

    const inputs = {};
    updatedEmployees.forEach((emp) => {
      inputs[emp.id] = {
        entryTime: emp.entryTime,
        leavingTime: emp.leavingTime,
      };
    });
    setTimeInputs(inputs);
  };

 const handleAttendanceChange = async (id, name, status) => {
  if (status === "Select Status") return;

  const formattedDate = selectedDate.split("-").reverse().join("-");
  const docId = `${id}_${formattedDate}`;
  const ref = doc(db, "attendance", docId);

  let entryTime = "";
  let leavingTime = "";

  if (status !== "Absent") {
    const nowTime = new Date().toLocaleTimeString("en-IN", {
      hour12: false,
    }).slice(0, 5);

    const existing = await getDoc(ref);
    entryTime = existing.exists()
      ? existing.data().entryTime || nowTime
      : nowTime;
    leavingTime = existing.exists() ? existing.data().leavingTime || "" : "";
  }

  const data = {
    employeeId: id,
    name,
    status,
    date: formattedDate,
    entryTime: status === "Absent" ? "" : entryTime,
    leavingTime: status === "Absent" ? "" : leavingTime,
  };

  await setDoc(ref, data);

  // ✅ Update both employees and timeInputs state
  setEmployees((prev) =>
    prev.map((emp) =>
      emp.id === id ? { ...emp, status, entryTime: data.entryTime, leavingTime: data.leavingTime } : emp
    )
  );

  setTimeInputs((prev) => ({
    ...prev,
    [id]: {
      entryTime: data.entryTime,
      leavingTime: data.leavingTime,
    },
  }));
};


  const handleTimeChange = (id, field, value) => {
    setTimeInputs((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleManualTimeSave = async (id, name) => {
    const formattedDate = selectedDate.split("-").reverse().join("-");
    const docId = `${id}_${formattedDate}`;
    const ref = doc(db, "attendance", docId);

    const employee = employees.find((e) => e.id === id);
    const status = employee?.status || "Select Status";

    if (status === "Select Status") {
      toast.error(`Please select a status for ${name}`);
      return;
    }

    const data = {
      employeeId: id,
      name,
      status,
      date: formattedDate,
      entryTime: timeInputs[id]?.entryTime || "",
      leavingTime: timeInputs[id]?.leavingTime || "",
    };

    await setDoc(ref, data);

    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === id ? { ...emp, ...data } : emp
      )
    );

    toast.success(`Attendance saved for ${name}`);
  };

  return (
    <div className="attendance-container">
      <div className="attendance-sidebar">
        <Sidebar />
      </div>
      <div className="attendance-main">
        <h2 className="attendance-heading">Employee Attendance</h2>

        <div className="attendance-widgets">
          <div className="attendance-widget">
            <h4>Select Date</h4>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>

        <div className="attendance-table-container">
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Attendance</th>
                <th>Date</th>
                <th>Entry Time</th>
                <th>Leaving Time</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id}>
                  <td>{emp.name}</td>
                  <td>
                    <select
  value={emp.status}
  onChange={(e) =>
    handleAttendanceChange(emp.id, emp.name, e.target.value)
  }
>
  <option value="Select Status">Select Status</option>
  <option value="Present">Present</option>
  <option value="Absent">Absent</option>
  <option value="Half Day">Half Day</option>
  <option value="Casual Leave">Casual Leave</option> {/* ✅ Added */}
</select>

                  </td>
                  <td>{selectedDate.split("-").reverse().join("-")}</td>
                  <td>
                    <input
                      type="time"
                      value={timeInputs[emp.id]?.entryTime || ""}
                      onChange={(e) =>
                        handleTimeChange(emp.id, "entryTime", e.target.value)
                      }
                      disabled={emp.status === "Absent" || emp.status === "Select Status"}
                    />
                  </td>
                  <td>
                    <input
                      type="time"
                      value={timeInputs[emp.id]?.leavingTime || ""}
                      onChange={(e) =>
                        handleTimeChange(emp.id, "leavingTime", e.target.value)
                      }
                      disabled={emp.status === "Absent" || emp.status === "Select Status"}
                    />
                  </td>
                  <td>
                    <button
                      onClick={() => handleManualTimeSave(emp.id, emp.name)}
                      className="attendance-save-button"
                    >
                      Save
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ToastContainer position="top-right" autoClose={2000} />
      </div>
    </div>
  );
};

export default DailyAttendance;
