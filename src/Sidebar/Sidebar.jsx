import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaBars,
  FaHome,
  FaUser,
  FaSignOutAlt,
  FaClock,
  FaTasks,
  FaFile,
} from "react-icons/fa";
import { RiCheckboxCircleFill } from "react-icons/ri";
import { IoCalendarNumberSharp } from "react-icons/io5";
import "./Sidebar.css";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [reportDropdownOpen, setReportDropdownOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const toggleDropdown = () => {
    setReportDropdownOpen(!reportDropdownOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
    setReportDropdownOpen(false);
  };

  return (
    <>
      <button className="mobile-toggle-btn" onClick={toggleSidebar}>
        <FaBars />
      </button>

      <div className={`sidebar-container ${isOpen ? "open" : "closed"}`}>
        <div className="sidebar">
          <div className="sidebar-title">
            <h2>Tamizha</h2>
          </div>
          <ul className="sidebar-menu">
            <li>
              <Link to="/dashboard" className="sidebar-link" onClick={closeSidebar}>
                <FaHome className="icon" />
                <span className="menu-text">Home</span>
              </Link>
            </li>
            <li>
              <Link to="/clickup" className="sidebar-link" onClick={closeSidebar}>
                <FaTasks className="icon" />
                <span className="menu-text">Click up</span>
              </Link>
            </li>
            <li>
              <Link to="/trackabi" className="sidebar-link" onClick={closeSidebar}>
                <FaClock className="icon" />
                <span className="menu-text">Trackabi</span>
              </Link>
            </li>
            <li>
              <Link to="/workdone" className="sidebar-link" onClick={closeSidebar}>
                <FaFile className="icon" />
                <span className="menu-text">Workdone</span>
              </Link>
            </li>
            <li>
              <Link to="/dailyattendance" className="sidebar-link" onClick={closeSidebar}>
                <RiCheckboxCircleFill className="icon" />
                <span className="menu-text">Attendance</span>
              </Link>
            </li>

            {/* Monthly Report with Dropdown */}
            <li className="dropdown-item">
              <div className="sidebar-link" onClick={toggleDropdown}>
                <IoCalendarNumberSharp className="icon" />
                <span className="menu-text">All Reports</span>
                <span className="dropdown-arrow">{reportDropdownOpen ? "▲" : "▼"}</span>
              </div>
              {reportDropdownOpen && (
                <ul className="dropdown-submenu">
                  <li>
                    <Link to="/monthlyattendance" className="sidebar-link sub" onClick={closeSidebar}>
                      Monthly Report
                    </Link>
                  </li>
                  <li>
                    <Link to="/attendancereport" className="sidebar-link sub" onClick={closeSidebar}>
                      Daily Attendance
                    </Link>
                  </li>
                  <li>
                    <Link to="/workdonereport" className="sidebar-link sub" onClick={closeSidebar}>
                      Daily Work Done
                    </Link>
                  </li>
                  <li>
                    <Link to="/clickupreport" className="sidebar-link sub" onClick={closeSidebar}>
                      Daily Click Up
                    </Link>
                  </li>
                   <li>
                    <Link to="/trackabireport" className="sidebar-link sub" onClick={closeSidebar}>
                      Daily Trackabi
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            <li>
              <Link to="/employeelist" className="sidebar-link" onClick={closeSidebar}>
                <FaUser className="icon" />
                <span className="menu-text">Employees</span>
              </Link>
            </li>
            <li className="logout-item">
              <Link to="/logout" className="sidebar-link" onClick={closeSidebar}>
                <FaSignOutAlt className="icon" />
                <span className="menu-text">Logout</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
