import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';
import { useAuth } from 'pages/Authentication/useAuth';

const ProfileDropdown = () => {
  const { user: u, logout } = useAuth();
  const [isProfileDropdown, setIsProfileDropdown] = useState(false);
  const toggleProfileDropdown = () => setIsProfileDropdown((v) => !v);

  const initials = `${u?.first_name?.[0] ?? ''}${u?.last_name?.[0] ?? ''}`.toUpperCase();

  return (
    <Dropdown isOpen={isProfileDropdown} toggle={toggleProfileDropdown} className="ms-sm-3 header-item topbar-user">
      <DropdownToggle tag="button" type="button" className="btn">
        <span className="d-flex align-items-center">
          <div className="avatar-xs">
            <span className="avatar-title rounded-circle bg-primary-subtle text-primary fw-bold fs-13">
              {initials}
            </span>
          </div>
          <span className="text-start ms-xl-2">
            <span className="d-none d-xl-inline-block ms-1 fw-medium user-name-text">
              {`${u?.first_name ?? ''} ${u?.last_name ?? ''} ( ${u?.setting?.site ?? ''} )`.toUpperCase()}
            </span>
            <span className="d-none d-xl-block ms-1 fs-12 text-muted user-name-sub-text">
              {`${u?.role ?? ''} - ${u?.email ?? ''}`}
            </span>
          </span>
        </span>
      </DropdownToggle>
      <DropdownMenu className="dropdown-menu-end">
        <h6 className="dropdown-header">Welcome {u?.first_name}!</h6>

        <DropdownItem className="p-0">
          <Link to="/pages-profile" className="dropdown-item">
            <i className="mdi mdi-wallet text-muted fs-16 align-middle me-1" />{' '}
            <span className="align-middle">Balance : <b>$5971.67</b></span>
          </Link>
        </DropdownItem>
        <DropdownItem className="p-0">
          <Link to="/pages-profile-settings" className="dropdown-item">
            <span className="badge bg-success-subtle text-success mt-1 float-end">New</span>
            <i className="mdi mdi-cog-outline text-muted fs-16 align-middle me-1" />{' '}
            <span className="align-middle">Settings</span>
          </Link>
        </DropdownItem>
        <div className="dropdown-divider" />
        <DropdownItem className="p-0">
          <button
            type="button"
            onClick={() => logout()}
            className="dropdown-item bg-transparent border-0 w-100 text-start"
          >
            <i className="mdi mdi-logout text-muted fs-16 align-middle me-1" />{' '}
            <span className="align-middle" data-key="t-logout">Logout</span>
          </button>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export default ProfileDropdown;