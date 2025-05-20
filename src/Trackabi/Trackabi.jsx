import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import './Trackabi.css';
import {
  collection,
  getDocs,
  setDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import Sidebar from "../Sidebar/Sidebar";

const Trackabi = () => {
  const [employees, setEmployees] = useState([]);
  const [saving, setSaving] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  useEffect(() => {
    if (!saving) {
      fetchEmployeesWithStatus(selectedDate);
    }
  }, [selectedDate, saving]);

  const fetchEmployeesWithStatus = async (date) => {
    const snapshot = await getDocs(collection(db, "employees"));
    const empData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const formattedDate = date.split("-").reverse().join("-");
    const updatedData = await Promise.all(
      empData.map(async (emp) => {
        const dailyDocId = `${emp.id}_${formattedDate}`;
        const statusSnap = await getDoc(doc(db, "trackabi", dailyDocId));
        return {
          ...emp,
          status: statusSnap.exists() && statusSnap.data().status
            ? statusSnap.data().status
            : "",
        };
      })
    );

    setEmployees(updatedData);
  };

  const handleStatusChange = async (id, value) => {
    // Removed the early return to allow saving empty status ("")
    try {
      setSaving(id);
      const selectedEmp = employees.find((emp) => emp.id === id);
      const currentDateFormatted = selectedDate.split("-").reverse().join("-");
      const dailyDocId = `${id}_${currentDateFormatted}`;

      await setDoc(doc(db, "clickup", dailyDocId), {
        name: selectedEmp.name,
        designation: selectedEmp.designation,
        status: value,  // value can be "" when selecting "Select Status"
        date: currentDateFormatted,
      });

      // Update local state immediately
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === id ? { ...emp, status: value } : emp
        )
      );

      console.log(`Status for ${id} saved as ${value}`);
    } catch (error) {
      console.error("Error updating clickup collection:", error);
    } finally {
      setSaving(null);
    }
  };

  const totalCompleted = employees.filter((emp) => emp.status === "yes").length;
  const totalIncomplete = employees.length - totalCompleted;

  return (
    <div className="clickup-container">
      <div className="clickup-sidebar">
        <Sidebar />
      </div>

      <div className="clickup-main">
        <h2 className="clickup-heading">Employee Trackabi Status</h2>

        <div className="clickup-widgets">
          <div className="clickup-widget">
            <h4>Total Employees</h4>
            <p>{employees.length}</p>
          </div>
          <div className="clickup-widget">
            <h4>Completed</h4>
            <p>{totalCompleted}</p>
          </div>
          <div className="clickup-widget">
            <h4>Incomplete</h4>
            <p>{totalIncomplete}</p>
          </div>
          <div className="clickup-widget">
            <h4>Select Date</h4>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <div className="clickup-widget clickup-logo-widget">
            <img
              src="https://trackabi.com/img/front/press-kit/Trackabi-Logo-Square.svg"
              alt="ClickUp Logo"
              style={{ width: "100px", marginTop: "10px" }}
            />
          </div>
        </div>

        <table className="clickup-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Designation</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id}>
                <td>{emp.name}</td>
                <td>{emp.designation}</td>
                <td>
                  <select
                    value={emp.status ?? ""}
                    onChange={(e) => handleStatusChange(emp.id, e.target.value)}
                    className="clickup-dropdown"
                  >
                    <option value="">Select Status</option>
                    <option value="yes">Completed</option>
                    <option value="no">Incomplete</option>
                  </select>
                  {saving === emp.id && (
                    <span className="clickup-saving-text">Saving...</span>
                  )}
                </td>
                <td>{selectedDate.split("-").reverse().join("-")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Trackabi;
