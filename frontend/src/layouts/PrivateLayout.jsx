import React, { useState, useEffect, Suspense } from "react";

// libraries
import { NavLink, Link, Outlet } from "react-router-dom";

// icons
import {
  FiHome,
  FiSettings,
  FiBell,
  FiMessageSquare,
  FiUser,
  FiLogOut,
} from "react-icons/fi";

import Avatar from "../assets/avatar.jpg";

const PrivateLayout = () => {
  const [isSidebarCollapsed, setisSidebarCollapsed] = useState(false);

  return (
    <div className="wrapper">
      <nav
        className={`sidebar js-sidebar ${isSidebarCollapsed && "collapsed"}`}
      >
        <div className="sidebar-content js-simplebar">
          <Link className="sidebar-brand" to="/">
            <span className="align-middle">CTPI</span>
          </Link>
          <ul className="sidebar-nav">
            <li className="sidebar-header">Pages</li>
            <li className="sidebar-item">
              <NavLink className="sidebar-link" to="/">
                <FiHome className="feather" />
                <span className="align-middle">Dashboard</span>
              </NavLink>
            </li>
            <li className="sidebar-item">
              <NavLink className="sidebar-link" to="/series">
                <FiHome className="feather" />
                <span className="align-middle">Series</span>
              </NavLink>
            </li>
            <li className="sidebar-item">
              <NavLink className="sidebar-link" to="/sermons">
                <FiHome className="feather" />
                <span className="align-middle">Sermons</span>
              </NavLink>
            </li>
          </ul>
        </div>
      </nav>
      <div className="main">
        <nav className="navbar navbar-expand navbar-light navbar-bg">
          <a
            className="sidebar-toggle js-sidebar-toggle"
            onClick={() => setisSidebarCollapsed(!isSidebarCollapsed)}
          >
            <i className="hamburger align-self-center" />
          </a>
          <div className="navbar-collapse collapse">
            <ul className="navbar-nav navbar-align">
              <li className="nav-item dropdown">
                <a
                  className="nav-icon dropdown-toggle"
                  data-bs-toggle="dropdown"
                >
                  <div className="position-relative">
                    <FiBell className="feather" />
                    <span className="indicator">4</span>
                  </div>
                </a>
                <div
                  className="dropdown-menu dropdown-menu-lg dropdown-menu-end py-0"
                  aria-labelledby="alertsDropdown"
                >
                  <div className="dropdown-menu-header">Notifications</div>
                  <div className="list-group">
                    <a className="list-group-item">
                      <div className="row g-0 align-items-center">
                        <div className="col-2">
                          <FiMessageSquare className="feather" />
                        </div>
                        <div className="col-10">
                          <div className="text-dark">Update completed</div>
                          <div className="text-muted small mt-1">
                            Restart server 12 to complete the update.
                          </div>
                          <div className="text-muted small mt-1">30m ago</div>
                        </div>
                      </div>
                    </a>
                  </div>
                  <div className="dropdown-menu-footer">
                    <a className="text-muted">Show all notifications</a>
                  </div>
                </div>
              </li>
              <li className="nav-item dropdown">
                <a
                  className="nav-icon dropdown-toggle"
                  data-bs-toggle="dropdown"
                >
                  <div className="position-relative">
                    <FiMessageSquare className="feather" />
                  </div>
                </a>
                <div
                  className="dropdown-menu dropdown-menu-lg dropdown-menu-end py-0"
                  aria-labelledby="messagesDropdown"
                >
                  <div className="dropdown-menu-header">
                    <div className="position-relative">Messages</div>
                  </div>
                  <div className="list-group">
                    <a className="list-group-item">
                      <div className="row g-0 align-items-center">
                        <div className="col-2">
                          <img
                            src={Avatar}
                            className="avatar img-fluid rounded-circle"
                            alt="Vanessa Tucker"
                          />
                        </div>
                        <div className="col-10 ps-2">
                          <div className="text-dark">Vanessa Tucker</div>
                          <div className="text-muted small mt-1">
                            Nam pretium turpis et arcu. Duis arcu tortor.
                          </div>
                          <div className="text-muted small mt-1">15m ago</div>
                        </div>
                      </div>
                    </a>
                  </div>
                  <div className="dropdown-menu-footer">
                    <a className="text-muted">Show all messages</a>
                  </div>
                </div>
              </li>
              <li className="nav-item dropdown">
                <a
                  className="nav-icon dropdown-toggle d-inline-block d-sm-none"
                  data-bs-toggle="dropdown"
                >
                  <i className="align-middle" data-feather="settings" />
                  <FiSettings className="feather" />
                </a>
                <a
                  className="nav-link dropdown-toggle d-none d-sm-inline-block"
                  data-bs-toggle="dropdown"
                >
                  <img
                    src={Avatar}
                    className="avatar img-fluid rounded me-1"
                    alt="Charles Hall"
                  />
                  <span className="text-dark me-1">hello</span>
                </a>
                <div className="dropdown-menu dropdown-menu-end">
                  <a className="dropdown-item">
                    <FiUser className="feather me-1" />
                    Profile
                  </a>

                  <button className="dropdown-item" onClick={() => {}}>
                    <FiLogOut className="feather me-1" />
                    Log out
                  </button>
                </div>
              </li>
            </ul>
          </div>
        </nav>
        <main className="content">
          <div className="container-fluid p-0">
            <Suspense fallback={<h1>Loading..</h1>}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PrivateLayout;
