import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "./../context/auth.context";
import MenuLogo from "./../assets/img/menu-icon.jpg";
import ProfileLogo from "./../assets/img/profile-icon.jpg";

function NavBar() {
  const { isLoggedIn, isAdmin, setIsLoggedIn, loggedUserProfilImage } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <Disclosure as="nav" className="bg-zinc-700">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-full px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              {/* Bouton menu mobile */}
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                <DisclosureButton className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block size-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block size-6" aria-hidden="true" />
                  )}
                </DisclosureButton>
              </div>

              {/* Logo et menu desktop */}
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <NavLink className="flex shrink-0 items-center" to="/">
                  <img className="h-14" src={MenuLogo} alt="Logo site" />
                </NavLink>
              </div>

              {/* Icône notifications + profil */}
              <div className="absolute h-full inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                {isLoggedIn ? (
                  <Menu as="div" className="hidden sm:block relative ml-3">
                    <div>
                      <MenuButton className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                        <span className="sr-only">Open user menu</span>
                        <img
                          className="h-9 rounded-full"
                          src={loggedUserProfilImage ? loggedUserProfilImage : (ProfileLogo)}
                          alt="Profile"
                        />
                      </MenuButton>
                    </div>
                    <MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none">
                      <MenuItem>
                        {({ focus }) => (
                          <NavLink
                            to="/profile"
                            className={`${focus ? "bg-gray-100" : ""} block px-4 py-2 text-sm text-gray-700`}
                          >
                            Profil
                          </NavLink>
                        )}
                      </MenuItem>
                      {isAdmin && (
                        <MenuItem>
                          {({ focus }) => (
                            <NavLink
                              to="/admin/dashboard"
                              className={`${focus ? "bg-gray-100" : ""} block px-4 py-2 text-sm text-gray-700`}
                            >
                              Admin
                            </NavLink>
                          )}
                        </MenuItem>
                      )}
                      <MenuItem>
                        {({ focus }) => (
                          <button
                            onClick={handleLogout}
                            className={`${focus ? "bg-gray-100" : ""} block w-full text-left px-4 py-2 text-sm text-gray-700`}
                          >
                            Déconnexion
                          </button>
                        )}
                      </MenuItem>
                    </MenuItems>
                  </Menu>
                ) : (
                  <div className="hidden h-full sm:flex items-center gap-2">
                    <NavLink
                      to="/login"
                      className={({ isActive }) =>
                        `nav-link ${isActive ? "active" : ""}`
                      }
                    >
                      Connexion
                    </NavLink>
                    <NavLink
                      to="/register"
                      className={({ isActive }) =>
                        `nav-link ${isActive ? "active" : ""}`
                      }
                    >
                      Inscription
                    </NavLink>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Menu mobile */}
          <DisclosurePanel className="sm:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {isLoggedIn && (
                <>
                  <NavLink
                    to="/profile"
                    className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    Profil
                  </NavLink>
                  {isAdmin && (
                    <NavLink
                      to="/admin/dashboard"
                      className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                      Admin
                    </NavLink>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    Déconnexion
                  </button>
                </>
              )}
            </div>
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  );
}

export default NavBar;
