import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';

//import images
import avatar1 from "../../assets/images/users/avatar-1.jpg";
import { createSelector } from 'reselect';
import { useAuth } from 'pages/Authentication/useAuth';

const ProfileDropdown = () => {


    const profiledropdownData = createSelector(
        (state) => state.Profile,
        (user) => user.user
    );
    // Inside your component
    const { user: u } = useAuth();


    // const [userName, setUserName] = useState("Admin");

    // useEffect(() => {
    //     const authUser = sessionStorage.getItem("authUser");
    //     if (authUser) {
    //         const obj = JSON.parse(authUser);
    //         // setUserName(
    //         //     process.env.REACT_APP_DEFAULTAUTH === "fake"
    //         //         ? obj.username === undefined
    //         //             ? user.first_name || obj.data.first_name
    //         //             : "Admin"
    //         //         : process.env.REACT_APP_DEFAULTAUTH === "firebase"
    //         //             ? obj.email || "Admin"
    //         //             : "Admin"
    //         // );
    //     }
    // }, [userName, user]);

    //Dropdown Toggle
    const [isProfileDropdown, setIsProfileDropdown] = useState<boolean>(false);
    const toggleProfileDropdown = () => {
        setIsProfileDropdown(!isProfileDropdown);
    };
    return (
        <React.Fragment>
            <Dropdown isOpen={isProfileDropdown} toggle={toggleProfileDropdown} className="ms-sm-3 header-item topbar-user">
                <DropdownToggle tag="button" type="button" className="btn">
                    <span className="d-flex align-items-center">
                        <div className="avatar-xs">
                            <span className="avatar-title rounded-circle bg-primary-subtle text-primary fw-bold fs-13">
                                {`${u?.first_name[0]}${u?.last_name[0]}`.toLocaleUpperCase()}
                            </span>
                        </div>
                        <span className="text-start ms-xl-2">
                            <span className="d-none d-xl-inline-block ms-1 fw-medium user-name-text">{`${u?.first_name} ${u?.last_name} ( ${u?.setting?.site} )`.toLocaleUpperCase()}</span>
                            <span className="d-none d-xl-block ms-1 fs-12 text-muted user-name-sub-text">{`${u?.role} - ${u?.email}`}</span>
                        </span>
                    </span>
                </DropdownToggle>
                <DropdownMenu className="dropdown-menu-end">
                    <h6 className="dropdown-header">Welcome {u?.first_name}!</h6>

                    <DropdownItem className='p-0'>
                        <Link to="/pages-profile" className="dropdown-item">
                            <i
                                className="mdi mdi-wallet text-muted fs-16 align-middle me-1"></i> <span
                                    className="align-middle">Balance : <b>$5971.67</b></span>
                        </Link>
                    </DropdownItem >
                    <DropdownItem className='p-0'>
                        <Link to="/pages-profile-settings" className="dropdown-item">
                            <span
                                className="badge bg-success-subtle text-success mt-1 float-end">New</span><i
                                    className="mdi mdi-cog-outline text-muted fs-16 align-middle me-1"></i> <span
                                        className="align-middle">Settings</span>
                        </Link>
                    </DropdownItem>
                    <div className="dropdown-divider"></div>
                    <DropdownItem className='p-0'>
                        <Link to="/auth-lockscreen-basic" className="dropdown-item">
                            <i
                                className="mdi mdi-lock text-muted fs-16 align-middle me-1"></i> <span className="align-middle">Lock screen</span>
                        </Link>
                    </DropdownItem>
                    <DropdownItem className='p-0'>
                        <Link to="/logout" className="dropdown-item">
                            <i
                                className="mdi mdi-logout text-muted fs-16 align-middle me-1"></i> <span
                                    className="align-middle" data-key="t-logout">Logout</span>
                        </Link>
                    </DropdownItem>
                </DropdownMenu>
            </Dropdown>
        </React.Fragment>
    );
};

export default ProfileDropdown;